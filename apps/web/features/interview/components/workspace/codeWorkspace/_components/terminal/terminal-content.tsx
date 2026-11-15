import { CodeRunTestCaseResult } from "@/features/interview/types/coderun";
import { SubmissionEvaluation } from "@/features/interview/types/submission";

export type TerminalMode = "RUN" | "SUBMIT" | null;

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

export function TerminalContent({
  mode,
  codeRun,
  results,
  isRunning,
  error,
  submission,
  evaluation,
  isSubmitting,
  submissionError,
}: Props) {
  if (mode === "RUN") {
    if (error) {
      return <pre className="font-mono text-[11px] leading-5 text-red-400">{error}</pre>;
    }

    if (isRunning) {
      return <pre className="font-mono text-[11px] leading-5 text-white/70">$ Running...</pre>;
    }

    if (results.length > 0) {
      return (
        <div className="space-y-3">
          <div className="font-mono text-[9px] uppercase tracking-[0.16em] text-white/30">
            Code Run
          </div>

          {results.map((result) => (
            <div key={result.id} className="border-b border-white/10 pb-3 last:border-b-0">
              <div className="flex items-center justify-between gap-3">
                <span className="font-mono text-[10px] text-white/60">
                  Test Case {result.testCaseId}
                </span>

                <span
                  className={`font-mono text-[10px] uppercase ${
                    result.passed ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {result.passed ? "PASSED" : "FAILED"}
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

              {result.executionTimeMS !== null && (
                <div className="mt-2 font-mono text-[9px] text-white/30">
                  {result.executionTimeMS}ms
                </div>
              )}
            </div>
          ))}
        </div>
      );
    }

    if (codeRun) {
      return (
        <div className="space-y-2">
          <div className="font-mono text-[9px] uppercase tracking-[0.16em] text-white/30">
            Code Run
          </div>

          <div className="flex items-center justify-between gap-3">
            <span className="font-mono text-[11px] text-white/60">{codeRun.id}</span>

            <span className="font-mono text-[10px] uppercase text-white/70">{codeRun.status}</span>
          </div>
        </div>
      );
    }

    return (
      <pre className="font-mono text-[11px] leading-5 text-white/70">
        $ Ready to run your code...
      </pre>
    );
  }

  if (mode === "SUBMIT") {
    if (submissionError) {
      return <pre className="font-mono text-[11px] leading-5 text-red-400">{submissionError}</pre>;
    }

    if (isSubmitting) {
      return <pre className="font-mono text-[11px] leading-5 text-white/70">$ Submitting...</pre>;
    }

    if (evaluation) {
      return (
        <div className="space-y-3">
          <div className="border-b border-white/10 pb-3">
            <div className="font-mono text-[9px] uppercase tracking-[0.16em] text-white/30">
              Submission
            </div>

            <div className="mt-1 flex items-center justify-between gap-3">
              <span className="font-mono text-[11px] text-white/70">Evaluation</span>

              <span
                className={`font-mono text-[10px] uppercase ${
                  evaluation.status === "PASSED" ? "text-green-400" : "text-red-400"
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

              <div className="mt-1 font-mono text-[14px] text-white/80">{evaluation.score}</div>
            </div>

            <div>
              <div className="font-mono text-[9px] uppercase tracking-wider text-white/30">
                Tests
              </div>

              <div className="mt-1 font-mono text-[14px] text-white/80">
                {evaluation.passedTests}/{evaluation.totalTests}
              </div>
            </div>
          </div>

          {evaluation.executionTimeMS !== null && (
            <div className="font-mono text-[9px] text-white/30">
              Total execution time: {evaluation.executionTimeMS}ms
            </div>
          )}
        </div>
      );
    }

    if (submission) {
      return (
        <div className="space-y-2">
          <div className="font-mono text-[9px] uppercase tracking-[0.16em] text-white/30">
            Submission
          </div>

          <div className="flex items-center justify-between gap-3">
            <span className="font-mono text-[11px] text-white/60">{submission.id}</span>

            <span className="font-mono text-[10px] uppercase text-white/70">
              {submission.status}
            </span>
          </div>
        </div>
      );
    }

    return (
      <pre className="font-mono text-[11px] leading-5 text-white/70">$ Ready to submit...</pre>
    );
  }

  return (
    <pre className="font-mono text-[11px] leading-5 text-white/70">
      {`$ Ready to run your code...

`}
    </pre>
  );
}
