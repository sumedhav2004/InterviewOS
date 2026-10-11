
import { beforeEach, describe, expect, it, vi } from "vitest";
import type WebSocket from "ws";

import { InterviewGateway } from "../../../src/realtime/websocket/interview.gateway";
import type { InterviewRoom } from "../../../src/realtime/websocket/interview-room";
import type { InterviewParticipantService } from "../../../src/services/interviewParticipant.service";
import type { InterviewQuestionService } from "../../../src/services/interview-question.service";
import type { InterviewRepository } from "../../../src/repositories/interview.repository";

vi.mock("@interview-os/logger", () => ({
    logger: {
        error: vi.fn(),
    },
}));

type TestSocket = WebSocket & {
    userId?: string;
    interviewId?: string;
};

describe("InterviewGateway", () => {
    let gateway: InterviewGateway;

    let room: {
        join: ReturnType<typeof vi.fn>;
        leave: ReturnType<typeof vi.fn>;
        getParticipants: ReturnType<typeof vi.fn>;
        getCodeSnapshot: ReturnType<typeof vi.fn>;
        getLanguageSnapshot: ReturnType<typeof vi.fn>;
        setCodeSnapshot: ReturnType<typeof vi.fn>;
        setLanguageSnapshot: ReturnType<typeof vi.fn>;
        broadcast: ReturnType<typeof vi.fn>;
        sendToParticipant: ReturnType<typeof vi.fn>;
    };

    let participantService: {
        authorizeParticipant: ReturnType<typeof vi.fn>;
    };

    let interviewQuestionService: {
        findActiveInterviewQuestion: ReturnType<typeof vi.fn>;
        setActiveInterviewQuestion: ReturnType<typeof vi.fn>;
        findById: ReturnType<typeof vi.fn>;
    };

    let interviewRepository: {
        updateInterview: ReturnType<typeof vi.fn>;
    };

    let socket: {
        userId?: string;
        interviewId?: string;
        send: ReturnType<typeof vi.fn>;
    };

    const participant = {
        id: "participant-1",
        userId: "user-1",
        role: "CANDIDATE",
    };

    function testSocket(): TestSocket {
        return socket as unknown as TestSocket;
    }

    
    function sentMessages() {
        return socket.send.mock.calls.map(([message]) =>
            JSON.parse(message as string),
        );
    }


    beforeEach(() => {
        vi.clearAllMocks();

        room = {
            join: vi.fn(),
            leave: vi.fn(),
            getParticipants: vi.fn().mockReturnValue([]),
            getCodeSnapshot: vi.fn().mockReturnValue(undefined),
            getLanguageSnapshot: vi.fn().mockReturnValue(undefined),
            setCodeSnapshot: vi.fn(),
            setLanguageSnapshot: vi.fn(),
            broadcast: vi.fn(),
            sendToParticipant: vi.fn(),
        };

        participantService = {
            authorizeParticipant: vi.fn().mockResolvedValue(participant),
        };

        interviewQuestionService = {
            findActiveInterviewQuestion: vi.fn().mockResolvedValue(null),
            setActiveInterviewQuestion: vi.fn().mockResolvedValue(undefined),
            findById: vi.fn().mockResolvedValue({ id: "question-1" }),
        };

        interviewRepository = {
            updateInterview: vi.fn().mockResolvedValue(undefined),
        };

        socket = {
            userId: "user-1",
            send: vi.fn(),
        };

        gateway = new InterviewGateway(
            room as unknown as InterviewRoom,
            participantService as unknown as InterviewParticipantService,
            interviewQuestionService as unknown as InterviewQuestionService,
            interviewRepository as unknown as InterviewRepository,
        );
    });

    describe("joinInterview", () => {
        it("rejects a non-string interview ID", async () => {
            await gateway.joinInterview(testSocket(), 123);

            expect(sentMessages()).toEqual([
                {
                    type: "ERROR",
                    message: "Interview ID is required",
                },
            ]);

            expect(participantService.authorizeParticipant).not.toHaveBeenCalled();
            expect(room.join).not.toHaveBeenCalled();
        });

        it("rejects an unauthenticated socket", async () => {
            socket.userId = undefined;

            await gateway.joinInterview(testSocket(), "interview-1");

            expect(sentMessages()).toEqual([
                { type: "ERROR", message: "Not authenticated" },
            ]);

            expect(participantService.authorizeParticipant).not.toHaveBeenCalled();
            expect(room.join).not.toHaveBeenCalled();
        });

        it("rejects a user who is not an authorized participant", async () => {
            participantService.authorizeParticipant.mockResolvedValue(null);

            await gateway.joinInterview(testSocket(), "interview-1");

            expect(participantService.authorizeParticipant).toHaveBeenCalledWith(
                "user-1",
                "interview-1",
            );

            expect(sentMessages()).toEqual([
                { type: "ERROR", message: "Participant not found" },
            ]);

            expect(room.join).not.toHaveBeenCalled();
            expect(room.broadcast).not.toHaveBeenCalled();
        });

        it("joins an authorized participant and sends the initial interview state", async () => {
            const existingParticipants = [
                { id: "participant-2", userId: "user-2" },
            ];
            const activeQuestion = {
                id: "question-1",
                title: "Question 1",
            };

            room.getParticipants.mockReturnValue(existingParticipants);
            room.getCodeSnapshot.mockReturnValue("console.log('hello')");
            room.getLanguageSnapshot.mockReturnValue("TYPESCRIPT");

            interviewQuestionService.findActiveInterviewQuestion.mockResolvedValue(
                activeQuestion,
            );

            await gateway.joinInterview(testSocket(), "interview-1");

            expect(socket.interviewId).toBe("interview-1");

            expect(room.getParticipants).toHaveBeenCalledWith("interview-1");

            expect(room.join).toHaveBeenCalledWith(
                "interview-1",
                "user-1",
                testSocket(),
                participant,
            );

            expect(sentMessages()).toEqual([
                {
                    type: "INTERVIEW_JOINED",
                    interviewId: "interview-1",
                    userId: "user-1",
                    participant,
                    participants: existingParticipants,
                },
                {
                    type: "CODE_SNAPSHOT",
                    code: "console.log('hello')",
                },
                {
                    type: "LANGUAGE_SNAPSHOT",
                    language: "TYPESCRIPT",
                },
                {
                    type: "ACTIVE_QUESTION_STATE",
                    interviewQuestion: activeQuestion,
                },
            ]);

            expect(
                interviewQuestionService.findActiveInterviewQuestion,
            ).toHaveBeenCalledWith("interview-1");

            expect(room.broadcast).toHaveBeenCalledWith(
                "interview-1",
                {
                    type: "PARTICIPANT_JOINED",
                    participant,
                },
                "user-1",
            );
        });

        it("does not send code or language snapshots when none exist", async () => {
            await gateway.joinInterview(testSocket(), "interview-1");

            expect(sentMessages()).toEqual([
                {
                    type: "INTERVIEW_JOINED",
                    interviewId: "interview-1",
                    userId: "user-1",
                    participant,
                    participants: [],
                },
                {
                    type: "ACTIVE_QUESTION_STATE",
                    interviewQuestion: null,
                },
            ]);
        });

        it("does not join when authorization throws an Error", async () => {
            participantService.authorizeParticipant.mockRejectedValue(
                new Error("Authorization failed"),
            );

            await gateway.joinInterview(testSocket(), "interview-1");

            expect(sentMessages()).toContainEqual({
                type: "ERROR",
                message: "Authorization failed",
            });

            expect(room.join).not.toHaveBeenCalled();
            expect(room.broadcast).not.toHaveBeenCalled();
        });

        it("uses a fallback error message when authorization throws a non-Error value", async () => {
            participantService.authorizeParticipant.mockRejectedValue(
                "unexpected failure",
            );

            await gateway.joinInterview(testSocket(), "interview-1");

            expect(sentMessages()).toContainEqual({
                type: "ERROR",
                message: "Unable to join interview",
            });

            expect(room.join).not.toHaveBeenCalled();
        });

        it("reports an error when loading the active question fails after joining", async () => {
            interviewQuestionService.findActiveInterviewQuestion.mockRejectedValue(
                new Error("Question lookup failed"),
            );

            await gateway.joinInterview(testSocket(), "interview-1");

            // Joining happens before the active-question lookup.
            expect(room.join).toHaveBeenCalled();
            expect(socket.interviewId).toBe("interview-1");

            expect(sentMessages()).toContainEqual({
                type: "ERROR",
                message: "Question lookup failed",
            });

            // The gateway exits through its catch block before broadcasting.
            expect(room.broadcast).not.toHaveBeenCalled();
        });
    });

    describe("setActiveQuestion", () => {
        beforeEach(() => {
            socket.interviewId = "interview-1";
        });

        it("rejects a socket that has not joined an interview", async () => {
            socket.interviewId = undefined;

            await gateway.setActiveQuestion(testSocket(), "question-1");

            expect(sentMessages()).toContainEqual({
                type: "ERROR",
                message: "Not joined to an interview",
            });

            expect(
                interviewQuestionService.setActiveInterviewQuestion,
            ).not.toHaveBeenCalled();
        });

        it("rejects a null question ID", async () => {
            await gateway.setActiveQuestion(testSocket(), null);

            expect(sentMessages()).toContainEqual({
                type: "ERROR",
                message: "InterviewQuestionId null",
            });

            expect(
                interviewQuestionService.setActiveInterviewQuestion,
            ).not.toHaveBeenCalled();

            expect(room.broadcast).not.toHaveBeenCalled();
        });

        it("sets the active question and broadcasts the change", async () => {
            const question = {
                id: "question-1",
                title: "Question 1",
            };

            interviewQuestionService.findById.mockResolvedValue(question);

            await gateway.setActiveQuestion(testSocket(), "question-1");

            expect(
                interviewQuestionService.setActiveInterviewQuestion,
            ).toHaveBeenCalledWith(
                "interview-1",
                "question-1",
                "user-1",
            );

            expect(interviewQuestionService.findById).toHaveBeenCalledWith(
                "question-1",
            );

            expect(room.broadcast).toHaveBeenCalledWith("interview-1", {
                type: "ACTIVE_QUESTION_CHANGED",
                interviewQuestion: question,
                changedByUserId: "user-1",
            });
        });

        it("reports service errors without broadcasting a change", async () => {
            interviewQuestionService.setActiveInterviewQuestion.mockRejectedValue(
                new Error("Permission denied"),
            );

            await gateway.setActiveQuestion(testSocket(), "question-1");

            expect(sentMessages()).toContainEqual({
                type: "ERROR",
                message: "Permission denied",
            });

            expect(interviewQuestionService.findById).not.toHaveBeenCalled();
            expect(room.broadcast).not.toHaveBeenCalled();
        });

        it("reports an error when the question lookup fails", async () => {
            interviewQuestionService.findById.mockRejectedValue(
                new Error("Question lookup failed"),
            );

            await gateway.setActiveQuestion(testSocket(), "question-1");

            expect(
                interviewQuestionService.setActiveInterviewQuestion,
            ).toHaveBeenCalledWith(
                "interview-1",
                "question-1",
                "user-1",
            );

            expect(sentMessages()).toContainEqual({
                type: "ERROR",
                message: "Question lookup failed",
            });

            expect(room.broadcast).not.toHaveBeenCalled();
        });
    });

    describe("handleLanguageChange", () => {
        const message = {
            type: "LANGUAGE_CHANGE" as const,
            language: "TYPESCRIPT",
        };

        beforeEach(() => {
            socket.interviewId = "interview-1";
        });

        it("rejects a socket that has not joined an interview", async () => {
            socket.interviewId = undefined;

            await gateway.handleLanguageChange(testSocket(), message);

            expect(sentMessages()).toContainEqual({
                type: "ERROR",
                message: "Not joined to an interview",
            });

            expect(participantService.authorizeParticipant).not.toHaveBeenCalled();
        });

        it("rejects an empty programming language", async () => {
            await gateway.handleLanguageChange(testSocket(), {
                ...message,
                language: "",
            });

            expect(sentMessages()).toContainEqual({
                type: "ERROR",
                message: "Programming language is required",
            });

            expect(participantService.authorizeParticipant).not.toHaveBeenCalled();
            expect(interviewRepository.updateInterview).not.toHaveBeenCalled();
        });

        it("prevents a non-candidate from changing the language", async () => {
            participantService.authorizeParticipant.mockResolvedValue({
                ...participant,
                role: "INTERVIEWER",
            });

            await gateway.handleLanguageChange(testSocket(), message);

            expect(sentMessages()).toContainEqual({
                type: "ERROR",
                message: "Only the candidate can change the programming language",
            });

            expect(interviewRepository.updateInterview).not.toHaveBeenCalled();
            expect(room.setLanguageSnapshot).not.toHaveBeenCalled();
            expect(room.broadcast).not.toHaveBeenCalled();
        });

        it("updates the language, saves the snapshot, and broadcasts the change", async () => {
            await gateway.handleLanguageChange(testSocket(), message);

            expect(participantService.authorizeParticipant).toHaveBeenCalledWith(
                "user-1",
                "interview-1",
            );

            expect(interviewRepository.updateInterview).toHaveBeenCalledWith(
                "interview-1",
                { language: "TYPESCRIPT" },
            );

            expect(room.setLanguageSnapshot).toHaveBeenCalledWith(
                "interview-1",
                "TYPESCRIPT",
            );

            expect(room.broadcast).toHaveBeenCalledWith("interview-1", {
                type: "LANGUAGE_CHANGED",
                language: "TYPESCRIPT",
                changedByUserId: "user-1",
            });
        });

        it("reports an error if participant authorization throws", async () => {
            participantService.authorizeParticipant.mockRejectedValue(
                new Error("Authorization service unavailable"),
            );

            await gateway.handleLanguageChange(testSocket(), message);

            expect(sentMessages()).toContainEqual({
                type: "ERROR",
                message: "Unable to change programming language",
            });

            expect(interviewRepository.updateInterview).not.toHaveBeenCalled();
            expect(room.broadcast).not.toHaveBeenCalled();
        });

        it("reports an error if updating the language fails", async () => {
            interviewRepository.updateInterview.mockRejectedValue(
                new Error("Database unavailable"),
            );

            await gateway.handleLanguageChange(testSocket(), message);

            expect(sentMessages()).toContainEqual({
                type: "ERROR",
                message: "Unable to change programming language",
            });

            expect(room.setLanguageSnapshot).not.toHaveBeenCalled();
            expect(room.broadcast).not.toHaveBeenCalled();
        });
    });

    describe("leaveInterview", () => {
        it("does nothing if the socket has not joined an interview", () => {
            socket.interviewId = undefined;

            gateway.leaveInterview(testSocket());

            expect(room.leave).not.toHaveBeenCalled();
            expect(room.broadcast).not.toHaveBeenCalled();
        });

        it("does nothing if the socket has no authenticated user", () => {
            socket.userId = undefined;
            socket.interviewId = "interview-1";

            gateway.leaveInterview(testSocket());

            expect(room.leave).not.toHaveBeenCalled();
            expect(room.broadcast).not.toHaveBeenCalled();
        });

        it("removes the participant, broadcasts their departure, and clears the interview ID", () => {
            socket.interviewId = "interview-1";

            gateway.leaveInterview(testSocket());

            expect(room.leave).toHaveBeenCalledWith(
                "interview-1",
                "user-1",
            );

            expect(room.broadcast).toHaveBeenCalledWith("interview-1", {
                type: "PARTICIPANT_LEFT",
                userId: "user-1",
            });

            expect(socket.interviewId).toBeUndefined();
        });
    });

    describe("handleWebRTCSignal", () => {
        beforeEach(() => {
            socket.interviewId = "interview-1";
        });

        it("rejects signaling from a socket that has not joined", () => {
            socket.interviewId = undefined;

            gateway.handleWebRTCSignal(testSocket(), {
                type: "WEBRTC_OFFER",
                targetUserId: "user-2",
                offer: { type: "offer", sdp: "test-sdp" },
            });

            expect(sentMessages()).toContainEqual({
                type: "ERROR",
                message: "Not joined to an interview",
            });

            expect(room.sendToParticipant).not.toHaveBeenCalled();
        });

        it("rejects a missing target participant", () => {
            gateway.handleWebRTCSignal(testSocket(), {
                type: "WEBRTC_OFFER",
                targetUserId: "",
            });

            expect(sentMessages()).toContainEqual({
                type: "ERROR",
                message: "Target participant is required",
            });

            expect(room.sendToParticipant).not.toHaveBeenCalled();
        });

        it("routes a WebRTC offer to the target participant", () => {
            const offer = {
                type: "offer" as const,
                sdp: "test-sdp",
            };

            gateway.handleWebRTCSignal(testSocket(), {
                type: "WEBRTC_OFFER",
                targetUserId: "user-2",
                offer,
            });

            expect(room.sendToParticipant).toHaveBeenCalledWith(
                "interview-1",
                "user-2",
                {
                    type: "WEBRTC_OFFER",
                    fromUserId: "user-1",
                    offer,
                },
            );
        });

        it("routes a WebRTC answer without adding an offer or candidate", () => {
            const answer = {
                type: "answer" as const,
                sdp: "answer-sdp",
            };

            gateway.handleWebRTCSignal(testSocket(), {
                type: "WEBRTC_ANSWER",
                targetUserId: "user-2",
                answer,
            });

            expect(room.sendToParticipant).toHaveBeenCalledWith(
                "interview-1",
                "user-2",
                {
                    type: "WEBRTC_ANSWER",
                    fromUserId: "user-1",
                    answer,
                },
            );
        });

        it("routes an ICE candidate without adding unrelated signal fields", () => {
            const candidate = {
                candidate: "candidate-data",
            };

            gateway.handleWebRTCSignal(testSocket(), {
                type: "WEBRTC_ICE_CANDIDATE",
                targetUserId: "user-2",
                candidate,
            });

            expect(room.sendToParticipant).toHaveBeenCalledWith(
                "interview-1",
                "user-2",
                {
                    type: "WEBRTC_ICE_CANDIDATE",
                    fromUserId: "user-1",
                    candidate,
                },
            );
        });

        it("does not route signaling when the sender is unauthenticated", () => {
            socket.userId = undefined;

            gateway.handleWebRTCSignal(testSocket(), {
                type: "WEBRTC_OFFER",
                targetUserId: "user-2",
                offer: { type: "offer", sdp: "test-sdp" },
            });

            expect(sentMessages()).toContainEqual({
                type: "ERROR",
                message: "Not joined to an interview",
            });

            expect(room.sendToParticipant).not.toHaveBeenCalled();
        });
    });

    describe("handleMediaState", () => {
        beforeEach(() => {
            socket.interviewId = "interview-1";
        });

        it("rejects a socket that has not joined an interview", () => {
            socket.interviewId = undefined;

            gateway.handleMediaState(testSocket(), {
                type: "MEDIA_STATE",
                cameraEnabled: true,
                microphoneEnabled: false,
            });

            expect(sentMessages()).toContainEqual({
                type: "ERROR",
                message: "Not joined to an interview",
            });

            expect(room.broadcast).not.toHaveBeenCalled();
        });

        it("broadcasts media state to other participants, excluding the sender", () => {
            gateway.handleMediaState(testSocket(), {
                type: "MEDIA_STATE",
                cameraEnabled: true,
                microphoneEnabled: false,
            });

            expect(room.broadcast).toHaveBeenCalledWith(
                "interview-1",
                {
                    type: "MEDIA_STATE",
                    userId: "user-1",
                    cameraEnabled: true,
                    microphoneEnabled: false,
                },
                "user-1",
            );
        });

        it("broadcasts disabled camera and microphone states correctly", () => {
            gateway.handleMediaState(testSocket(), {
                type: "MEDIA_STATE",
                cameraEnabled: false,
                microphoneEnabled: false,
            });

            expect(room.broadcast).toHaveBeenCalledWith(
                "interview-1",
                {
                    type: "MEDIA_STATE",
                    userId: "user-1",
                    cameraEnabled: false,
                    microphoneEnabled: false,
                },
                "user-1",
            );
        });
    });

    describe("handleCodeChange", () => {
        beforeEach(() => {
            socket.interviewId = "interview-1";
        });

        it("rejects a socket that has not joined an interview", () => {
            socket.interviewId = undefined;

            gateway.handleCodeChange(testSocket(), {
                type: "CODE_CHANGE",
                code: "updated code",
            });

            expect(sentMessages()).toContainEqual({
                type: "ERROR",
                message: "Not joined to an interview",
            });

            expect(room.setCodeSnapshot).not.toHaveBeenCalled();
            expect(room.broadcast).not.toHaveBeenCalled();
        });

        it("saves the latest code and broadcasts it to other participants", () => {
            gateway.handleCodeChange(testSocket(), {
                type: "CODE_CHANGE",
                code: "console.log('updated')",
            });

            expect(room.setCodeSnapshot).toHaveBeenCalledWith(
                "interview-1",
                "console.log('updated')",
            );

            expect(room.broadcast).toHaveBeenCalledWith(
                "interview-1",
                {
                    type: "CODE_CHANGE",
                    userId: "user-1",
                    code: "console.log('updated')",
                },
                "user-1",
            );
        });

        it("stores an empty code string without changing gateway behavior", () => {
            gateway.handleCodeChange(testSocket(), {
                type: "CODE_CHANGE",
                code: "",
            });

            expect(room.setCodeSnapshot).toHaveBeenCalledWith(
                "interview-1",
                "",
            );

            expect(room.broadcast).toHaveBeenCalledWith(
                "interview-1",
                {
                    type: "CODE_CHANGE",
                    userId: "user-1",
                    code: "",
                },
                "user-1",
            );
        });
    });
});
