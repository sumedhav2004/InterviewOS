
import { beforeEach, describe, expect, it, vi } from "vitest";
import type WebSocket from "ws";
import type { Server as HttpServer } from "http";

import { RealtimeWebSocketServer } from "../../../src/realtime/websocket/websocket-server";
import type { InterviewRoom } from "../../../src/realtime/websocket/interview-room";

const mocks = vi.hoisted(() => ({
    wssOptions: undefined as
        | { server: unknown; path: string }
        | undefined,

    connectionHandler: undefined as
        | ((socket: unknown) => void)
        | undefined,

    authenticateWebSocketToken: vi.fn(),

    gateway: {
        joinInterview: vi.fn(),
        setActiveQuestion: vi.fn(),
        handleWebRTCSignal: vi.fn(),
        handleMediaState: vi.fn(),
        handleCodeChange: vi.fn(),
        handleLanguageChange: vi.fn(),
        leaveInterview: vi.fn(),
    },

    loggerInfo: vi.fn(),
    loggerError: vi.fn(),
}));

vi.mock("ws", () => ({
    WebSocketServer: class MockWebSocketServer {
        constructor(options: { server: unknown; path: string }) {
            mocks.wssOptions = options;
        }

        on(event: string, handler: (socket: unknown) => void) {
            if (event === "connection") {
                mocks.connectionHandler = handler;
            }

            return this;
        }
    },
}));

vi.mock("@interview-os/logger", () => ({
    logger: {
        info: mocks.loggerInfo,
        error: mocks.loggerError,
    },
}));

vi.mock("../../../src/realtime/websocket/websocket-auth", () => ({
    authenticateWebSocketToken: mocks.authenticateWebSocketToken,
}));


vi.mock("../../../src/realtime/websocket/interview.gateway", () => ({
    InterviewGateway: vi.fn(function InterviewGatewayMock() {
        return mocks.gateway;
    }),
}));


type MessageHandler = (...args: any[]) => any;

type TestSocket = WebSocket & {
    userId?: string;
};

type SocketHarness = {
    socket: TestSocket;
    handlers: Map<string, MessageHandler>;
};

describe("RealtimeWebSocketServer", () => {
    let room: InterviewRoom;
    let httpServer: HttpServer;

    function createSocket(): SocketHarness {
        const handlers = new Map<string, MessageHandler>();

        const socket = {
            on: vi.fn((event: string, handler: MessageHandler) => {
                handlers.set(event, handler);
            }),
            send: vi.fn(),
            close: vi.fn(),
        };

        return {
            socket: socket as unknown as TestSocket,
            handlers,
        };
    }

    function connect(socket: TestSocket) {
        if (!mocks.connectionHandler) {
            throw new Error("WebSocket connection handler was not registered");
        }

        mocks.connectionHandler(socket);
    }

    async function sendRawMessage(
        handlers: Map<string, MessageHandler>,
        raw: string,
    ) {
        const handler = handlers.get("message");

        if (!handler) {
            throw new Error("WebSocket message handler was not registered");
        }

        await handler({
            toString: () => raw,
        });
    }

    async function sendMessage(
        handlers: Map<string, MessageHandler>,
        message: unknown,
    ) {
        await sendRawMessage(handlers, JSON.stringify(message));
    }

    
    function sentMessages(socket: TestSocket): unknown[] {
        const mockedSocket = socket as unknown as {
            send: ReturnType<typeof vi.fn>;
        };

        return mockedSocket.send.mock.calls.map((call: unknown[]) => {
            const message = call[0];
            return JSON.parse(message as string);
        });
    }


    beforeEach(() => {
        vi.clearAllMocks();

        mocks.wssOptions = undefined;
        mocks.connectionHandler = undefined;

        mocks.authenticateWebSocketToken.mockResolvedValue("user-1");

        mocks.gateway.joinInterview.mockResolvedValue(undefined);
        mocks.gateway.setActiveQuestion.mockResolvedValue(undefined);
        mocks.gateway.handleLanguageChange.mockResolvedValue(undefined);

        room = {} as InterviewRoom;
        httpServer = {} as HttpServer;

        new RealtimeWebSocketServer(httpServer, room);
    });

    describe("server initialization", () => {
        it("creates a WebSocket server on the expected path", () => {
            expect(mocks.wssOptions).toEqual({
                server: httpServer,
                path: "/ws",
            });
        });

        it("registers the connection handler", () => {
            expect(mocks.connectionHandler).toEqual(expect.any(Function));
        });
    });

    describe("connection lifecycle", () => {
        it("registers message, close, and error handlers for a connection", () => {
            const { socket, handlers } = createSocket();

            connect(socket);

            expect(socket.on).toHaveBeenCalledWith(
                "message",
                expect.any(Function),
            );
            expect(socket.on).toHaveBeenCalledWith(
                "close",
                expect.any(Function),
            );
            expect(socket.on).toHaveBeenCalledWith(
                "error",
                expect.any(Function),
            );

            expect(handlers.has("message")).toBe(true);
            expect(handlers.has("close")).toBe(true);
            expect(handlers.has("error")).toBe(true);
        });

        it("logs when a client connects", () => {
            const { socket } = createSocket();

            connect(socket);

            expect(mocks.loggerInfo).toHaveBeenCalledWith(
                "WebSocket client connected",
            );
        });

        it("cleans up the interview when the socket closes", () => {
            const { socket, handlers } = createSocket();

            socket.userId = "user-1";
            connect(socket);

            handlers.get("close")!();

            expect(mocks.gateway.leaveInterview).toHaveBeenCalledWith(socket);

            expect(mocks.loggerInfo).toHaveBeenCalledWith(
                { userId: "user-1" },
                "WebSocket client disconnected",
            );
        });

        it("handles closing a connection without an authenticated user", () => {
            const { socket, handlers } = createSocket();

            connect(socket);
            handlers.get("close")!();

            expect(mocks.gateway.leaveInterview).toHaveBeenCalledWith(socket);
            expect(mocks.loggerInfo).toHaveBeenCalledWith(
                { userId: undefined },
                "WebSocket client disconnected",
            );
        });

        it("logs socket errors", () => {
            const { socket, handlers } = createSocket();
            const error = new Error("Connection failed");

            connect(socket);
            handlers.get("error")!(error);

            expect(mocks.loggerError).toHaveBeenCalledWith(error);
        });
    });

    describe("authentication", () => {
        it("rejects authentication when the token is missing", async () => {
            const { socket, handlers } = createSocket();

            connect(socket);

            await sendMessage(handlers, {
                type: "AUTHENTICATE",
            });

            expect(sentMessages(socket)).toEqual([
                {
                    type: "ERROR",
                    message: "Authentication token is required",
                },
            ]);

            expect(socket.close).toHaveBeenCalledOnce();
            expect(mocks.authenticateWebSocketToken).not.toHaveBeenCalled();
        });

        it("rejects authentication when the token is not a string", async () => {
            const { socket, handlers } = createSocket();

            connect(socket);

            await sendMessage(handlers, {
                type: "AUTHENTICATE",
                token: 12345,
            });

            expect(sentMessages(socket)).toContainEqual({
                type: "ERROR",
                message: "Authentication token is required",
            });

            expect(socket.close).toHaveBeenCalledOnce();
            expect(mocks.authenticateWebSocketToken).not.toHaveBeenCalled();
        });

        it("authenticates a valid token and records the user ID", async () => {
            const { socket, handlers } = createSocket();

            connect(socket);

            await sendMessage(handlers, {
                type: "AUTHENTICATE",
                token: "valid-token",
            });

            expect(mocks.authenticateWebSocketToken).toHaveBeenCalledWith(
                "valid-token",
            );

            expect(socket.userId).toBe("user-1");

            expect(sentMessages(socket)).toEqual([
                {
                    type: "AUTHENTICATED",
                    userId: "user-1",
                },
            ]);

            expect(socket.close).not.toHaveBeenCalled();
        });

        it("closes the connection when token authentication fails", async () => {
            mocks.authenticateWebSocketToken.mockResolvedValue(null);

            const { socket, handlers } = createSocket();
            connect(socket);

            await sendMessage(handlers, {
                type: "AUTHENTICATE",
                token: "invalid-token",
            });

            expect(sentMessages(socket)).toContainEqual({
                type: "ERROR",
                message: "Authentication failed",
            });

            expect(socket.close).toHaveBeenCalledOnce();
            expect(socket.userId).toBeUndefined();
        });

        it("does not dispatch interview commands before authentication", async () => {
            const { socket, handlers } = createSocket();
            connect(socket);

            await sendMessage(handlers, {
                type: "JOIN_INTERVIEW",
                interviewId: "interview-1",
            });

            expect(sentMessages(socket)).toContainEqual({
                type: "ERROR",
                message: "Not authenticated",
            });

            expect(mocks.gateway.joinInterview).not.toHaveBeenCalled();
        });

        it("allows authentication messages before the user is authenticated", async () => {
            const { socket, handlers } = createSocket();
            connect(socket);

            await sendMessage(handlers, {
                type: "AUTHENTICATE",
                token: "valid-token",
            });

            expect(socket.userId).toBe("user-1");
            expect(sentMessages(socket)).toContainEqual({
                type: "AUTHENTICATED",
                userId: "user-1",
            });
        });
    });

    describe("message validation", () => {
        it("returns an error for malformed JSON", async () => {
            const { socket, handlers } = createSocket();

            socket.userId = "user-1";
            connect(socket);

            await sendRawMessage(handlers, "{invalid-json");

            expect(sentMessages(socket)).toEqual([
                {
                    type: "ERROR",
                    message: "Invalid WebSocket message",
                },
            ]);
        });

        it("returns an error when the incoming JSON is null", async () => {
            const { socket, handlers } = createSocket();

            socket.userId = "user-1";
            connect(socket);

            await sendRawMessage(handlers, "null");

            expect(sentMessages(socket)).toContainEqual({
                type: "ERROR",
                message: "Invalid WebSocket message",
            });
        });

        it("returns an error when the incoming JSON is a primitive", async () => {
            const { socket, handlers } = createSocket();

            socket.userId = "user-1";
            connect(socket);

            await sendRawMessage(handlers, '"hello"');

            // Primitive messages have no recognized type, so they are ignored
            // after logging rather than dispatched to a gateway method.
            expect(mocks.gateway.joinInterview).not.toHaveBeenCalled();
            expect(mocks.gateway.handleCodeChange).not.toHaveBeenCalled();
        });

        it("does not dispatch an unknown message type to the gateway", async () => {
            const { socket, handlers } = createSocket();

            socket.userId = "user-1";
            connect(socket);

            await sendMessage(handlers, {
                type: "UNKNOWN_EVENT",
            });

            expect(mocks.gateway.joinInterview).not.toHaveBeenCalled();
            expect(mocks.gateway.setActiveQuestion).not.toHaveBeenCalled();
            expect(mocks.gateway.handleWebRTCSignal).not.toHaveBeenCalled();
            expect(mocks.gateway.handleMediaState).not.toHaveBeenCalled();
            expect(mocks.gateway.handleCodeChange).not.toHaveBeenCalled();
            expect(mocks.gateway.handleLanguageChange).not.toHaveBeenCalled();
        });

        it("returns an error when an awaited gateway operation rejects", async () => {
            mocks.gateway.joinInterview.mockRejectedValue(
                new Error("Gateway failed"),
            );

            const { socket, handlers } = createSocket();

            socket.userId = "user-1";
            connect(socket);

            await sendMessage(handlers, {
                type: "JOIN_INTERVIEW",
                interviewId: "interview-1",
            });

            expect(sentMessages(socket)).toContainEqual({
                type: "ERROR",
                message: "Invalid WebSocket message",
            });
        });
    });

    describe("JOIN_INTERVIEW routing", () => {
        it("routes the interview ID and socket to the gateway", async () => {
            const { socket, handlers } = createSocket();

            socket.userId = "user-1";
            connect(socket);

            await sendMessage(handlers, {
                type: "JOIN_INTERVIEW",
                interviewId: "interview-1",
            });

            expect(mocks.gateway.joinInterview).toHaveBeenCalledWith(
                socket,
                "interview-1",
            );

            expect(mocks.gateway.setActiveQuestion).not.toHaveBeenCalled();
        });

        it("passes a missing interview ID to the gateway for validation", async () => {
            const { socket, handlers } = createSocket();

            socket.userId = "user-1";
            connect(socket);

            await sendMessage(handlers, {
                type: "JOIN_INTERVIEW",
            });

            expect(mocks.gateway.joinInterview).toHaveBeenCalledWith(
                socket,
                undefined,
            );
        });
    });

    describe("SET_ACTIVE_QUESTION routing", () => {
        it("routes the question ID and socket to the gateway", async () => {
            const { socket, handlers } = createSocket();

            socket.userId = "user-1";
            connect(socket);

            await sendMessage(handlers, {
                type: "SET_ACTIVE_QUESTION",
                interviewQuestionId: "question-1",
            });

            expect(mocks.gateway.setActiveQuestion).toHaveBeenCalledWith(
                socket,
                "question-1",
            );

            expect(mocks.gateway.joinInterview).not.toHaveBeenCalled();
        });

        it("passes a null question ID to the gateway for validation", async () => {
            const { socket, handlers } = createSocket();

            socket.userId = "user-1";
            connect(socket);

            await sendMessage(handlers, {
                type: "SET_ACTIVE_QUESTION",
                interviewQuestionId: null,
            });

            expect(mocks.gateway.setActiveQuestion).toHaveBeenCalledWith(
                socket,
                null,
            );
        });
    });

    describe("WebRTC routing", () => {
        it.each([
            "WEBRTC_OFFER",
            "WEBRTC_ANSWER",
            "WEBRTC_ICE_CANDIDATE",
        ] as const)("routes %s messages to the signaling handler", async (type) => {
            const { socket, handlers } = createSocket();

            socket.userId = "user-1";
            connect(socket);

            const message = {
                type,
                targetUserId: "user-2",
                offer: { type: "offer", sdp: "offer-sdp" },
                answer: { type: "answer", sdp: "answer-sdp" },
                candidate: { candidate: "candidate-data" },
            };

            await sendMessage(handlers, message);

            expect(mocks.gateway.handleWebRTCSignal).toHaveBeenCalledWith(
                socket,
                message,
            );

            expect(mocks.gateway.handleMediaState).not.toHaveBeenCalled();
            expect(mocks.gateway.handleCodeChange).not.toHaveBeenCalled();
        });
    });

    describe("MEDIA_STATE routing", () => {
        it("routes media state to the gateway", async () => {
            const { socket, handlers } = createSocket();

            socket.userId = "user-1";
            connect(socket);

            const message = {
                type: "MEDIA_STATE",
                cameraEnabled: true,
                microphoneEnabled: false,
            };

            await sendMessage(handlers, message);

            expect(mocks.gateway.handleMediaState).toHaveBeenCalledWith(
                socket,
                message,
            );

            expect(mocks.gateway.handleCodeChange).not.toHaveBeenCalled();
        });
    });

    describe("CODE_CHANGE routing", () => {
        it("routes code changes to the gateway", async () => {
            const { socket, handlers } = createSocket();

            socket.userId = "user-1";
            connect(socket);

            const message = {
                type: "CODE_CHANGE",
                code: "console.log('hello')",
            };

            await sendMessage(handlers, message);

            expect(mocks.gateway.handleCodeChange).toHaveBeenCalledWith(
                socket,
                message,
            );

            expect(mocks.gateway.handleLanguageChange).not.toHaveBeenCalled();
        });
    });

    describe("LANGUAGE_CHANGE routing", () => {
        it("routes language changes to the gateway", async () => {
            const { socket, handlers } = createSocket();

            socket.userId = "user-1";
            connect(socket);

            const message = {
                type: "LANGUAGE_CHANGE",
                language: "TYPESCRIPT",
            };

            await sendMessage(handlers, message);

            expect(mocks.gateway.handleLanguageChange).toHaveBeenCalledWith(
                socket,
                message,
            );
        });

        it("reports an error when the language-change handler rejects", async () => {
            mocks.gateway.handleLanguageChange.mockRejectedValue(
                new Error("Language update failed"),
            );

            const { socket, handlers } = createSocket();

            socket.userId = "user-1";
            connect(socket);

            await sendMessage(handlers, {
                type: "LANGUAGE_CHANGE",
                language: "TYPESCRIPT",
            });

            expect(sentMessages(socket)).toContainEqual({
                type: "ERROR",
                message: "Invalid WebSocket message",
            });
        });
    });
});
