import WebSocket from "ws";

const DEFAULT_CODE = `function solution() {
  // Start coding...
}`;

export class InterviewRoom {
    private readonly rooms = new Map<
        string,
        Map<string, WebSocket>
    >();

    private readonly codeSnapshots = new Map<
        string,
        string
    >();

    join(
        interviewId: string,
        userId: string,
        socket: WebSocket,
    ) {
        let room = this.rooms.get(interviewId);

        if (!room) {
            room = new Map();
            this.rooms.set(interviewId, room);

            this.codeSnapshots.set(
                interviewId,
                DEFAULT_CODE,
            );
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
            this.codeSnapshots.delete(interviewId);
        }
    }

    getParticipants(interviewId: string) {
        const room = this.rooms.get(interviewId);

        if (!room) {
            return [];
        }

        return Array.from(room.keys());
    }

    getCodeSnapshot(interviewId: string) {
        return this.codeSnapshots.get(interviewId);
    }

    setCodeSnapshot(
        interviewId: string,
        code: string,
    ) {
        this.codeSnapshots.set(
            interviewId,
            code,
        );
    }

    sendToParticipant(
        interviewId: string,
        userId: string,
        message: unknown,
    ) {
        const room = this.rooms.get(interviewId);

        if (!room) {
            return false;
        }

        const socket = room.get(userId);

        if (
            !socket ||
            socket.readyState !== WebSocket.OPEN
        ) {
            return false;
        }

        socket.send(JSON.stringify(message));

        return true;
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