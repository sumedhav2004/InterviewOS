"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function useLocalMedia() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [microphoneEnabled, setMicrophoneEnabled] = useState(false);

  const streamRef = useRef<MediaStream | null>(null);

  const startMedia = useCallback(async () => {
    try {
      setError(null);

      const currentStream = streamRef.current;

      if (currentStream) {
        const videoTrack = currentStream.getVideoTracks()[0];

        const audioTrack = currentStream.getAudioTracks()[0];

        if (videoTrack && videoTrack.readyState === "live") {
          videoTrack.enabled = true;
        }

        if (audioTrack && audioTrack.readyState === "live") {
          audioTrack.enabled = true;
        }

        setCameraEnabled(Boolean(videoTrack && videoTrack.readyState === "live"));

        setMicrophoneEnabled(Boolean(audioTrack && audioTrack.readyState === "live"));

        setStream(currentStream);

        return;
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });

      streamRef.current = mediaStream;

      setStream(mediaStream);

      setCameraEnabled(Boolean(mediaStream.getVideoTracks()[0]));

      setMicrophoneEnabled(Boolean(mediaStream.getAudioTracks()[0]));
    } catch (error) {
      console.error("[Media] Failed to access camera/microphone:", error);

      setError("Unable to access camera or microphone.");
    }
  }, []);

  const toggleCamera = useCallback(() => {
    const currentStream = streamRef.current;

    if (!currentStream) {
      return;
    }

    const videoTrack = currentStream.getVideoTracks()[0];

    if (!videoTrack) {
      return;
    }

    if (videoTrack.readyState !== "live") {
      return;
    }

    videoTrack.enabled = !videoTrack.enabled;

    setCameraEnabled(videoTrack.enabled);
  }, []);

  const toggleMicrophone = useCallback(() => {
    const currentStream = streamRef.current;

    if (!currentStream) {
      return;
    }

    const audioTrack = currentStream.getAudioTracks()[0];

    if (!audioTrack) {
      return;
    }

    if (audioTrack.readyState !== "live") {
      return;
    }

    audioTrack.enabled = !audioTrack.enabled;

    setMicrophoneEnabled(audioTrack.enabled);
  }, []);

  const stopMedia = useCallback(() => {
    const currentStream = streamRef.current;

    if (!currentStream) {
      return;
    }

    for (const track of currentStream.getTracks()) {
      track.stop();
    }

    streamRef.current = null;

    setStream(null);
    setCameraEnabled(false);
    setMicrophoneEnabled(false);
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
