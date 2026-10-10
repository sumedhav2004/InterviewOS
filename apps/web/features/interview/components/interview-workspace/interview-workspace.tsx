import React, { PointerEvent, useRef, useState } from 'react'
import { Participant, ParticipantMediaState } from '../../types/participant';
import { ActiveInterviewQuestion } from '../../types/active-question';
import { ProgrammingLanguage } from '../../types/programming-language';
import { CodeRunTestCaseResult } from '../../types/coderun';
import { SubmissionEvaluation, SubmissionTestCaseResult } from '../../types/submission';
import { Code2, FileText } from 'lucide-react';
import { ActiveQuestion } from '../active-question';
import { CodeWorkspace } from '../code-workspace';
import { LanguageSelector } from '../language-selector';
import { Button } from '@/components/ui/button';
import { VideoPanel } from '../video-panel';
import { InterviewWorkspaceType } from '../../types/interview';

type InterviewWorkspaceProps = {
      localStream: MediaStream | null;
      participantIds: string[];
      participants: Participant[];
      remoteStreams: Map<string, MediaStream>;
      localMediaState: ParticipantMediaState;
      remoteMediaStates: Map<
        string,
        ParticipantMediaState
      >;
      code: string;
      onCodeChange: (code: string) => void;
      activeInterviewQuestion:
        | ActiveInterviewQuestion
        | null;
      participant: Participant;
      language: ProgrammingLanguage;
      onLanguageChange: (
        language: ProgrammingLanguage,
      ) => void;
      codeRun: {
        id: string;
        status: string;
      } | null;
      results: CodeRunTestCaseResult[];
      isRunning: boolean;
      error: string | null;
      onRunCode: () => Promise<void>;
    
      submission: {
        id: string;
        status: string;
      } | null;
      submissionResults: SubmissionTestCaseResult[];
      evaluation: SubmissionEvaluation | null;
      isSubmitting: boolean;
      submissionError: string | null;
      onSubmit: () => Promise<void>;
}

type TerminalMode = "RUN" | "SUBMIT" | null;

const InterviewWorkspace = ({
  localStream,
  participantIds,
  participants,
  remoteStreams,
  localMediaState,
  remoteMediaStates,
  code,
  onCodeChange,
  activeInterviewQuestion,
  participant,
  language,
  onLanguageChange,
  codeRun,
  results,
  isRunning,
  error,
  onRunCode,
  submission,
  submissionResults,
  evaluation,
  isSubmitting,
  submissionError,
  onSubmit,
}: InterviewWorkspaceProps) => {
    const [terminalHeight, setTerminalHeight] =
        useState(180);
      const [terminalOpen, setTerminalOpen] =
        useState(true);
      const [terminalMode, setTerminalMode] =
        useState<TerminalMode>(null);
      const isDragging = useRef(false);
    
      const isCandidate =
        participant?.role === "CANDIDATE";
    
      const handleRun = async () => {
        setTerminalMode("RUN");
        await onRunCode();
      };
    
      const handleSubmit = async () => {
        setTerminalMode("SUBMIT");
        await onSubmit();
      };
    
      const handleTerminalResizeStart = (
        event: PointerEvent<HTMLDivElement>,
      ) => {
        event.preventDefault();
    
        isDragging.current = true;
    
        const startY = event.clientY;
        const startHeight = terminalHeight;
    
        const handlePointerMove = (
          pointerEvent: PointerEvent,
        ) => {
          if (!isDragging.current) {
            return;
          }
    
          const delta =
            startY - pointerEvent.clientY;
    
          const newHeight = Math.min(
            Math.max(
              startHeight + delta,
              80,
            ),
            500,
          );
    
          setTerminalHeight(newHeight);
        };
    
        const handlePointerUp = () => {
          isDragging.current = false;
    
          window.removeEventListener(
            "pointermove",
            handlePointerMove,
          );
    
          window.removeEventListener(
            "pointerup",
            handlePointerUp,
          );
        };
    
        window.addEventListener(
          "pointermove",
          handlePointerMove,
        );
    
        window.addEventListener(
          "pointerup",
          handlePointerUp,
        );
      };
    
      
      const activeTerminalMode: TerminalMode =
        terminalMode ??
        (evaluation || submission || isSubmitting
          ? "SUBMIT"
          : codeRun || results.length > 0 || isRunning
            ? "RUN"
            : null);
  return (
    <main className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(0,1.45fr)_minmax(360px,0.85fr)]">
      <section className="technical-grid min-h-0 border-b border-border lg:border-b-0 lg:border-r">
        <div className="flex h-full min-h-[420px] flex-col">
          {/* Code header */}
          <div className="flex h-10 shrink-0 items-center justify-between border-b border-border bg-card/40 px-3">
            <div className="flex items-center gap-2">
              <Code2 className="h-3.5 w-3.5 text-primary" />

              <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
                Code
              </span>
            </div>

            {isCandidate ? (
              <LanguageSelector
                value={language}
                onChange={onLanguageChange}
              />
            ) : (
              <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
                {language}
              </span>
            )}
          </div>

          {/* Editor area */}
          <div className="relative min-h-0 flex-1 overflow-hidden">
            <div className="flex h-full min-h-0">
              <ActiveQuestion
                question={activeInterviewQuestion}
              />

              <div className="relative flex min-w-0 flex-1">
                {/* Code editor */}
                <div className="h-full w-full">
                  <CodeWorkspace
                    code={code}
                    onCodeChange={onCodeChange}
                    language={language}
                  />
                </div>

                {/* Candidate actions */}
                {isCandidate && (
                  <div className="absolute bottom-2 left-2 z-10 flex gap-2">
                    <Button
                      variant="outline"
                      onClick={handleRun}
                      disabled={
                        isRunning ||
                        isSubmitting
                      }
                    >
                      {isRunning
                        ? "Running..."
                        : "Run"}
                    </Button>

                    <Button
                      onClick={handleSubmit}
                      disabled={
                        isRunning ||
                        isSubmitting
                      }
                    >
                      {isSubmitting
                        ? "Submitting..."
                        : "Submit"}
                    </Button>
                  </div>
                )}

                {/* Terminal */}
                {terminalOpen ? (
                  <div
                    className="absolute inset-x-0 bottom-0 z-20 flex flex-col border-t border-border bg-black shadow-2xl"
                    style={{
                      height: terminalHeight,
                    }}
                  >
                    {/* Resize handle */}
                    <div
                      onPointerDown={
                        handleTerminalResizeStart
                      }
                      className="group absolute -top-1 left-0 right-0 z-30 flex h-2 cursor-row-resize items-center justify-center"
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
                        onClick={() =>
                          setTerminalOpen(false)
                        }
                        className="rounded px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-white/30 transition-colors hover:bg-white/5 hover:text-white/70"
                      >
                        Close
                      </button>
                    </div>

                    {/* Terminal content */}
                    <div className="min-h-0 flex-1 overflow-auto p-3">

                      {/* ================================================== */}
                      {/* RUN MODE                                            */}
                      {/* ================================================== */}

                      {activeTerminalMode === "RUN" ? (
                        <>
                          {/* Code run error */}
                          {error ? (
                            <pre className="font-mono text-[11px] leading-5 text-red-400">
                              {error}
                            </pre>
                          ) : isRunning ? (
                            /* Code run in progress */
                            <pre className="font-mono text-[11px] leading-5 text-white/70">
                              $ Running...
                            </pre>
                          ) : results.length > 0 ? (
                            /* Code run results */
                            <div className="space-y-3">
                              <div className="font-mono text-[9px] uppercase tracking-[0.16em] text-white/30">
                                Code Run
                              </div>

                              {results.map((result) => (
                                <div
                                  key={result.id}
                                  className="border-b border-white/10 pb-3 last:border-b-0"
                                >
                                  <div className="flex items-center justify-between gap-3">
                                    <span className="font-mono text-[10px] text-white/60">
                                      Test Case{" "}
                                      {result.testCaseId}
                                    </span>

                                    <span
                                      className={`font-mono text-[10px] uppercase ${
                                        result.passed
                                          ? "text-green-400"
                                          : "text-red-400"
                                      }`}
                                    >
                                      {result.passed
                                        ? "PASSED"
                                        : "FAILED"}
                                    </span>
                                  </div>

                                  {result.stdout && (
                                    <div className="mt-2">
                                      <div className="font-mono text-[9px] uppercase tracking-wider text-white/30">
                                        stdout
                                      </div>

                                      <pre className="mt-1 whitespace-pre-wrap font-mono text-[11px] leading-5 text-white/70">
                                        {result.stdout}
                                      </pre>
                                    </div>
                                  )}

                                  {result.stderr && (
                                    <div className="mt-2">
                                      <div className="font-mono text-[9px] uppercase tracking-wider text-red-400/60">
                                        stderr
                                      </div>

                                      <pre className="mt-1 whitespace-pre-wrap font-mono text-[11px] leading-5 text-red-400">
                                        {result.stderr}
                                      </pre>
                                    </div>
                                  )}

                                  {result.executionTimeMS !==
                                    null && (
                                    <div className="mt-2 font-mono text-[9px] text-white/30">
                                      {
                                        result.executionTimeMS
                                      }
                                      ms
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : codeRun ? (
                            /* Existing code run */
                            <div className="space-y-2">
                              <div className="font-mono text-[9px] uppercase tracking-[0.16em] text-white/30">
                                Code Run
                              </div>

                              <div className="flex items-center justify-between gap-3">
                                <span className="font-mono text-[11px] text-white/60">
                                  {codeRun.id}
                                </span>

                                <span className="font-mono text-[10px] uppercase text-white/70">
                                  {codeRun.status}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <pre className="font-mono text-[11px] leading-5 text-white/70">
                              $ Ready to run your code...
                            </pre>
                          )}
                        </>
                      ) : activeTerminalMode === "SUBMIT" ? (
                        /* ================================================== */
                        /* SUBMIT MODE                                         */
                        /* ================================================== */

                        <>
                          {/* Submission error */}
                          {submissionError ? (
                            <pre className="font-mono text-[11px] leading-5 text-red-400">
                              {submissionError}
                            </pre>
                          ) : isSubmitting ? (
                            /* Submission in progress */
                            <pre className="font-mono text-[11px] leading-5 text-white/70">
                              $ Submitting...
                            </pre>
                          ) : evaluation ? (
                            /* Completed submission */
                            <div className="space-y-3">
                              <div className="border-b border-white/10 pb-3">
                                <div className="font-mono text-[9px] uppercase tracking-[0.16em] text-white/30">
                                  Submission
                                </div>

                                <div className="mt-1 flex items-center justify-between gap-3">
                                  <span className="font-mono text-[11px] text-white/70">
                                    Evaluation
                                  </span>

                                  <span
                                    className={`font-mono text-[10px] uppercase ${
                                      evaluation.status ===
                                      "PASSED"
                                        ? "text-green-400"
                                        : "text-red-400"
                                    }`}
                                  >
                                    {evaluation.status}
                                  </span>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <div className="font-mono text-[9px] uppercase tracking-wider text-white/30">
                                    Score
                                  </div>

                                  <div className="mt-1 font-mono text-[14px] text-white/80">
                                    {evaluation.score}
                                  </div>
                                </div>

                                <div>
                                  <div className="font-mono text-[9px] uppercase tracking-wider text-white/30">
                                    Tests
                                  </div>

                                  <div className="mt-1 font-mono text-[14px] text-white/80">
                                    {evaluation.passedTests}/
                                    {evaluation.totalTests}
                                  </div>
                                </div>
                              </div>

                              {evaluation.executionTimeMS !==
                                null && (
                                <div className="font-mono text-[9px] text-white/30">
                                  Total execution time:{" "}
                                  {
                                    evaluation.executionTimeMS
                                  }
                                  ms
                                </div>
                              )}
                            </div>
                          ) : submission ? (
                            /* Existing submission */
                            <div className="space-y-2">
                              <div className="font-mono text-[9px] uppercase tracking-[0.16em] text-white/30">
                                Submission
                              </div>

                              <div className="flex items-center justify-between gap-3">
                                <span className="font-mono text-[11px] text-white/60">
                                  {submission.id}
                                </span>

                                <span className="font-mono text-[10px] uppercase text-white/70">
                                  {submission.status}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <pre className="font-mono text-[11px] leading-5 text-white/70">
                              $ Ready to submit...
                            </pre>
                          )}
                        </>
                      ) : (
                        /* ================================================== */
                        /* INITIAL STATE                                       */
                        /* ================================================== */

                        <pre className="font-mono text-[11px] leading-5 text-white/70">
                          {`$ Ready to run your code...

`}
                        </pre>
                      )}
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      setTerminalOpen(true)
                    }
                    className="absolute bottom-2 right-2 z-20 flex items-center gap-1.5 border border-border/50 bg-background/70 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground/50 backdrop-blur-sm transition-colors hover:border-border hover:bg-background hover:text-muted-foreground"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />

                    Terminal
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Right panel */}
      <aside className="flex min-h-0 flex-col bg-card/20">
        <VideoPanel
          localStream={localStream}
          participantIds={participantIds}
          participants={participants}
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

          <div className="flex-1 overflow-y-auto p-4">
            {!activeInterviewQuestion ? (
              <p className="font-mono text-[10px] leading-5 text-muted-foreground">
                No active question.
              </p>
            ) : (
              <div className="space-y-3">
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground">
                    Question{" "}
                    {
                      activeInterviewQuestion.questionOrder
                    }
                  </p>

                  <h2 className="mt-1 text-sm font-medium">
                    {
                      activeInterviewQuestion
                        .question.title
                    }
                  </h2>
                </div>

                <p className="font-mono text-[10px] leading-5 text-muted-foreground">
                  {
                    activeInterviewQuestion
                      .question.description
                  }
                </p>

                <div className="flex items-center gap-3 font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
                  <span>
                    Difficulty:{" "}
                    {
                      activeInterviewQuestion
                        .question.difficulty
                    }
                  </span>

                  <span>
                    Points:{" "}
                    {activeInterviewQuestion.points}
                  </span>
                </div>
              </div>
            )}
          </div>
        </section>
      </aside>
    </main>
  )
}

export default InterviewWorkspace