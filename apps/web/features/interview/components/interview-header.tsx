"use client";

import {
  CircleDot,
  Clock3,
  ShieldCheck,
} from "lucide-react";

import type { Interview } from "../types/interview";

type InterviewHeaderProps = {
  interview: Interview;
};

export function InterviewHeader({
  interview,
}: InterviewHeaderProps) {
  const statusLabel =
    interview.status === "INPROGRESS"
      ? "LIVE"
      : interview.status;

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-xl sm:px-6">
      <div className="flex min-w-0 items-center gap-4">
        <div className="hidden h-8 w-8 shrink-0 place-items-center rounded-md border border-primary/40 bg-primary/10 sm:grid">
          <CircleDot className="h-4 w-4 text-primary" />
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-medium">
            {interview.title}
          </p>

          <div className="mt-0.5 flex items-center gap-2 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
            <span>InterviewOS</span>
            <span className="text-border">/</span>
            <span>{interview.durationMinutes} MIN</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 font-mono text-[10px] text-muted-foreground sm:flex">
          <Clock3 className="h-3.5 w-3.5" />
          <span>00:00</span>
        </div>

        <div className="flex items-center gap-2 rounded-md border border-primary/30 bg-primary/10 px-2.5 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_currentColor]" />
          <span className="font-mono text-[9px] font-medium uppercase tracking-widest text-primary">
            {statusLabel}
          </span>
        </div>

        <div className="hidden items-center gap-1.5 text-muted-foreground lg:flex">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span className="font-mono text-[9px] uppercase tracking-widest">
            Private room
          </span>
        </div>
      </div>
    </header>
  );
}