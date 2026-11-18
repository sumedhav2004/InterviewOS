"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useAuth } from "@clerk/nextjs";

import type { ServerMessage } from "../types/realtime";
import { ProgrammingLanguage } from "../types/programming-language";
import { Participant } from "../types/participant";

type MessageHandler = (message: ServerMessage) => void;

export function useInterviewSocket(interviewId: string, onMessage?: MessageHandler) {
  const { getToken, isLoaded, isSignedIn } = useAuth();

  const socketRef = useRef<WebSocket | null>(null);

  const [userId, setUserId] = useState<string>();

  const [joined, setJoined] = useState(false);

  /**
   * The current user's complete interview
   * participant.
   */
  const [participant, setParticipant] = useState<Participant | null>(null);

  /**
   * All participants currently known to the
   * interview room.
   */
  const [participants, setParticipants] = useState<Participant[]>([]);

  const onMessageRef = useRef(onMessage);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) {
      return;
    }

    let socket: WebSocket | null = null;
    let cancelled = false;

    const connect = async () => {
      const token = await getToken();

      if (cancelled) {
        return;
      }

      if (!token) {
        console.error("[WS] No Clerk token available");

        return;
      }

      // socket = new WebSocket("ws://localhost:3001/ws");
      socket = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}`);

      socket.onopen = () => {
        socket?.send(
          JSON.stringify({
            type: "AUTHENTICATE",
            token,
          }),
        );
      };

      socket.onmessage = (event) => {
        const message: ServerMessage = JSON.parse(event.data);

        onMessageRef.current?.(message);

        switch (message.type) {
          case "AUTHENTICATED": {
            setUserId(message.userId);

            socket?.send(
              JSON.stringify({
                type: "JOIN_INTERVIEW",
                interviewId,
              }),
            );

            return;
          }

          case "INTERVIEW_JOINED": {
            setJoined(true);

            setParticipant(message.participant);

            setParticipants(message.participants);

            return;
          }

          case "PARTICIPANT_JOINED": {
            setParticipants((currentParticipants) => {
              const alreadyExists = currentParticipants.some(
                (currentParticipant) => currentParticipant.id === message.participant.id,
              );

              if (alreadyExists) {
                return currentParticipants;
              }

              return [...currentParticipants, message.participant];
            });

            return;
          }

          case "PARTICIPANT_LEFT": {
            setParticipants((currentParticipants) =>
              currentParticipants.filter(
                (currentParticipant) => currentParticipant.userId !== message.userId,
              ),
            );

            return;
          }

          default: {
            return;
          }
        }
      };

      socket.onerror = (event) => {
        console.error("[WS] error", {
          url: socket?.url,
          readyState: socket?.readyState,
          time: new Date().toISOString(),
          event,
        });
      };

      socket.onclose = (event) => {
        console.error("[WS] closed", {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean,
          time: new Date().toISOString(),
        });

        setJoined(false);
        setParticipant(null);
        setParticipants([]);
        setUserId(undefined);
      };

      socketRef.current = socket;
    };

    void connect();

    return () => {
      cancelled = true;

      setJoined(false);
      setParticipant(null);
      setParticipants([]);
      setUserId(undefined);

      socket?.close();

      socketRef.current = null;
    };
  }, [getToken, isLoaded, isSignedIn, interviewId]);

  const sendMessage = useCallback((message: unknown) => {
    const socket = socketRef.current;

    if (!socket) {
      console.error("[WS] Socket is not connected");

      return;
    }

    if (socket.readyState !== WebSocket.OPEN) {
      console.error("[WS] Socket is not open");

      return;
    }

    socket.send(JSON.stringify(message));
  }, []);

  const sendLanguageChange = useCallback(
    (language: ProgrammingLanguage) => {
      sendMessage({
        type: "LANGUAGE_CHANGE",
        language,
      });
    },
    [sendMessage],
  );

  return {
    sendMessage,
    sendLanguageChange,

    userId,
    joined,

    participant,
    participants,
  };
}
