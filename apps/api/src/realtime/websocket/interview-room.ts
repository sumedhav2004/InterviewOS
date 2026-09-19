import WebSocket from "ws";

export class InterviewRoom {
    private readonly rooms = new Map<string, Map<string, WebSocket>>();

    join(
        interviewId: string,
        userId: string,
        socket: WebSocket,
    ) {
        let room = this.rooms.get(interviewId);

        if (!room) {
            room = new Map();
            this.rooms.set(interviewId, room);
        }

        const alreadyJoined = room.has(userId);

        room.set(userId, socket);

        return !alreadyJoined;
    }

    leave(
        interviewId: string,
        userId: string,
    ) {
        const room = this.rooms.get(interviewId);

        if (!room) {
            return;
        }

        room.delete(userId);

        if (room.size === 0) {
            this.rooms.delete(interviewId);
        }
    }

    getParticipants(interviewId: string) {
        const room = this.rooms.get(interviewId);

        if (!room) {
            return [];
        }

        return Array.from(room.keys());
    }

    broadcast(
        interviewId: string,
        message: unknown,
        excludeUserId?: string,
    ) {
        const room = this.rooms.get(interviewId);

        if (!room) {
            return;
        }

        const payload = JSON.stringify(message);

        for (const [userId, socket] of room) {
            if (userId === excludeUserId) {
                continue;
            }

            if (socket.readyState === WebSocket.OPEN) {
                socket.send(payload);
            }
        }
    }
}