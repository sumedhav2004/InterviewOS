"use client";

import {
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";

type SendMessage = (message: unknown) => void;

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

type PeerSenders = {
    audio?: RTCRtpSender;
    video?: RTCRtpSender;
};

export function useWebRTC(
    sendMessage: SendMessage,
    localStream: MediaStream | null,
) {
    /*
     * One RTCPeerConnection per remote participant.
     *
     * Example for A, B, C:
     *
     * A:
     *   B -> RTCPeerConnection
     *   C -> RTCPeerConnection
     *
     * B:
     *   A -> RTCPeerConnection
     *   C -> RTCPeerConnection
     */
    const peerConnectionsRef = useRef(
        new Map<string, RTCPeerConnection>(),
    );

    /*
     * Keep the senders for each peer so that local
     * audio/video tracks can be replaced later.
     */
    const peerSendersRef = useRef(
        new Map<string, PeerSenders>(),
    );

    /*
     * ICE candidates can arrive before the remote
     * description is available.
     */
    const pendingIceCandidatesRef = useRef(
        new Map<string, RTCIceCandidateInit[]>(),
    );

    /*
     * Signaling messages can arrive before local media
     * is available.
     */
    const pendingSignalsRef = useRef<WebRTCSignal[]>(
        [],
    );

    /*
     * Prevent the same participant pair from generating
     * multiple offers.
     *
     * The page decides who is the deterministic initiator.
     */
    const initiatedPeersRef = useRef(
        new Set<string>(),
    );

    const [remoteStreams, setRemoteStreams] =
        useState<Map<string, MediaStream>>(
            new Map(),
        );

    /*
     * Always expose the latest local stream to WebRTC
     * callbacks without recreating every callback.
     */
    const localStreamRef =
        useRef<MediaStream | null>(localStream);

    useEffect(() => {
        localStreamRef.current = localStream;
    }, [localStream]);

    /*
     * Add ICE candidates that arrived before the remote
     * description was available.
     */
    const flushPendingIceCandidates =
        useCallback(
            async (
                remoteUserId: string,
                peerConnection: RTCPeerConnection,
            ) => {
                const pending =
                    pendingIceCandidatesRef.current.get(
                        remoteUserId,
                    );

                if (
                    !pending ||
                    pending.length === 0
                ) {
                    return;
                }

                pendingIceCandidatesRef.current.delete(
                    remoteUserId,
                );

                for (const candidate of pending) {
                    try {
                        await peerConnection.addIceCandidate(
                            candidate,
                        );

                        console.log(
                            "[WebRTC] queued ICE candidate added:",
                            remoteUserId,
                        );
                    } catch (error) {
                        console.error(
                            "[WebRTC] failed to add queued ICE candidate:",
                            remoteUserId,
                            error,
                        );
                    }
                }
            },
            [],
        );

    /*
     * Create one peer connection for one remote participant.
     *
     * This function does NOT create an offer.
     *
     * That decision belongs to ensureConnection().
     */
    const getPeerConnection = useCallback(
        (remoteUserId: string) => {
            const existingConnection =
                peerConnectionsRef.current.get(
                    remoteUserId,
                );

            if (existingConnection) {
                return existingConnection;
            }

            const peerConnection =
                new RTCPeerConnection();

            peerConnectionsRef.current.set(
                remoteUserId,
                peerConnection,
            );

            const currentStream =
                localStreamRef.current;

            console.log(
                "[WebRTC] creating peer connection:",
                {
                    remoteUserId,
                    hasLocalStream:
                        Boolean(currentStream),
                },
            );

            /*
             * Add the current local tracks to this
             * participant's connection.
             */
            if (currentStream) {
                for (const track of currentStream.getTracks()) {
                    peerConnection.addTrack(
                        track,
                        currentStream,
                    );
                }
            }

            /*
             * Remote media.
             *
             * Every peer connection belongs to exactly
             * one remote participant, so the resulting
             * stream is stored under that participant's ID.
             */
            peerConnection.ontrack = (event) => {
                console.log(
                    "[WebRTC] remote track received:",
                    {
                        remoteUserId,
                        kind: event.track.kind,
                        trackId: event.track.id,
                        readyState:
                            event.track.readyState,
                    },
                );

                setRemoteStreams(
                    (currentStreams) => {
                        const nextStreams =
                            new Map(
                                currentStreams,
                            );

                        const existingStream =
                            nextStreams.get(
                                remoteUserId,
                            );

                        const remoteStream =
                            existingStream ??
                            event.streams[0] ??
                            new MediaStream();

                        const alreadyExists =
                            remoteStream
                                .getTracks()
                                .some(
                                    (track) =>
                                        track.id ===
                                        event.track.id,
                                );

                        if (!alreadyExists) {
                            remoteStream.addTrack(
                                event.track,
                            );
                        }

                        nextStreams.set(
                            remoteUserId,
                            remoteStream,
                        );

                        return nextStreams;
                    },
                );
            };

            /*
             * Send ICE candidates through the WebSocket
             * signaling channel to this exact participant.
             */
            peerConnection.onicecandidate = (
                event,
            ) => {
                if (!event.candidate) {
                    return;
                }

                sendMessage({
                    type: "WEBRTC_ICE_CANDIDATE",
                    targetUserId: remoteUserId,
                    candidate:
                        event.candidate.toJSON(),
                });
            };

            /*
             * Connection lifecycle logging.
             */
            peerConnection.onconnectionstatechange =
                () => {
                    console.log(
                        "[WebRTC] connection state:",
                        {
                            remoteUserId,
                            state:
                                peerConnection.connectionState,
                        },
                    );
                };

            return peerConnection;
        },
        [sendMessage],
    );

    /*
     * Keep existing peer connections synchronized with
     * the current local stream.
     *
     * This also supports a future case where the local
     * MediaStream itself gets replaced.
     */
    useEffect(() => {
        const tracksByKind = new Map<
            string,
            MediaStreamTrack
        >();

        if (localStream) {
            for (const track of localStream.getTracks()) {
                tracksByKind.set(
                    track.kind,
                    track,
                );
            }
        }

        for (const [
            remoteUserId,
            senders,
        ] of peerSendersRef.current) {
            const peerConnection =
                peerConnectionsRef.current.get(
                    remoteUserId,
                );

            if (!peerConnection) {
                continue;
            }

            for (const kind of [
                "audio",
                "video",
            ] as const) {
                const sender = senders[kind];

                if (!sender) {
                    continue;
                }

                const nextTrack =
                    tracksByKind.get(kind) ?? null;

                void sender
                    .replaceTrack(nextTrack)
                    .catch((error) => {
                        console.error(
                            "[WebRTC] failed to replace track:",
                            {
                                remoteUserId,
                                kind,
                                error,
                            },
                        );
                    });
            }
        }
    }, [localStream]);

    /*
     * Ensure that a peer connection exists for a
     * particular participant.
     *
     * shouldInitiate is determined by the caller using
     * a deterministic rule:
     *
     *     localUserId < remoteUserId
     *
     * Therefore only one side of a participant pair
     * creates the offer.
     */
    const ensureConnection = useCallback(
        async (
            remoteUserId: string,
            shouldInitiate: boolean,
        ) => {
            if (!remoteUserId) {
                return;
            }

            /*
             * We cannot safely establish the connection
             * until local media exists because the peer
             * connection should contain our current tracks.
             *
             * The caller will retry when local media exists.
             */
            if (!localStreamRef.current) {
                console.log(
                    "[WebRTC] waiting for local media:",
                    remoteUserId,
                );

                return;
            }

            const peerConnection =
                getPeerConnection(
                    remoteUserId,
                );

            /*
             * This participant is the receiver for this
             * pair. The other participant will initiate.
             */
            if (!shouldInitiate) {
                return;
            }

            /*
             * Never create another offer for the same
             * participant unless the peer connection is
             * explicitly removed.
             */
            if (
                initiatedPeersRef.current.has(
                    remoteUserId,
                )
            ) {
                return;
            }

            /*
             * Only create an offer from a stable connection.
             */
            if (
                peerConnection.signalingState !==
                "stable"
            ) {
                return;
            }

            initiatedPeersRef.current.add(
                remoteUserId,
            );

            try {
                console.log(
                    "[WebRTC] initiating connection:",
                    remoteUserId,
                );

                const offer =
                    await peerConnection.createOffer();

                await peerConnection.setLocalDescription(
                    offer,
                );

                sendMessage({
                    type: "WEBRTC_OFFER",
                    targetUserId: remoteUserId,
                    offer,
                });

                console.log(
                    "[WebRTC] offer sent:",
                    remoteUserId,
                );
            } catch (error) {
                /*
                 * Allow a future attempt if offer creation
                 * failed.
                 */
                initiatedPeersRef.current.delete(
                    remoteUserId,
                );

                console.error(
                    "[WebRTC] failed to create/send offer:",
                    remoteUserId,
                    error,
                );
            }
        },
        [getPeerConnection, sendMessage],
    );

    /*
     * Handle incoming WebRTC signaling.
     */
    const handleSignal = useCallback(
        async (message: WebRTCSignal) => {
            /*
             * If local media isn't ready, keep the
             * signaling message and process it later.
             */
            if (!localStreamRef.current) {
                console.log(
                    "[WebRTC] queueing signal until local media exists:",
                    message.type,
                    message.fromUserId,
                );

                pendingSignalsRef.current.push(
                    message,
                );

                return;
            }

            const peerConnection =
                getPeerConnection(
                    message.fromUserId,
                );

            /*
             * OFFER
             */
            if (
                message.type ===
                "WEBRTC_OFFER"
            ) {
                console.log(
                    "[WebRTC] offer received:",
                    message.fromUserId,
                );

                /*
                 * We use deterministic initiation, so an
                 * incoming offer should only arrive while
                 * our side is stable.
                 */
                if (
                    peerConnection.signalingState !==
                    "stable"
                ) {
                    console.log(
                        "[WebRTC] ignoring offer because connection is not stable:",
                        {
                            remoteUserId:
                                message.fromUserId,
                            signalingState:
                                peerConnection.signalingState,
                        },
                    );

                    return;
                }

                await peerConnection.setRemoteDescription(
                    message.offer,
                );

                await flushPendingIceCandidates(
                    message.fromUserId,
                    peerConnection,
                );

                const answer =
                    await peerConnection.createAnswer();

                await peerConnection.setLocalDescription(
                    answer,
                );

                sendMessage({
                    type: "WEBRTC_ANSWER",
                    targetUserId:
                        message.fromUserId,
                    answer,
                });

                console.log(
                    "[WebRTC] answer sent:",
                    message.fromUserId,
                );

                return;
            }

            /*
             * ANSWER
             */
            if (
                message.type ===
                "WEBRTC_ANSWER"
            ) {
                console.log(
                    "[WebRTC] answer received:",
                    message.fromUserId,
                );

                if (
                    peerConnection.signalingState !==
                    "have-local-offer"
                ) {
                    console.log(
                        "[WebRTC] ignoring answer because connection is not waiting for one:",
                        {
                            remoteUserId:
                                message.fromUserId,
                            signalingState:
                                peerConnection.signalingState,
                        },
                    );

                    return;
                }

                await peerConnection.setRemoteDescription(
                    message.answer,
                );

                await flushPendingIceCandidates(
                    message.fromUserId,
                    peerConnection,
                );

                console.log(
                    "[WebRTC] remote answer applied:",
                    message.fromUserId,
                );

                return;
            }

            /*
             * ICE CANDIDATE
             */
            if (
                message.type ===
                "WEBRTC_ICE_CANDIDATE"
            ) {
                /*
                 * ICE can arrive before the offer/answer.
                 */
                if (
                    !peerConnection.remoteDescription
                ) {
                    const pending =
                        pendingIceCandidatesRef.current.get(
                            message.fromUserId,
                        ) ?? [];

                    pending.push(
                        message.candidate,
                    );

                    pendingIceCandidatesRef.current.set(
                        message.fromUserId,
                        pending,
                    );

                    console.log(
                        "[WebRTC] ICE candidate queued:",
                        message.fromUserId,
                    );

                    return;
                }

                try {
                    await peerConnection.addIceCandidate(
                        message.candidate,
                    );

                    console.log(
                        "[WebRTC] ICE candidate added:",
                        message.fromUserId,
                    );
                } catch (error) {
                    console.error(
                        "[WebRTC] failed to add ICE candidate:",
                        {
                            remoteUserId:
                                message.fromUserId,
                            error,
                        },
                    );
                }
            }
        },
        [
            getPeerConnection,
            sendMessage,
            flushPendingIceCandidates,
        ],
    );

    /*
     * Process signals that arrived before local media.
     *
     * Sequential processing is important:
     *
     * OFFER
     *   ↓
     * remote description
     *   ↓
     * ICE candidates
     */
    useEffect(() => {
        if (!localStream) {
            return;
        }

        const pendingSignals =
            pendingSignalsRef.current;

        if (pendingSignals.length === 0) {
            return;
        }

        pendingSignalsRef.current = [];

        const processPendingSignals =
            async () => {
                for (const message of pendingSignals) {
                    await handleSignal(message);
                }
            };

        void processPendingSignals();
    }, [localStream, handleSignal]);

    /*
     * Remove one participant's peer connection.
     *
     * This is called when the participant leaves the
     * interview room.
     */
    const removeParticipant = useCallback(
        (remoteUserId: string) => {
            const peerConnection =
                peerConnectionsRef.current.get(
                    remoteUserId,
                );

            if (peerConnection) {
                peerConnection.ontrack = null;
                peerConnection.onicecandidate = null;
                peerConnection.onconnectionstatechange =
                    null;

                peerConnection.close();
            }

            peerConnectionsRef.current.delete(
                remoteUserId,
            );

            peerSendersRef.current.delete(
                remoteUserId,
            );

            pendingIceCandidatesRef.current.delete(
                remoteUserId,
            );

            initiatedPeersRef.current.delete(
                remoteUserId,
            );

            setRemoteStreams(
                (currentStreams) => {
                    if (
                        !currentStreams.has(
                            remoteUserId,
                        )
                    ) {
                        return currentStreams;
                    }

                    const nextStreams =
                        new Map(
                            currentStreams,
                        );

                    nextStreams.delete(
                        remoteUserId,
                    );

                    return nextStreams;
                },
            );

            console.log(
                "[WebRTC] participant removed:",
                remoteUserId,
            );
        },
        [],
    );

    /*
     * Cleanup everything when the hook unmounts.
     */
    useEffect(() => {
        return () => {
            for (const peerConnection of
                peerConnectionsRef.current.values()) {
                peerConnection.close();
            }

            peerConnectionsRef.current.clear();
            peerSendersRef.current.clear();
            pendingIceCandidatesRef.current.clear();
            pendingSignalsRef.current = [];
            initiatedPeersRef.current.clear();
        };
    }, []);

    return {
        ensureConnection,
        handleSignal,
        removeParticipant,
        remoteStreams,
    };
}