import WebSocket from "ws";

import { InterviewRoom } from "./interview-room";
import { InterviewParticipantService } from "../../services/interviewParticipant.service";
import { logger } from "@interview-os/logger";
import { InterviewQuestionService } from "../../services/interview-question.service";
import { InterviewRepository } from "../../repositories/interview.repository";

type AuthenticatedSocket = WebSocket & {
    userId?: string;
    interviewId?: string;
};

export class InterviewGateway {
    constructor(
        private readonly room: InterviewRoom,
        private readonly participantService = new InterviewParticipantService(),
        private readonly interviewQuestionService = new InterviewQuestionService(),
        private readonly interviewRepository = new InterviewRepository(),
        
    ) {}

    async joinInterview(
        socket: AuthenticatedSocket,
        interviewId: unknown,
    ) {
        if (typeof interviewId !== "string") {
            this.sendError(socket, "Interview ID is required");
            return;
        }

        if (!socket.userId) {
            this.sendError(socket, "Not authenticated");
            return;
        }

        try {
            const participant =
                await this.participantService.authorizeParticipant(
                    socket.userId,
                    interviewId,
                );

            const existingParticipants =
                this.room.getParticipants(interviewId);

            socket.interviewId = interviewId;

            this.room.join(interviewId, socket.userId, socket);

            socket.send(JSON.stringify({
                type: "INTERVIEW_JOINED",
                interviewId,
                userId: socket.userId,
                role: participant?.role ?? "INTERVIEWER",
                participants: existingParticipants,
            }));

            const codeSnapshot =
                this.room.getCodeSnapshot(interviewId);

            if (codeSnapshot !== undefined) {
                socket.send(
                    JSON.stringify({
                        type: "CODE_SNAPSHOT",
                        code: codeSnapshot,
                    }),
                );
            }

            const languageSnapshot =
                this.room.getLanguageSnapshot(interviewId);

            if (languageSnapshot !== undefined) {
                socket.send(
                    JSON.stringify({
                        type: "LANGUAGE_SNAPSHOT",
                        language: languageSnapshot,
                    }),
                );
            }
            
            const activeInterviewQuestion =
                await this.interviewQuestionService.findActiveInterviewQuestion(
                    interviewId,
                );

            socket.send(
                JSON.stringify({
                    type: "ACTIVE_QUESTION_STATE",
                    interviewQuestion: activeInterviewQuestion,
                }),
            );

            this.room.broadcast(
                interviewId,
                {
                    type: "PARTICIPANT_JOINED",
                    userId: socket.userId,
                },
                socket.userId,
            );
        } catch (error) {
            logger.error(
                {
                    error,
                    userId: socket.userId,
                    interviewId,
                },
                "Failed to join interview",
            );

            this.sendError(
                socket,
                error instanceof Error
                    ? error.message
                    : "Unable to join interview",
            );
        }
    }

    async setActiveQuestion(
        socket: AuthenticatedSocket,
        interviewQuestionId: string | null,
    ) {
        if (!socket.userId || !socket.interviewId) {
            this.sendError(socket, "Not joined to an interview");
            return;
        }

        try {
            await this.interviewQuestionService.setActiveInterviewQuestion(
                socket.interviewId,
                interviewQuestionId,
                socket.userId,
            );

            const activeInterviewQuestion =
                interviewQuestionId
                    ? await this.interviewQuestionService.findById(
                        interviewQuestionId,
                    )
                    : null;

            this.room.broadcast(
                socket.interviewId,
                {
                    type: "ACTIVE_QUESTION_CHANGED",
                    interviewQuestion: activeInterviewQuestion,
                    changedByUserId: socket.userId,
                },
            );
        } catch (error) {
            logger.error(
                {
                    error,
                    userId: socket.userId,
                    interviewId: socket.interviewId,
                    interviewQuestionId,
                },
                "Failed to set active interview question",
            );

            this.sendError(
                socket,
                error instanceof Error
                    ? error.message
                    : "Unable to set active interview question",
            );
        }
    }

    async handleLanguageChange(
        socket: AuthenticatedSocket,
        message: {
            type: "LANGUAGE_CHANGE";
            language: string;
        },
    ) {
        if (!socket.userId || !socket.interviewId) {
            this.sendError(socket, "Not joined to an interview");
            return;
        }

        if (!message.language) {
            this.sendError(socket, "Programming language is required");
            return;
        }

        try {
            const participant =
                await this.participantService.authorizeParticipant(
                    socket.userId,
                    socket.interviewId,
                );

            if (!participant) {
                this.sendError(socket, "Participant not found");
                return;
            }

            if (participant.role !== "CANDIDATE") {
                this.sendError(
                    socket,
                    "Only the candidate can change the programming language",
                );
                return;
            }

            await this.interviewRepository.updateInterview(
                socket.interviewId,
                {
                    language: message.language,
                },
            );

            this.room.setLanguageSnapshot(
                socket.interviewId,
                message.language,
            );

            this.room.broadcast(
                socket.interviewId,
                {
                    type: "LANGUAGE_CHANGED",
                    language: message.language,
                    changedByUserId: socket.userId,
                },
            );
        } catch (error) {
            logger.error(
                {
                    error,
                    userId: socket.userId,
                    interviewId: socket.interviewId,
                    language: message.language,
                },
                "Failed to change programming language",
            );

            this.sendError(
                socket,
                "Unable to change programming language",
            );
        }
    }
    leaveInterview(socket: AuthenticatedSocket) {
        if (!socket.userId || !socket.interviewId) {
            return;
        }

        const { userId, interviewId } = socket;

        this.room.leave(interviewId, userId);

        this.room.broadcast(
            interviewId,
            {
                type: "PARTICIPANT_LEFT",
                userId,
            },
        );

        socket.interviewId = undefined;
    }

    handleWebRTCSignal(
        socket: AuthenticatedSocket,
        message: {
            type:
                | "WEBRTC_OFFER"
                | "WEBRTC_ANSWER"
                | "WEBRTC_ICE_CANDIDATE";
            targetUserId: string;
            offer?: RTCSessionDescriptionInit;
            answer?: RTCSessionDescriptionInit;
            candidate?: RTCIceCandidateInit;
        },
    ) {
        if (!socket.userId || !socket.interviewId) {
            this.sendError(socket, "Not joined to an interview");
            return;
        }

        if (!message.targetUserId) {
            this.sendError(socket, "Target participant is required");
            return;
        }

        const payload = {
            type: message.type,
            fromUserId: socket.userId,
            ...(message.type === "WEBRTC_OFFER"
                ? { offer: message.offer }
                : {}),
            ...(message.type === "WEBRTC_ANSWER"
                ? { answer: message.answer }
                : {}),
            ...(message.type === "WEBRTC_ICE_CANDIDATE"
                ? { candidate: message.candidate }
                : {}),
        };

        this.room.sendToParticipant(
            socket.interviewId,
            message.targetUserId,
            payload,
        );

    }

    handleMediaState(
        socket: AuthenticatedSocket,
        message: {
            type: "MEDIA_STATE";
            cameraEnabled: boolean;
            microphoneEnabled: boolean;
        },
    ) {
        if (!socket.userId || !socket.interviewId) {
            this.sendError(socket, "Not joined to an interview");
            return;
        }

        const payload = {
            type: "MEDIA_STATE",
            userId: socket.userId,
            cameraEnabled: message.cameraEnabled,
            microphoneEnabled: message.microphoneEnabled,
        };

        this.room.broadcast(
            socket.interviewId,
            payload,
            socket.userId,
        );
    }

    handleCodeChange(
        socket: AuthenticatedSocket,
        message: {
            type: "CODE_CHANGE";
            code: string;
        },
    ) {
        if (!socket.userId || !socket.interviewId) {
            this.sendError(socket, "Not joined to an interview");
            return;
        }

        this.room.setCodeSnapshot(
            socket.interviewId,
            message.code,
        );

        const payload = {
            type: "CODE_CHANGE",
            userId: socket.userId,
            code: message.code,
        };

        this.room.broadcast(
            socket.interviewId,
            payload,
            socket.userId,
        );
    }


    private sendError(
        socket: WebSocket,
        message: string,
    ) {
        socket.send(
            JSON.stringify({
                type: "ERROR",
                message,
            }),
        );
    }
}