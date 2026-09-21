"use client";

import {
  Camera,
  CameraOff,
  Mic,
  MicOff,
} from "lucide-react";
import { useEffect, useRef } from "react";

type ParticipantTileProps = {
  name: string;
  stream?: MediaStream | null;
  muted?: boolean;
  microphoneEnabled?: boolean;
  cameraEnabled?: boolean;
  isLocal?: boolean;
};

export function ParticipantTile({
  name,
  stream,
  muted = false,
  microphoneEnabled = true,
  cameraEnabled = true,
  isLocal = false,
}: ParticipantTileProps) {
  const videoRef =
    useRef<HTMLVideoElement>(null);

  /*
   * Keep the video element mounted.
   *
   * We only change its srcObject when the MediaStream
   * changes.
   */
  useEffect(() => {
    const video =
      videoRef.current;

    if (!video) {
      return;
    }

    video.srcObject =
      stream ?? null;

    if (!stream) {
      return;
    }

    void video.play().catch((error) => {
      /*
       * The browser can reject play() if the element
       * is being updated during a media transition.
       *
       * AbortError is harmless here.
       */
      if (
        error instanceof DOMException &&
        error.name === "AbortError"
      ) {
        return;
      }

      console.error(
        "[Video] Failed to play participant video:",
        error,
      );
    });

    return () => {
      if (
        video.srcObject === stream
      ) {
        video.srcObject = null;
      }
    };
  }, [stream]);

  const initials = name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const showVideo =
    Boolean(stream) &&
    cameraEnabled;

  return (
    <div className="relative min-h-[180px] overflow-hidden bg-background">
      {/*
       * Video stays mounted even when hidden.
       */
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={muted}
        className={
          showVideo
            ? "absolute inset-0 h-full w-full object-cover"
            : "absolute inset-0 h-full w-full object-cover opacity-0"
        }
      />

    }
      {!showVideo && (
        <div className="absolute inset-0 grid place-items-center">
          <div
            className={
              isLocal
                ? "grid h-16 w-16 place-items-center rounded-full border border-primary/30 bg-primary/10"
                : "grid h-16 w-16 place-items-center rounded-full border border-border bg-card"
            }
          >
            <span
              className={
                isLocal
                  ? "font-mono text-lg text-primary"
                  : "font-mono text-lg text-muted-foreground"
              }
            >
              {initials || "?"}
            </span>
          </div>
        </div>
      )}

      <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-md border border-border bg-background/80 px-2 py-1 backdrop-blur">
        <span className="text-xs">
          {isLocal ? "You" : name}
        </span>

        {microphoneEnabled ? (
          <Mic className="h-3 w-3 text-muted-foreground" />
        ) : (
          <MicOff className="h-3 w-3 text-destructive" />
        )}

        {cameraEnabled ? (
          <Camera className="h-3 w-3 text-muted-foreground" />
        ) : (
          <CameraOff className="h-3 w-3 text-destructive" />
        )}
      </div>
    </div>
  );
}