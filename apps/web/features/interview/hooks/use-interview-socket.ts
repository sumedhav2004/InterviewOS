"use client";

import {
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";

import { useAuth } from "@clerk/nextjs";

import type { ServerMessage } from "../types/realtime";

type MessageHandler = (
    message: ServerMessage,
) => void;

export function useInterviewSocket(
    interviewId: string,
    onMessage?: MessageHandler,
) {
    const {
        getToken,
        isLoaded,
        isSignedIn,
    } = useAuth();

    const socketRef =
        useRef<WebSocket | null>(null);

    const [userId, setUserId] =
        useState<string>();

    const [joined, setJoined] =
        useState(false);

    useEffect(() => {
        if (!isLoaded || !isSignedIn) {
            return;
        }

        let socket: WebSocket | null = null;

        const connect = async () => {
            const token = await getToken();

            if (!token) {
                console.error(
                    "[WS] No Clerk token available",
                );
                return;
            }

            socket = new WebSocket(
                "ws://localhost:3001/ws",
            );

            socket.onopen = () => {
                console.log(
                    "[WS] connected",
                );

                socket?.send(
                    JSON.stringify({
                        type: "AUTHENTICATE",
                        token,
                    }),
                );
            };

            socket.onmessage = (event) => {
                const message: ServerMessage =
                    JSON.parse(event.data);

                console.log(
                    "[WS] message:",
                    message,
                );

                onMessage?.(message);

                if (
                    message.type ===
                    "AUTHENTICATED"
                ) {
                    setUserId(
                        message.userId,
                    );

                    socket?.send(
                        JSON.stringify({
                            type: "JOIN_INTERVIEW",
                            interviewId,
                        }),
                    );

                    return;
                }

                if (
                    message.type ===
                    "INTERVIEW_JOINED"
                ) {
                    setJoined(true);
                }
            };

            socket.onerror = (error) => {
                console.error(
                    "[WS] error:",
                    error,
                );
            };

            socket.onclose = () => {
                console.log(
                    "[WS] disconnected",
                );

                setJoined(false);
            };

            socketRef.current = socket;
        };

        void connect();

        return () => {
            setJoined(false);

            socket?.close();

            socketRef.current = null;
        };
    }, [
        getToken,
        isLoaded,
        isSignedIn,
        interviewId,
    ]);

    const sendMessage = useCallback(
        (message: unknown) => {
            if (!socketRef.current) {
                console.error(
                    "[WS] Socket is not connected",
                );
                return;
            }

            if (
                socketRef.current.readyState !==
                WebSocket.OPEN
            ) {
                console.error(
                    "[WS] Socket is not open",
                );
                return;
            }

            socketRef.current.send(
                JSON.stringify(message),
            );
        },
        [],
    );

    return {
        sendMessage,
        userId,
        joined,
    };
}