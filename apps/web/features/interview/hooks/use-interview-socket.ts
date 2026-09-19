"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@clerk/nextjs";

export function useInterviewSocket(
    interviewId:string
) {
    const { getToken, isLoaded, isSignedIn } = useAuth();

    const socketRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        if (!isLoaded || !isSignedIn) {
            return;
        }

        let socket: WebSocket | null = null;

        const connect = async () => {
            const token = await getToken();

            if (!token) {
                console.error("[WS] No Clerk token available");
                return;
            }

            socket = new WebSocket("ws://localhost:3001/ws");

            socket.onopen = () => {
                console.log("[WS] connected");

                socket?.send(
                    JSON.stringify({
                        type: "AUTHENTICATE",
                        token,
                    }),
                );
            };

            socket.onmessage = (event) => {
                const message = JSON.parse(event.data);

                console.log("[WS] message:", message);

                if (message.type === "AUTHENTICATED") {
                    socket?.send(
                        JSON.stringify({
                            type: "JOIN_INTERVIEW",
                            interviewId,
                        }),
                    );
                }
            };

            socket.onerror = (error) => {
                console.error("[WS] error:", error);
            };

            socket.onclose = () => {
                console.log("[WS] disconnected");
            };

            socketRef.current = socket;
        };

        void connect();

        return () => {
            socket?.close();
            socketRef.current = null;
        };
    }, [getToken, isLoaded, isSignedIn]);

    return {
        socket: socketRef.current,
    };
}