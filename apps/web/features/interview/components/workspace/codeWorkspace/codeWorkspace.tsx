import React, { useRef, useState, type PointerEvent } from "react";
import CodeHeader from "./_components/code-header";
import { ActiveQuestion } from "./_components/active-question";
import { EditorArea } from "./_components/EditorArea";
import { Button } from "@/components/ui/button";
import { ActiveInterviewQuestion } from "@/features/interview/types/active-question";
import { Participant } from "@/features/interview/types/participant";
import { ProgrammingLanguage } from "@/features/interview/types/programming-language";
import { CodeRunTestCaseResult } from "@/features/interview/types/coderun";
import {
  SubmissionEvaluation,
  SubmissionTestCaseResult,
} from "@/features/interview/types/submission";
import Terminal from "./_components/terminal/terminal";

type Props = {
  code: string;
  onCodeChange: (code: string) => void;
  activeInterviewQuestion: ActiveInterviewQuestion | null;
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

  isCandidate: boolean;
};

type TerminalMode = "RUN" | "SUBMIT" | null;

const CodeWorkspace = ({
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
  isCandidate,
}: Props) => {
  const [terminalMode, setTerminalMode] = useState<TerminalMode>(null);

  const handleRun = async () => {
    setTerminalMode("RUN");
    await onRunCode();
  };

  const handleSubmit = async () => {
    setTerminalMode("SUBMIT");
    await onSubmit();
  };
  const activeTerminalMode: TerminalMode =
    terminalMode ??
    (evaluation || submission || isSubmitting
      ? "SUBMIT"
      : codeRun || results.length > 0 || isRunning
        ? "RUN"
        : null);

  return (
    <section className="technical-grid min-h-0 border-b border-red-500 lg:border-b-0 lg:border-r">
      <div className="flex h-full min-h-[420px] flex-col">
        {/* Code header */}
        <CodeHeader
          language={language}
          onLanguageChange={onLanguageChange}
          isCandidate={isCandidate}
        />

        {/* Editor area */}
        <div className="relative min-h-0 flex-1 overflow-hidden">
          <div className="flex h-full min-h-0">
            <ActiveQuestion question={activeInterviewQuestion} />

            <div className="relative flex min-w-0 flex-1">
              {/* Code editor */}
              <div className="h-full w-full">
                <EditorArea code={code} onCodeChange={onCodeChange} language={language} />
              </div>

              {/* Candidate actions */}
              {isCandidate && (
                <div className="absolute bottom-2 left-2 z-10 flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleRun}
                    disabled={isRunning || isSubmitting}
                  >
                    {isRunning ? "Running..." : "Run"}
                  </Button>

                  <Button onClick={handleSubmit} disabled={isRunning || isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Submit"}
                  </Button>
                </div>
              )}

              {/* Terminal */}
              <Terminal
                mode={activeTerminalMode}
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
        </div>
      </div>
    </section>
  );
};

export default CodeWorkspace;
