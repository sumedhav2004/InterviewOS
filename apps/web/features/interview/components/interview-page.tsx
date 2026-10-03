"use client";

import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import { useAuth } from "@/lib/auth";

import { useInterview } from "../hooks/use-interview";
import { useInterviewSocket } from "../hooks/use-interview-socket";
import { useWebRTC } from "../hooks/use-webrtc";
import { useLocalMedia } from "../hooks/use-local-media";

import { InterviewHeader } from "./interview-header";
import { InterviewLayout } from "./interview-layout";
import { InterviewControls } from "./interview-controls";

import type {
    ActiveInterviewQuestion,
    ServerMessage,
    WebRTCSignal,
} from "../types/realtime";
import type { ProgrammingLanguage } from "../types/programming-language";
import { useCodeRun } from "../hooks/use-coderun";
import { useSubmission } from "../hooks/use-submission";
import { ParticipantMediaState } from "../types/participant";

type InterviewPageProps = {
    interviewId: string;
};

export function InterviewPage({
    interviewId,
}: InterviewPageProps) {

    const { isLoaded, isSignedIn } = useAuth();
    const [code, setCode] = useState("");

    const [
        activeInterviewQuestion,
        setActiveInterviewQuestion,
    ] = useState<ActiveInterviewQuestion | null>(null);

    const [language, setLanguage] =
        useState<ProgrammingLanguage>("PYTHON");

    const [
        remoteMediaStates,
        setRemoteMediaStates,
    ] = useState<
        Map<string, ParticipantMediaState>
    >(new Map());

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

    const {
        codeRun,
        results: codeRunResults,
        isRunning: isCodeRunRunning,
        error: codeRunError,
        run: runCode,
        handleMessage: handleCodeRunMessage,
    } = useCodeRun();

    const {
        submission,
        results: submissionResults,
        evaluation,
        isSubmitting,
        error: submissionError,
        submit,
        handleMessage: handleSubmissionMessage,
    } = useSubmission();

    /*
     * WebSocket message handling.
     *
     * Participant state itself is owned by
     * useInterviewSocket.
     *
     * This callback only handles page-level concerns:
     * - WebRTC signaling
     * - remote media state
     * - code
     * - active question
     * - language
     * - code run results
     * - submission results
     * - WebRTC cleanup when someone leaves
     */
    const handleSocketMessage = useCallback(
        (message: ServerMessage) => {
            console.log(
                "[Interview] received:",
                message,
            );

            handleCodeRunMessage(message);
            handleSubmissionMessage(message);

            /*
             * WebRTC signaling belongs to useWebRTC.
             */
            if (
                message.type === "WEBRTC_OFFER" ||
                message.type === "WEBRTC_ANSWER" ||
                message.type ===
                    "WEBRTC_ICE_CANDIDATE"
            ) {
                signalHandlerRef.current?.(
                    message,
                );

                return;
            }

            /*
             * Participant membership is owned by
             * useInterviewSocket.
             *
             * We only need to clean up resources
             * associated with a participant who left.
             */
            if (
                message.type ===
                "PARTICIPANT_LEFT"
            ) {
                const userId =
                    message.userId;

                console.log(
                    "[Interview] participant left:",
                    userId,
                );

                setRemoteMediaStates(
                    (currentStates) => {
                        const nextStates =
                            new Map(
                                currentStates,
                            );

                        nextStates.delete(
                            userId,
                        );

                        return nextStates;
                    },
                );

                /*
                 * Close only this participant's
                 * WebRTC connection.
                 */
                removeParticipantRef.current?.(
                    userId,
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

            /*
             * Initial code state.
             */
            if (
                message.type ===
                "CODE_SNAPSHOT"
            ) {
                setCode(message.code);

                return;
            }

            /*
             * Active interview question.
             */
            if (
                message.type ===
                "ACTIVE_QUESTION_STATE"
            ) {
                setActiveInterviewQuestion(
                    message.interviewQuestion,
                );

                return;
            }

            /*
             * Remote code changes.
             */
            if (
                message.type ===
                "CODE_CHANGE"
            ) {
                setCode(message.code);

                return;
            }

            /*
             * Remote language changes.
             */
            if (
                message.type ===
                "LANGUAGE_CHANGED"
            ) {
                setLanguage(
                    message.language,
                );

                return;
            }

            /*
             * Initial language state.
             */
            if (
                message.type ===
                "LANGUAGE_SNAPSHOT"
            ) {
                setLanguage(
                    message.language,
                );

                return;
            }
        },
        [
            handleCodeRunMessage,
            handleSubmissionMessage,
        ],
    );

    const {
        sendMessage,
        userId,
        joined,
        participant,
        participants,
        sendLanguageChange,
    } = useInterviewSocket(
        interviewId,
        handleSocketMessage,
    );

    /*
     * Derive the user IDs needed by WebRTC from the
     * complete participant objects supplied by the
     * socket hook.
     *
     * The participant objects remain the source of truth.
     */
    const participantIds = useMemo(
        () =>
            participants.map(
                (currentParticipant) =>
                    currentParticipant.userId,
            ),
        [participants],
    );

    const handleLanguageChange = useCallback(
        (
            nextLanguage: ProgrammingLanguage,
        ) => {
            setLanguage(nextLanguage);

            if (!joined) {
                return;
            }

            sendLanguageChange(
                nextLanguage,
            );
        },
        [
            joined,
            sendLanguageChange,
        ],
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
     * Keep the latest WebRTC handlers available to
     * the WebSocket callback.
     */
    signalHandlerRef.current =
        handleSignal;

    removeParticipantRef.current =
        removeParticipant;

    /*
     * N-participant WebRTC orchestration.
     *
     * The participant role has no bearing on WebRTC
     * connection ownership.
     *
     * The userId comparison determines which side
     * creates the OFFER.
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
            if (
                participantId === userId
            ) {
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
     *
     * The participant list is intentionally not used
     * as a dependency here. A participant joining does
     * not require us to rebroadcast our state because
     * the joining participant will receive the current
     * room state through the existing realtime flow.
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
        sendMessage,
    ]);

    const {
        interview,
        loading,
        error,
    } = useInterview({
        interviewId,
        isLoaded,
        isSignedIn: Boolean(
            isSignedIn,
        ),
    });

    const handleRunCode = useCallback(async () => {
        if (!activeInterviewQuestion || !participant) {
            return;
        }

        await runCode({
            interviewQuestionId:
                activeInterviewQuestion.id,
            participantId:
                participant.id,
            language,
            sourceCode: code,
        });
    }, [
        activeInterviewQuestion,
        participant,
        language,
        code,
        runCode,
    ]);

    const handleSubmitCode = useCallback(async () => {
        if (
            !activeInterviewQuestion ||
            !participant
        ) {
            return;
        }

        await submit({
            interviewQuestionId:
                activeInterviewQuestion.id,
            participantId:
                participant.id,
            language,
            sourceCode: code,
        });
    }, [
        activeInterviewQuestion,
        participant,
        language,
        code,
        submit,
    ]);

    if (!isLoaded) {
        return (
            <InterviewShell>
                <LoadingState
                    label="Authenticating..."
                />
            </InterviewShell>
        );
    }

    if (!isSignedIn) {
        return (
            <InterviewShell>
                <LoadingState
                    label="Please sign in to enter this room."
                />
            </InterviewShell>
        );
    }

    if (loading) {
        return (
            <InterviewShell>
                <LoadingState
                    label="Loading interview..."
                />
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
                activeInterviewQuestion={
                    activeInterviewQuestion
                }
                participant={participant}
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
                participantIds={participantIds}
                participants={participants}
                remoteStreams={remoteStreams}
                localMediaState={{
                    cameraEnabled,
                    microphoneEnabled,
                }}
                language={language}
                onLanguageChange={
                    handleLanguageChange
                }
                remoteMediaStates={
                    remoteMediaStates
                }

                /*
                 * Code run
                 */
                codeRun={codeRun}
                results={codeRunResults}
                isRunning={isCodeRunRunning}
                error={codeRunError}
                onRunCode={handleRunCode}

                /*
                 * Submission
                 */
                submission={submission}
                submissionResults={
                    submissionResults
                }
                evaluation={evaluation}
                isSubmitting={isSubmitting}
                submissionError={
                    submissionError
                }
                onSubmit={handleSubmitCode}
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