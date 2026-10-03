import { useCallback, useEffect, useState } from "react";

import { ProgrammingLanguage } from "../types/programming-language";
import { codeRunApi } from "../api/codeRun-api";

import type { ServerMessage } from "../types/realtime";
import { CodeRunTestCaseResult } from "../types/coderun";

type RunCodeRunInput = {
  interviewQuestionId: string;
  participantId: string;
  language: ProgrammingLanguage;
  sourceCode: string;
};

export function useCodeRun(
  onMessage?: (message: ServerMessage) => void,
) {
   
  const [codeRun, setCodeRun] = useState<any>(null);
  const [results, setResults] = useState<
    CodeRunTestCaseResult[]
  >([]);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMessage = useCallback(
    (message: ServerMessage) => {
      console.log("[CODE RUN HOOK] RECEIVED:", message);

      onMessage?.(message);

      if (message.type === "CODE_RUN_TEST_CASE_RESULT") {
        setResults((currentResults) => {
          const existingIndex = currentResults.findIndex(
            (result) =>
              result.id === message.result.id,
          );

          if (existingIndex !== -1) {
            return currentResults;
          }

          return [
            ...currentResults,
            message.result,
          ];
        });

        return;
      }

      if (message.type === "CODE_RUN_COMPLETED") {
        setCodeRun((currentCodeRun: any) => {
          if (
            !currentCodeRun ||
            currentCodeRun.id !== message.codeRunId
          ) {
            return currentCodeRun;
          }

          return {
            ...currentCodeRun,
            status: message.status,
          };
        });

        setIsRunning(false);
      }
    },
    [onMessage],
  );

  const run = async (data: RunCodeRunInput) => {
    try {
      setIsRunning(true);
      setError(null);
      setResults([]);

      const created =
        await codeRunApi.createCodeRun(data);

      const executed =
        await codeRunApi.executeCodeRun(
          created.id,
        );

      setCodeRun(executed);

      return executed;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to run code";

      setError(message);
      setIsRunning(false);

      throw error;
    }
  };

  return {
    codeRun,
    results,
    isRunning,
    error,
    run,
    handleMessage,
  };
}