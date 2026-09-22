import WebSocket from "ws";

import { InterviewRoom } from "./interview-room";
import { InterviewParticipantService } from "../../services/interviewParticipant.service";
import { logger } from "@interview-os/logger";

type AuthenticatedSocket = WebSocket & {
    userId?: string;
    interviewId?: string;
};

export class InterviewGateway {
    constructor(
        private readonly room: InterviewRoom,
        private readonly participantService = new InterviewParticipantService(),
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
            await this.participantService.authorizeParticipant(
                socket.userId,
                interviewId,
            );

            const existingParticipants = this.room.getParticipants(interviewId);

            socket.interviewId = interviewId;

            this.room.join(interviewId, socket.userId, socket);

            socket.send(JSON.stringify({
                type: "INTERVIEW_JOINED",
                interviewId,
                userId: socket.userId,
                participants: existingParticipants,
            }));

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