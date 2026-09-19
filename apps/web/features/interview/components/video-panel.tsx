"use client";

import {
  Mic,
  MoreHorizontal,
  Video,
} from "lucide-react";

export function VideoPanel() {
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

      <div className="grid min-h-0 flex-1 grid-cols-2 gap-px bg-border">
        <div className="relative min-h-[180px] bg-background">
          <div className="absolute inset-0 grid place-items-center">
            <div className="grid h-16 w-16 place-items-center rounded-full border border-primary/30 bg-primary/10">
              <span className="font-mono text-lg text-primary">
                Y
              </span>
            </div>
          </div>

          <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-md border border-border bg-background/80 px-2 py-1 backdrop-blur">
            <span className="text-xs">You</span>
            <Mic className="h-3 w-3 text-muted-foreground" />
          </div>
        </div>

        <div className="relative min-h-[180px] bg-background">
          <div className="absolute inset-0 grid place-items-center">
            <div className="grid h-16 w-16 place-items-center rounded-full border border-border bg-card">
              <span className="font-mono text-lg text-muted-foreground">
                ?
              </span>
            </div>
          </div>

          <div className="absolute bottom-3 left-3 rounded-md border border-border bg-background/80 px-2 py-1 backdrop-blur">
            <span className="text-xs text-muted-foreground">
              Waiting for participant
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}