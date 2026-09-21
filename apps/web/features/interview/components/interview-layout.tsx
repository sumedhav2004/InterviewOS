"use client";

import { Code2, FileText } from "lucide-react";

import { VideoPanel } from "./video-panel";

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

          <div className="min-h-0 flex-1 overflow-hidden bg-background p-5">
            <div className="font-mono text-[11px] leading-6 text-muted-foreground">
              <div>
                <span className="mr-5 text-border">01</span>
                <span className="text-primary">function</span>{" "}
                <span className="text-foreground">
                  solution
                </span>
                <span className="text-muted-foreground">
                  ()
                </span>{" "}
                {"{"}
              </div>

              <div>
                <span className="mr-5 text-border">02</span>
                <span className="pl-4 text-muted-foreground">
                  // Start coding...
                </span>
              </div>

              <div>
                <span className="mr-5 text-border">03</span>
                <span>{"}"}</span>
              </div>

              <div className="mt-5 flex items-center gap-2 text-[10px] text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                Editor ready
              </div>
            </div>
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