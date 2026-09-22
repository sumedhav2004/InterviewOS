"use client";

import { useAuth } from "@/lib/auth";
import { useEffect, useRef, useState } from "react";

import { useInterview } from "../hooks/use-interview";
import { useInterviewSocket } from "../hooks/use-interview-socket";
import { useWebRTC } from "../hooks/use-webrtc";
import { useLocalMedia } from "../hooks/use-local-media";

import { InterviewHeader } from "./interview-header";
import { InterviewLayout } from "./interview-layout";
import { InterviewControls } from "./interview-controls";

import type { ServerMessage } from "../types/realtime";

type InterviewPageProps = {
    interviewId: string;
};

type ParticipantMediaState = {
    cameraEnabled: boolean;
    microphoneEnabled: boolean;
};

export function InterviewPage({
    interviewId,
}: InterviewPageProps) {
    const { isLoaded, isSignedIn } = useAuth();

    /*
     * All currently connected participants in this room.
     *
     * This does NOT include the current user.
     *
     * Example:
     *
     * ["user-b", "user-c", "user-d"]
     */
    const [participantIds, setParticipantIds] =
        useState<Set<string>>(new Set());

    

    const [code, setCode] = useState('');

    const [
        remoteMediaStates,
        setRemoteMediaStates,
    ] = useState<
        Map<string, ParticipantMediaState>
    >(new Map());

    /*
     * WebRTC signals arrive through the WebSocket.
     *
     * The socket is created before useWebRTC because
     * useWebRTC needs sendMessage().
     *
     * Refs let the socket callback always reach the
     * current WebRTC handlers without recreating the
     * WebSocket connection.
     */
    type WebRTCSignal =
        | {
            type: "WEBRTC_OFFER";
            fromUserId: string;
            offer: RTCSessionDescriptionInit;
        }
        | {
            type: "WEBRTC_ANSWER";
            fromUserId: string;
            answer: RTCSessionDescriptionInit;
        }
        | {
            type: "WEBRTC_ICE_CANDIDATE";
            fromUserId: string;
            candidate: RTCIceCandidateInit;
        };

    const signalHandlerRef = useRef<
        ((message: WebRTCSignal) => void) | null
    >(null);

    const removeParticipantRef = useRef<
        ((userId: string) => void) | null
    >(null);

    const {
        stream: localStream,
        error: mediaError,
        cameraEnabled,
        microphoneEnabled,
        startMedia,
        toggleCamera,
        toggleMicrophone,
    } = useLocalMedia();

    /*
     * Start local camera/microphone once authentication
     * is ready.
     */
    useEffect(() => {
        if (!isLoaded || !isSignedIn) {
            return;
        }

        void startMedia();
    }, [
        isLoaded,
        isSignedIn,
        startMedia,
    ]);

    /*
     * WebSocket:
     *
     * - tells us who is in the room
     * - tells us who joined
     * - tells us who left
     * - carries WebRTC signaling
     * - carries media-state events
     */
    const {
        sendMessage,
        userId,
        joined,
    } = useInterviewSocket(
        interviewId,
        (message) => {
            console.log(
                "[Interview] received:",
                message,
            );

            /*
             * WebRTC signaling belongs to useWebRTC.
             */
            if (
                message.type === "WEBRTC_OFFER" ||
                message.type === "WEBRTC_ANSWER" ||
                message.type === "WEBRTC_ICE_CANDIDATE"
            ) {
                signalHandlerRef.current?.(message);
            }

            /*
             * Initial room membership.
             *
             * The server gives the newly joined client
             * every participant already in the room.
             */
            if (
                message.type ===
                "INTERVIEW_JOINED"
            ) {
                console.log(
                    "[Interview] room participants:",
                    message.participants,
                );

                setParticipantIds(
                    new Set(message.participants),
                );

                return;
            }

            /*
             * A new participant joined.
             *
             * Existing participants add that user to
             * their room membership.
             */
            if (
                message.type ===
                "PARTICIPANT_JOINED"
            ) {
                console.log(
                    "[Interview] participant joined:",
                    message.userId,
                );

                setParticipantIds(
                    (currentParticipants) => {
                        const nextParticipants =
                            new Set(
                                currentParticipants,
                            );

                        nextParticipants.add(
                            message.userId,
                        );

                        return nextParticipants;
                    },
                );

                return;
            }

            /*
             * A participant left.
             */
            if (
                message.type ===
                "PARTICIPANT_LEFT"
            ) {
                console.log(
                    "[Interview] participant left:",
                    message.userId,
                );

                setParticipantIds(
                    (currentParticipants) => {
                        const nextParticipants =
                            new Set(
                                currentParticipants,
                            );

                        nextParticipants.delete(
                            message.userId,
                        );

                        return nextParticipants;
                    },
                );

                setRemoteMediaStates(
                    (currentStates) => {
                        const nextStates =
                            new Map(
                                currentStates,
                            );

                        nextStates.delete(
                            message.userId,
                        );

                        return nextStates;
                    },
                );

                /*
                 * Close only this participant's
                 * WebRTC connection.
                 */
                removeParticipantRef.current?.(
                    message.userId,
                );

                return;
            }

            /*
             * Remote microphone/camera state.
             */
            if (
                message.type ===
                "MEDIA_STATE"
            ) {
                setRemoteMediaStates(
                    (currentStates) => {
                        const nextStates =
                            new Map(
                                currentStates,
                            );

                        nextStates.set(
                            message.userId,
                            {
                                cameraEnabled:
                                    message.cameraEnabled,
                                microphoneEnabled:
                                    message.microphoneEnabled,
                            },
                        );

                        return nextStates;
                    },
                );

                return;
            }

            if (message.type === "CODE_SNAPSHOT") {
                setCode(message.code);
                return;
            }

            if (message.type === "CODE_CHANGE") {
                setCode(message.code);
                return;
            }
        },
    );

    const {
        ensureConnection,
        handleSignal,
        removeParticipant,
        remoteStreams,
    } = useWebRTC(
        sendMessage,
        localStream,
    );

    /*
     * Keep the latest WebRTC handlers available to the
     * WebSocket callback.
     */
    signalHandlerRef.current =
        handleSignal;

    removeParticipantRef.current =
        removeParticipant;

    /*
     * This is the core N-participant orchestration.
     *
     * For every participant in the room:
     *
     *     userId < participantId
     *
     * determines who creates the OFFER.
     *
     * This is deterministic and has nothing to do
     * with who entered first.
     */
    useEffect(() => {
        if (
            !joined ||
            !userId ||
            !localStream
        ) {
            return;
        }

        for (const participantId of participantIds) {
            if (participantId === userId) {
                continue;
            }

            const shouldInitiate =
                userId < participantId;

            console.log(
                "[Interview] ensuring WebRTC connection:",
                {
                    participantId,
                    shouldInitiate,
                },
            );

            void ensureConnection(
                participantId,
                shouldInitiate,
            );
        }
    }, [
        joined,
        userId,
        localStream,
        participantIds,
        ensureConnection,
    ]);

    /*
     * Broadcast our current media state whenever:
     *
     * - we join the room
     * - our camera changes
     * - our microphone changes
     * - the participant set changes
     *
     * The participant-set dependency is important:
     * when somebody new enters, we announce our current
     * state to the room again.
     */
    useEffect(() => {
        if (
            !joined ||
            !localStream
        ) {
            return;
        }

        sendMessage({
            type: "MEDIA_STATE",
            cameraEnabled,
            microphoneEnabled,
        });
    }, [
        joined,
        localStream,
        cameraEnabled,
        microphoneEnabled,
        participantIds,
        sendMessage,
    ]);

    const {
        interview,
        loading,
        error,
    } = useInterview({
        interviewId,
        isLoaded,
        isSignedIn: Boolean(isSignedIn),
    });

    if (!isLoaded) {
        return (
            <InterviewShell>
                <LoadingState label="Authenticating..." />
            </InterviewShell>
        );
    }

    if (!isSignedIn) {
        return (
            <InterviewShell>
                <LoadingState label="Please sign in to enter this room." />
            </InterviewShell>
        );
    }

    if (loading) {
        return (
            <InterviewShell>
                <LoadingState label="Loading interview..." />
            </InterviewShell>
        );
    }

    if (error || !interview) {
        return (
            <InterviewShell>
                <LoadingState
                    label={
                        error ??
                        "Interview not found."
                    }
                />
            </InterviewShell>
        );
    }

    return (
        <InterviewShell>
            <InterviewHeader
                interview={interview}
            />

            <InterviewLayout
                code={code}
                onCodeChange={(nextCode) => {
                    setCode(nextCode);

                    if (!joined) {
                        return;
                    }

                    sendMessage({
                        type: "CODE_CHANGE",
                        code: nextCode,
                    });
                }}
                localStream={localStream}
                participantIds={[
                    ...participantIds,
                ]}
                remoteStreams={
                    remoteStreams
                }
                localMediaState={{
                    cameraEnabled,
                    microphoneEnabled,
                }}
                remoteMediaStates={
                    remoteMediaStates
                }
            />

            {mediaError && (
                <div className="border-t border-border px-4 py-2">
                    <p className="font-mono text-xs text-destructive">
                        {mediaError}
                    </p>
                </div>
            )}

            <InterviewControls
                cameraEnabled={
                    cameraEnabled
                }
                microphoneEnabled={
                    microphoneEnabled
                }
                onToggleCamera={
                    toggleCamera
                }
                onToggleMicrophone={
                    toggleMicrophone
                }
            />
        </InterviewShell>
    );
}

function InterviewShell({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <main className="flex h-dvh flex-col overflow-hidden bg-background text-foreground">
            {children}
        </main>
    );
}

function LoadingState({
    label,
}: {
    label: string;
}) {
    return (
        <div className="grid h-dvh place-items-center bg-background">
            <div className="text-center">
                <div className="mx-auto h-7 w-7 animate-pulse rounded-full border border-primary/50 bg-primary/10" />

                <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    {label}
                </p>
            </div>
        </div>
    );
}