import React, { useRef, useState, type PointerEvent } from "react";
import { Participant, ParticipantMediaState } from "../../types/participant";
import { ActiveInterviewQuestion } from "../../types/active-question";
import { ProgrammingLanguage } from "../../types/programming-language";
import { CodeRunTestCaseResult } from "../../types/coderun";
import { SubmissionEvaluation, SubmissionTestCaseResult } from "../../types/submission";
import { Button } from "@/components/ui/button";
import InterviewSidebar from "../sidebar/interview-sidebar";
import { ActiveQuestion } from "./codeWorkspace/_components/active-question";
import CodeHeader from "./codeWorkspace/_components/code-header";
import { EditorArea } from "./codeWorkspace/_components/EditorArea";
import CodeWorkspace from "./codeWorkspace/codeWorkspace";
import WhiteBoardWorkspce from "./whiteBoardWorkspace/whiteBoardWorkspce";
import { InterviewQuestion, InterviewWorkspaceType } from "../../types/interview";

type InterviewWorkspaceProps = {
  localStream: MediaStream | null;
  participantIds: string[];
  participants: Participant[];
  remoteStreams: Map<string, MediaStream>;
  localMediaState: ParticipantMediaState;
  remoteMediaStates: Map<string, ParticipantMediaState>;
  code: string;
  onCodeChange: (code: string) => void;
  activeInterviewQuestion: InterviewQuestion | null;
  participant: Participant;
  language: ProgrammingLanguage;
  onLanguageChange: (language: ProgrammingLanguage) => void;
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
  workspace: InterviewWorkspaceType;

  deleteActiveQuestion: () => Promise<void>;
  addActiveQuestion: (interviewId: string) => Promise<void>;
  onOpenQuestionDialog: () => void;
};

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
  workspace,
  deleteActiveQuestion,
  addActiveQuestion,
  onOpenQuestionDialog,
}: InterviewWorkspaceProps) => {
  const [terminalHeight, setTerminalHeight] = useState(180);
  const [terminalOpen, setTerminalOpen] = useState(true);
  const [terminalMode, setTerminalMode] = useState<TerminalMode>(null);
  const isDragging = useRef(false);

  const isCandidate = participant?.role === "CANDIDATE";

  const handleRun = async () => {
    setTerminalMode("RUN");
    await onRunCode();
  };

  const handleSubmit = async () => {
    setTerminalMode("SUBMIT");
    await onSubmit();
  };

  const handleTerminalResizeStart = (event: PointerEvent<HTMLDivElement>) => {
    event.preventDefault();

    isDragging.current = true;

    const startY = event.clientY;
    const startHeight = terminalHeight;

    const handlePointerMove = (pointerEvent: globalThis.PointerEvent) => {
      if (!isDragging.current) {
        return;
      }

      const delta = startY - pointerEvent.clientY;

      const newHeight = Math.min(Math.max(startHeight + delta, 80), 500);

      setTerminalHeight(newHeight);
    };

    const handlePointerUp = () => {
      isDragging.current = false;

      window.removeEventListener("pointermove", handlePointerMove);

      window.removeEventListener("pointerup", handlePointerUp);
    };

    window.addEventListener("pointermove", handlePointerMove);

    window.addEventListener("pointerup", handlePointerUp);
  };

  const activeTerminalMode: TerminalMode =
    terminalMode ??
    (evaluation || submission || isSubmitting
      ? "SUBMIT"
      : codeRun || results.length > 0 || isRunning
        ? "RUN"
        : null);
  return (
    <main className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(0,1.85fr)_minmax(360px,1fr)]">
      {workspace === "CODE" ? (
        <CodeWorkspace
          code={code}
          onCodeChange={onCodeChange}
          activeInterviewQuestion={activeInterviewQuestion}
          participant={participant}
          language={language}
          onLanguageChange={onLanguageChange}
          codeRun={codeRun}
          results={results}
          isRunning={isRunning}
          error={error}
          onRunCode={onRunCode}
          submission={submission}
          submissionResults={submissionResults}
          evaluation={evaluation}
          isSubmitting={isSubmitting}
          submissionError={submissionError}
          onSubmit={onSubmit}
          isCandidate={isCandidate}

          deleteActiveQuestion={deleteActiveQuestion}
          addActiveQuestion={addActiveQuestion}
          onOpenQuestionDialog={onOpenQuestionDialog}
        />
      ) : (
        <WhiteBoardWorkspce />
      )}

      {/* Right panel */}
      <InterviewSidebar
        localStream={localStream}
        participantIds={participantIds}
        participants={participants}
        remoteStreams={remoteStreams}
        localMediaState={localMediaState}
        remoteMediaStates={remoteMediaStates}
      />
    </main>
  );
};

export default InterviewWorkspace;
