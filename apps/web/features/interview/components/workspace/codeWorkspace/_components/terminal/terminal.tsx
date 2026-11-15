import { useRef, useState, type PointerEvent } from "react";

import type { CodeRunTestCaseResult } from "@/features/interview/types/coderun";
import type { SubmissionEvaluation } from "@/features/interview/types/submission";

import { TerminalContent, type TerminalMode } from "./terminal-content";

type Props = {
  mode: TerminalMode;
  codeRun: {
    id: string;
    status: string;
  } | null;
  results: CodeRunTestCaseResult[];
  isRunning: boolean;
  error: string | null;
  submission: {
    id: string;
    status: string;
  } | null;
  evaluation: SubmissionEvaluation | null;
  isSubmitting: boolean;
  submissionError: string | null;
};

const Terminal = ({
  mode,
  codeRun,
  results,
  isRunning,
  error,
  submission,
  evaluation,
  isSubmitting,
  submissionError,
}: Props) => {
  const [height, setHeight] = useState(180);
  const [isOpen, setIsOpen] = useState(true);

  const dragStart = useRef<{
    pointerId: number;
    startY: number;
    startHeight: number;
  } | null>(null);

  const handleResizeStart = (event: PointerEvent<HTMLDivElement>) => {
    event.preventDefault();

    dragStart.current = {
      pointerId: event.pointerId,
      startY: event.clientY,
      startHeight: height,
    };

    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleResize = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragStart.current) return;

    const delta = dragStart.current.startY - event.clientY;

    const nextHeight = Math.min(Math.max(dragStart.current.startHeight + delta, 80), 500);

    setHeight(nextHeight);
  };

  const handleResizeEnd = () => {
    dragStart.current = null;
  };

  return (
    <>
      {isOpen ? (
        <div
          className="absolute inset-x-0 bottom-0 z-20 flex flex-col border-t border-border bg-black shadow-2xl"
          style={{ height }}
        >
          {/* Resize handle */}
          <div
            onPointerDown={handleResizeStart}
            onPointerMove={handleResize}
            onPointerUp={handleResizeEnd}
            onPointerCancel={handleResizeEnd}
            className="group absolute -top-1 left-0 right-0 z-30 flex h-2 touch-none cursor-row-resize items-center justify-center"
          >
            <div className="h-1 w-10 rounded-full bg-muted-foreground/30 transition-colors group-hover:bg-muted-foreground/70" />
          </div>

          {/* Terminal header */}
          <div className="flex h-8 shrink-0 items-center justify-between border-b border-white/10 px-3">
            <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-white/50">
              Terminal
            </span>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-white/30 transition-colors hover:bg-white/5 hover:text-white/70"
            >
              Close
            </button>
          </div>

          {/* Terminal content */}
          <div className="min-h-0 flex-1 overflow-auto p-3">
            <TerminalContent
              mode={mode}
              codeRun={codeRun}
              results={results}
              isRunning={isRunning}
              error={error}
              submission={submission}
              evaluation={evaluation}
              isSubmitting={isSubmitting}
              submissionError={submissionError}
            />
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="absolute bottom-2 right-2 z-20 flex items-center gap-1.5 border border-border/50 bg-background/70 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground/50 backdrop-blur-sm transition-colors hover:border-border hover:bg-background hover:text-muted-foreground"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
          Terminal
        </button>
      )}
    </>
  );
};

export default Terminal;
