"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function useLocalMedia() {
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [cameraEnabled, setCameraEnabled] = useState(false);
    const [microphoneEnabled, setMicrophoneEnabled] =
        useState(false);

    const streamRef = useRef<MediaStream | null>(null);

    const startMedia = useCallback(async () => {
        console.log("[Media] startMedia called");

        try {
            setError(null);

            const currentStream = streamRef.current;

            if (currentStream) {
                const videoTrack =
                    currentStream.getVideoTracks()[0];

                const audioTrack =
                    currentStream.getAudioTracks()[0];

                if (
                    videoTrack &&
                    videoTrack.readyState === "live"
                ) {
                    videoTrack.enabled = true;
                }

                if (
                    audioTrack &&
                    audioTrack.readyState === "live"
                ) {
                    audioTrack.enabled = true;
                }

                setCameraEnabled(
                    Boolean(
                        videoTrack &&
                            videoTrack.readyState === "live",
                    ),
                );

                setMicrophoneEnabled(
                    Boolean(
                        audioTrack &&
                            audioTrack.readyState === "live",
                    ),
                );

                setStream(currentStream);

                console.log(
                    "[Media] existing stream re-enabled",
                );

                return;
            }

            const mediaStream =
                await navigator.mediaDevices.getUserMedia({
                    audio: true,
                    video: true,
                });

            console.log("[Media] getUserMedia succeeded:", {
                streamId: mediaStream.id,
                tracks: mediaStream.getTracks().map((track) => ({
                    kind: track.kind,
                    enabled: track.enabled,
                    readyState: track.readyState,
                })),
            });

            streamRef.current = mediaStream;

            setStream(mediaStream);

            setCameraEnabled(
                Boolean(mediaStream.getVideoTracks()[0]),
            );

            setMicrophoneEnabled(
                Boolean(mediaStream.getAudioTracks()[0]),
            );

            console.log("[Media] stream state updated");
        } catch (error) {
            console.error(
                "[Media] Failed to access camera/microphone:",
                error,
            );

            setError(
                "Unable to access camera or microphone.",
            );
        }
    }, []);

    const toggleCamera = useCallback(() => {
        const currentStream = streamRef.current;

        if (!currentStream) {
            console.log(
                "[Media] Cannot toggle camera: no stream",
            );
            return;
        }

        const videoTrack =
            currentStream.getVideoTracks()[0];

        if (!videoTrack) {
            console.log(
                "[Media] Cannot toggle camera: no video track",
            );
            return;
        }

        if (videoTrack.readyState !== "live") {
            console.log(
                "[Media] Cannot toggle camera: video track is not live",
            );
            return;
        }

        videoTrack.enabled = !videoTrack.enabled;

        setCameraEnabled(videoTrack.enabled);

        console.log(
            "[Media] camera:",
            videoTrack.enabled ? "enabled" : "disabled",
        );
    }, []);

    const toggleMicrophone = useCallback(() => {
        const currentStream = streamRef.current;

        if (!currentStream) {
            console.log(
                "[Media] Cannot toggle microphone: no stream",
            );
            return;
        }

        const audioTrack =
            currentStream.getAudioTracks()[0];

        if (!audioTrack) {
            console.log(
                "[Media] Cannot toggle microphone: no audio track",
            );
            return;
        }

        if (audioTrack.readyState !== "live") {
            console.log(
                "[Media] Cannot toggle microphone: audio track is not live",
            );
            return;
        }

        audioTrack.enabled = !audioTrack.enabled;

        setMicrophoneEnabled(audioTrack.enabled);

        console.log(
            "[Media] microphone:",
            audioTrack.enabled
                ? "enabled"
                : "disabled",
        );
    }, []);

    const stopMedia = useCallback(() => {
        console.log("[Media] stopMedia called");

        const currentStream = streamRef.current;

        if (!currentStream) {
            console.log("[Media] no active stream");
            return;
        }

        for (const track of currentStream.getTracks()) {
            track.stop();
        }

        streamRef.current = null;

        setStream(null);
        setCameraEnabled(false);
        setMicrophoneEnabled(false);

        console.log("[Media] stream stopped");
    }, []);

    useEffect(() => {
        return () => {
            const currentStream = streamRef.current;

            if (!currentStream) {
                return;
            }

            for (const track of currentStream.getTracks()) {
                track.stop();
            }

            streamRef.current = null;
        };
    }, []);

    return {
        stream,
        error,

        cameraEnabled,
        microphoneEnabled,

        startMedia,
        toggleCamera,
        toggleMicrophone,
        stopMedia,
    };
}