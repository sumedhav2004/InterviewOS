import WebSocket from "ws";

export type InterviewRoomParticipant = {
    id: string;
    userId: string;
    role: "INTERVIEWER" | "CANDIDATE" | "OBSERVER";
};

type RoomParticipant = {
    participant: InterviewRoomParticipant;
    socket: WebSocket;
};

const DEFAULT_CODE = `function solution() {
  // Start coding...
}`;

export class InterviewRoom {
    private readonly rooms = new Map<
        string,
        Map<string, RoomParticipant>
    >();

    private readonly codeSnapshots = new Map<
        string,
        string
    >();

    private readonly languageSnapshots = new Map<
        string,
        string
    >();

    join(
        interviewId: string,
        userId: string,
        socket: WebSocket,
        participant: InterviewRoomParticipant,
    ) {
        let room = this.rooms.get(interviewId);

        if (!room) {
            room = new Map();

            this.rooms.set(
                interviewId,
                room,
            );

            this.codeSnapshots.set(
                interviewId,
                DEFAULT_CODE,
            );
        }

        const alreadyJoined = room.has(userId);

        room.set(userId, {
            participant,
            socket,
        });

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
            this.languageSnapshots.delete(interviewId);
        }
    }

    getParticipants(
        interviewId: string,
    ): InterviewRoomParticipant[] {
        const room = this.rooms.get(interviewId);

        if (!room) {
            return [];
        }

        return Array.from(room.values()).map(
            ({ participant }) => participant,
        );
    }

    getCodeSnapshot(
        interviewId: string,
    ) {
        return this.codeSnapshots.get(
            interviewId,
        );
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

    setLanguageSnapshot(
        interviewId: string,
        language: string,
    ) {
        this.languageSnapshots.set(
            interviewId,
            language,
        );
    }

    getLanguageSnapshot(
        interviewId: string,
    ) {
        return this.languageSnapshots.get(
            interviewId,
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

        const entry = room.get(userId);

        if (!entry) {
            return false;
        }

        const { socket } = entry;

        if (
            socket.readyState !== WebSocket.OPEN
        ) {
            return false;
        }

        socket.send(
            JSON.stringify(message),
        );

        return true;
    }

    broadcast(
        interviewId: string,
        message: unknown,
        excludeUserId?: string,
    ) {
        const room = this.rooms.get(interviewId);

        console.log(
            "[WS ROOM] BROADCAST",
            {
                interviewId,
                message,
                connectedUsers: room
                    ? Array.from(room.keys())
                    : [],
            },
        );

        if (!room) {
            console.log(
                "[WS ROOM] NO ROOM FOUND",
                interviewId,
            );

            return;
        }

        const payload =
            JSON.stringify(message);

        for (
            const [userId, entry]
            of room
        ) {
            if (
                userId ===
                excludeUserId
            ) {
                continue;
            }

            const { socket } = entry;

            if (
                socket.readyState ===
                WebSocket.OPEN
            ) {
                console.log(
                    "[WS ROOM] SENDING TO",
                    userId,
                    message,
                );

                socket.send(payload);
            }
        }
    }
}