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