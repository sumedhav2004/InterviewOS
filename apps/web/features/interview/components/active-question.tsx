"use client";

import { FileText } from "lucide-react";

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

type ActiveQuestionProps = {
  question: ActiveInterviewQuestion | null;
};

export function ActiveQuestion({
  question,
}: ActiveQuestionProps) {
  if (!question) {
    return (
      <section className="shrink-0 border-b border-border bg-card/20 ">
        <div className="flex h-10 items-center gap-2 border-b border-border px-4">
          <FileText className="h-3.5 w-3.5 text-primary" />

          <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
            Question
          </span>
        </div>

        <div className="px-4 py-5">
          <p className="font-mono text-[10px] text-muted-foreground">
            No question selected.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="shrink-0 border-b border-border bg-card/20 overflow-y-auto">
      <div className="flex h-10 items-center justify-between border-b border-border px-4">
        <div className="flex items-center gap-2">
          <FileText className="h-3.5 w-3.5 text-primary" />

          <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
            Question
          </span>
        </div>

        <span className="font-mono text-[9px] text-muted-foreground">
          {question.questionOrder}
        </span>
      </div>

      <div className="space-y-3 px-4 py-4">
        <div>
          <h2 className="text-sm font-semibold">
            {question.question.title}
          </h2>

          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {question.question.description}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
            {question.question.difficulty}
          </span>

          <span className="h-3 w-px bg-border" />

          <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
            {question.points} pts
          </span>
        </div>

        <div className="space-y-2">
          <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
            Test Cases
          </span>

          {question.question.testCases.length === 0 ? (
            <p className="font-mono text-[10px] text-muted-foreground">
              No visible test cases.
            </p>
          ) : (
            <div className="space-y-2">
              {question.question.testCases.map((testCase, index) => (
                <div
                  key={testCase.id}
                  className="rounded-md border border-border bg-background/40 p-3"
                >
                  <p className="mb-2 font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
                    Test Case {index + 1}
                  </p>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div>
                      <p className="mb-1 font-mono text-[9px] text-muted-foreground">
                        Input
                      </p>

                      <pre className="overflow-x-auto rounded border border-border bg-background p-2 font-mono text-[10px]">
                        {JSON.stringify(testCase.input, null, 2)}
                      </pre>
                    </div>

                    <div>
                      <p className="mb-1 font-mono text-[9px] text-muted-foreground">
                        Expected
                      </p>

                      <pre className="overflow-x-auto rounded border border-border bg-background p-2 font-mono text-[10px]">
                        {JSON.stringify(testCase.expectedOutput, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}