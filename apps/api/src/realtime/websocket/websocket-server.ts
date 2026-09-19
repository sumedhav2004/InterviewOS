import { Server as HttpServer } from "http";
import WebSocket, { WebSocketServer } from "ws";
import { logger } from "@interview-os/logger";
import { authenticateWebSocketToken } from "./websocket-auth";
import { InterviewGateway } from "./interview.gateway";
import { InterviewRoom } from "./interview-room";

type AuthenticatedSocket = WebSocket & {
    userId?: string;
};

export class RealtimeWebSocketServer {
    private readonly wss: WebSocketServer;
    private readonly interviewGateway: InterviewGateway;

    constructor(server: HttpServer) {
        this.wss = new WebSocketServer({
            server,
            path: "/ws",
        });
        const room = new InterviewRoom();
        this.interviewGateway = new InterviewGateway(room);

        this.registerHandlers();
    }

    private registerHandlers() {
        this.wss.on(
            "connection",
            (socket: AuthenticatedSocket) => {
                logger.info("WebSocket client connected");

                socket.on("message", async (data) => {
                    try {
                        const message = JSON.parse(data.toString());

                        logger.info(
                            {
                                message,
                            },
                            "WebSocket message received",
                        );

                        if (message.type === "AUTHENTICATE") {
                            await this.handleAuthentication(
                                socket,
                                message.token,
                            );

                            return;
                        }

                        if (!socket.userId) {
                            socket.send(
                                JSON.stringify({
                                    type: "ERROR",
                                    message: "Not authenticated",
                                }),
                            );

                            return;
                        }
                        if (message.type === "JOIN_INTERVIEW") {
                            await this.interviewGateway.joinInterview(
                                socket,
                                message.interviewId,
                            );

                            return;
                        }

                        logger.info(
                            {
                                userId: socket.userId,
                                messageType: message.type,
                            },
                            "WebSocket message received",
                        );
                    } catch {
                        socket.send(
                            JSON.stringify({
                                type: "ERROR",
                                message: "Invalid WebSocket message",
                            }),
                        );
                    }
                });

                socket.on("close", () => {
                    this.interviewGateway.leaveInterview(socket);

                    logger.info(
                        {
                            userId: socket.userId,
                        },
                        "WebSocket client disconnected",
                    );
                });

                socket.on("error", (error) => {
                    logger.error(error);
                });
            },
        );
    }

    private async handleAuthentication(
        socket: AuthenticatedSocket,
        token: unknown,
    ) {
        if (typeof token !== "string") {
            socket.send(
                JSON.stringify({
                    type: "ERROR",
                    message: "Authentication token is required",
                }),
            );

            socket.close();

            return;
        }

        const userId = await authenticateWebSocketToken(token);

        if (!userId) {
            socket.send(
                JSON.stringify({
                    type: "ERROR",
                    message: "Authentication failed",
                }),
            );

            socket.close();

            return;
        }

        socket.userId = userId;

        socket.send(
            JSON.stringify({
                type: "AUTHENTICATED",
                userId,
            }),
        );

        logger.info(
            {
                userId,
            },
            "WebSocket client authenticated",
        );
    }
}