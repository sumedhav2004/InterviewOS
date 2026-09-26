"use client";

import { Code2, FileText } from "lucide-react";

import { VideoPanel } from "./video-panel";
import { CodeWorkspace } from "./code-workspace";
import { ActiveQuestion } from "./active-question";

import { LanguageSelector } from "./language-selector";
import { ProgrammingLanguage } from "../types/programming-language";

type ParticipantMediaState = {
  cameraEnabled: boolean;
  microphoneEnabled: boolean;
};

type TestCase = {
  id: string;
  input: unknown;
  expectedOutput: unknown;
};

type ActiveInterviewQuestion = {
  id: string;
  questionOrder: number;
  points: number;
  question: {
    id: string;
    title: string;
    description: string;
    difficulty: string;
    testCases: TestCase[];
  };
};

type InterviewLayoutProps = {
  localStream: MediaStream | null;
  participantIds: string[];
  remoteStreams: Map<string, MediaStream>;
  localMediaState: ParticipantMediaState;
  remoteMediaStates: Map<string, ParticipantMediaState>;
  code: string;
  onCodeChange: (code: string) => void;
  activeInterviewQuestion: ActiveInterviewQuestion | null;

  participantRole: "INTERVIEWER" | "CANDIDATE" | "OBSERVER";

  language: ProgrammingLanguage;
  onLanguageChange: (
    language: ProgrammingLanguage,
  ) => void;
};

export function InterviewLayout({
  localStream,
  participantIds,
  remoteStreams,
  localMediaState,
  remoteMediaStates,
  code,
  onCodeChange,
  activeInterviewQuestion,
  participantRole,
  language,
  onLanguageChange
}: InterviewLayoutProps) {

  console.log("[InterviewLayout] role:", participantRole);
console.log("[InterviewLayout] language:", language);
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

            {participantRole === "CANDIDATE" ? (
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

          <div className="min-h-0 flex flex-1 ">
            <ActiveQuestion question={activeInterviewQuestion} />
            <CodeWorkspace
                code={code}
                onCodeChange={onCodeChange}
                language={language}
            />
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

          <div className="flex-1 overflow-y-auto p-4">
  {!activeInterviewQuestion ? (
    <p className="font-mono text-[10px] leading-5 text-muted-foreground">
      No active question.
    </p>
  ) : (
    <div className="space-y-3">
      <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground">
              Question {activeInterviewQuestion.questionOrder}
            </p>

            <h2 className="mt-1 text-sm font-medium">
              {activeInterviewQuestion.question.title}
            </h2>
          </div>

          <p className="font-mono text-[10px] leading-5 text-muted-foreground">
            {activeInterviewQuestion.question.description}
          </p>

          <div className="flex items-center gap-3 font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
            <span>
              Difficulty: {activeInterviewQuestion.question.difficulty}
            </span>

            <span>
              Points: {activeInterviewQuestion.points}
            </span>
          </div>

        </div>
      )}
    </div>
        </section>
      </aside>
    </main>
  );
}