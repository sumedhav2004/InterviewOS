
import { beforeEach, describe, expect, it, vi } from "vitest";
import WebSocket from "ws";
import {
    InterviewRoom,
    type InterviewRoomParticipant,
} from "../../../src/realtime/websocket/interview-room";

const OPEN = WebSocket.OPEN;

function createSocket(readyState:number = OPEN) {
    return {
        readyState,
        send: vi.fn(),
    } as unknown as WebSocket & { send: ReturnType<typeof vi.fn> };
}

function participant(
    id: string,
    userId: string,
    role: InterviewRoomParticipant["role"] = "CANDIDATE",
): InterviewRoomParticipant {
    return { id, userId, role };
}

describe("InterviewRoom", () => {
    let room: InterviewRoom;

    beforeEach(() => {
        room = new InterviewRoom();
        vi.spyOn(console, "log").mockImplementation(() => {});
    });

    it("should create a room and return true when a participant joins for the first time", () => {
        const socket = createSocket();
        const person = participant("p1", "user-1");

        expect(room.join("interview-1", "user-1", socket, person)).toBe(true);
        expect(room.getParticipants("interview-1")).toEqual([person]);
        expect(room.getCodeSnapshot("interview-1")).toContain("function solution()");
    });

    it("should return false for a duplicate join while updating that user's entry", () => {
        const firstSocket = createSocket();
        const secondSocket = createSocket();
        const firstPerson = participant("p1", "user-1");
        const updatedPerson = participant("p2", "user-1", "INTERVIEWER");

        room.join("interview-1", "user-1", firstSocket, firstPerson);

        expect(
            room.join("interview-1", "user-1", secondSocket, updatedPerson),
        ).toBe(false);

        expect(room.getParticipants("interview-1")).toEqual([updatedPerson]);

        room.sendToParticipant("interview-1", "user-1", { type: "PING" });
        expect(secondSocket.send).toHaveBeenCalledWith(
            JSON.stringify({ type: "PING" }),
        );
        expect(firstSocket.send).not.toHaveBeenCalled();
    });

    it("should remove a participant without deleting a room that still has members", () => {
        room.join(
            "interview-1",
            "user-1",
            createSocket(),
            participant("p1", "user-1"),
        );
        room.join(
            "interview-1",
            "user-2",
            createSocket(),
            participant("p2", "user-2", "INTERVIEWER"),
        );

        room.leave("interview-1", "user-1");

        expect(room.getParticipants("interview-1")).toEqual([
            participant("p2", "user-2", "INTERVIEWER"),
        ]);
    });

    it("should clear room and snapshots when the last participant leaves", () => {
        room.join(
            "interview-1",
            "user-1",
            createSocket(),
            participant("p1", "user-1"),
        );
        room.setCodeSnapshot("interview-1", "custom code");
        room.setLanguageSnapshot("interview-1", "typescript");

        room.leave("interview-1", "user-1");

        expect(room.getParticipants("interview-1")).toEqual([]);
        expect(room.getCodeSnapshot("interview-1")).toBeUndefined();
        expect(room.getLanguageSnapshot("interview-1")).toBeUndefined();
    });

    it("should safely leave a room that does not exist", () => {
        expect(() => room.leave("missing-interview", "user-1")).not.toThrow();
        expect(room.getParticipants("missing-interview")).toEqual([]);
    });

    it("should keep code and language snapshots independent between interviews", () => {
        room.setCodeSnapshot("interview-1", "console.log('one')");
        room.setCodeSnapshot("interview-2", "console.log('two')");
        room.setLanguageSnapshot("interview-1", "javascript");
        room.setLanguageSnapshot("interview-2", "python");

        expect(room.getCodeSnapshot("interview-1")).toBe("console.log('one')");
        expect(room.getCodeSnapshot("interview-2")).toBe("console.log('two')");
        expect(room.getLanguageSnapshot("interview-1")).toBe("javascript");
        expect(room.getLanguageSnapshot("interview-2")).toBe("python");
    });

    it("should send JSON to a participant whose socket is open", () => {
        const socket = createSocket();
        room.join(
            "interview-1",
            "user-1",
            socket,
            participant("p1", "user-1"),
        );
        const message = { type: "CODE_UPDATE", code: "return 42;" };

        expect(
            room.sendToParticipant("interview-1", "user-1", message),
        ).toBe(true);
        expect(socket.send).toHaveBeenCalledWith(JSON.stringify(message));
    });

    it("should return false when direct messaging a missing room, missing user, or closed socket", () => {
        expect(
            room.sendToParticipant("missing-room", "user-1", { type: "PING" }),
        ).toBe(false);

        room.join(
            "interview-1",
            "user-1",
            createSocket(),
            participant("p1", "user-1"),
        );

        expect(
            room.sendToParticipant("interview-1", "missing-user", { type: "PING" }),
        ).toBe(false);

        const closedSocket = createSocket(WebSocket.CLOSED);
        room.join(
            "interview-1",
            "user-2",
            closedSocket,
            participant("p2", "user-2"),
        );

        expect(
            room.sendToParticipant("interview-1", "user-2", { type: "PING" }),
        ).toBe(false);
        expect(closedSocket.send).not.toHaveBeenCalled();
    });

    it("should broadcast to open sockets except the excluded user", () => {
        const socket1 = createSocket();
        const socket2 = createSocket();
        const socket3 = createSocket();

        room.join("interview-1", "user-1", socket1, participant("p1", "user-1"));
        room.join("interview-1", "user-2", socket2, participant("p2", "user-2"));
        room.join("interview-1", "user-3", socket3, participant("p3", "user-3"));

        const message = { type: "INTERVIEW_STARTED" };
        room.broadcast("interview-1", message, "user-2");

        expect(socket1.send).toHaveBeenCalledWith(JSON.stringify(message));
        expect(socket2.send).not.toHaveBeenCalled();
        expect(socket3.send).toHaveBeenCalledWith(JSON.stringify(message));
    });

    it("should not send broadcasts to closed sockets or throw when the room is missing", () => {
        const openSocket = createSocket();
        const closedSocket = createSocket(WebSocket.CLOSED);

        room.join("interview-1", "user-1", openSocket, participant("p1", "user-1"));
        room.join("interview-1", "user-2", closedSocket, participant("p2", "user-2"));

        room.broadcast("interview-1", { type: "PING" });

        expect(openSocket.send).toHaveBeenCalledWith(JSON.stringify({ type: "PING" }));
        expect(closedSocket.send).not.toHaveBeenCalled();

        expect(() => room.broadcast("missing-room", { type: "PING" })).not.toThrow();
    });
});