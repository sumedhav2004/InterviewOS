"use client";

import {
  MoreHorizontal,
  Video,
} from "lucide-react";

import { ParticipantTile } from "./participant-tile";

type ParticipantMediaState = {
  cameraEnabled: boolean;
  microphoneEnabled: boolean;
};

type VideoPanelProps = {
  localStream: MediaStream | null;
  participantIds: string[];
  remoteStreams: Map<string, MediaStream>;
  localMediaState: ParticipantMediaState;
  remoteMediaStates: Map<string, ParticipantMediaState>;
};

export function VideoPanel({
  localStream,
  participantIds,
  remoteStreams,
  localMediaState,
  remoteMediaStates,
}: VideoPanelProps) {
  /*
   * participantIds represents room membership.
   *
   * remoteStreams only contains participants for whom
   * we have already received media.
   *
   * These are intentionally separate.
   *
   * A participant can be in the room before their
   * WebRTC media arrives.
   */

  return (
    <section className="flex min-h-0 flex-1 flex-col border-b border-border bg-card/30">
      <div className="flex h-10 shrink-0 items-center justify-between border-b border-border px-3">
        <div className="flex items-center gap-2">
          <Video className="h-3.5 w-3.5 text-primary" />

          <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
            Video
          </span>
        </div>

        <button
          type="button"
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-auto bg-border">
        <div className="grid min-h-full grid-cols-1 gap-px sm:grid-cols-2">
          <ParticipantTile
            name="You"
            stream={localStream}
            muted
            microphoneEnabled={
              localMediaState.microphoneEnabled
            }
            cameraEnabled={
              localMediaState.cameraEnabled
            }
            isLocal
          />

          {participantIds.map(
            (participantId, index) => {
              const remoteStream =
                remoteStreams.get(
                  participantId,
                );

              const remoteMediaState =
                remoteMediaStates.get(
                  participantId,
                );

              return (
                <ParticipantTile
                  key={participantId}
                  name={`Participant ${index + 1}`}
                  stream={remoteStream}
                  microphoneEnabled={
                    remoteMediaState
                      ?.microphoneEnabled ??
                    true
                  }
                  cameraEnabled={
                    remoteMediaState
                      ?.cameraEnabled ??
                    true
                  }
                />
              );
            },
          )}
        </div>
      </div>
    </section>
  );
}