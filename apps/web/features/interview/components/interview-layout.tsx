"use client";

import { Code2, FileText } from "lucide-react";

import { VideoPanel } from "./video-panel";
import { CodeWorkspace } from "./code-workspace";

type ParticipantMediaState = {
  cameraEnabled: boolean;
  microphoneEnabled: boolean;
};

type InterviewLayoutProps = {
  localStream: MediaStream | null;
  participantIds: string[];
  remoteStreams: Map<string, MediaStream>;
  localMediaState: ParticipantMediaState;
  remoteMediaStates: Map<string, ParticipantMediaState>;
};

export function InterviewLayout({
  localStream,
  participantIds,
  remoteStreams,
  localMediaState,
  remoteMediaStates,
}: InterviewLayoutProps) {
  return (
    <main className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(0,1.45fr)_minmax(360px,0.85fr)]">
      <section className="technical-grid min-h-0 border-b border-border lg:border-b-0 lg:border-r">
        <div className="flex h-full min-h-[420px] flex-col">
          <div className="flex h-10 shrink-0 items-center justify-between border-b border-border bg-card/40 px-3">
            <div className="flex items-center gap-2">
              <Code2 className="h-3.5 w-3.5 text-primary" />

              <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
                Code
              </span>
            </div>

            <span className="font-mono text-[9px] text-muted-foreground">
              main.ts
            </span>
          </div>

          <div className="min-h-0 flex-1 overflow-hidden">
            <CodeWorkspace />
          </div>
        </div>
      </section>

      <aside className="flex min-h-0 flex-col bg-card/20">
        <VideoPanel
          localStream={localStream}
          participantIds={participantIds}
          remoteStreams={remoteStreams}
          localMediaState={localMediaState}
          remoteMediaStates={remoteMediaStates}
        />

        <section className="hidden min-h-[180px] flex-1 flex-col border-t border-border md:flex">
          <div className="flex h-10 shrink-0 items-center gap-2 border-b border-border px-3">
            <FileText className="h-3.5 w-3.5 text-primary" />

            <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
              Activity
            </span>
          </div>

          <div className="p-4">
            <p className="font-mono text-[10px] leading-5 text-muted-foreground">
              Waiting for interview activity...
            </p>
          </div>
        </section>
      </aside>
    </main>
  );
}