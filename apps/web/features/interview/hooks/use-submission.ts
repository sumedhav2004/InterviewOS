"use client";

import { useCallback, useState } from "react";

import { submissionApi } from "../api/submission-api";
import type {
  ServerMessage,
} from "../types/realtime";
import { ProgrammingLanguage } from "../types/programming-language";
import { CreateSubmissionRequest, SubmissionEvaluation, SubmissionTestCaseResult } from "../types/submission";


export function useSubmission(
  onMessage?: (message: ServerMessage) => void,
) {
  const [submission, setSubmission] =
    useState<{
      id: string;
      status: string;
    } | null>(null);

  const [results, setResults] =
    useState<SubmissionTestCaseResult[]>([]);

  const [evaluation, setEvaluation] =
    useState<SubmissionEvaluation | null>(null);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const handleMessage = useCallback(
    (message: ServerMessage) => {
      console.log(
        "[SUBMISSION HOOK] RECEIVED:",
        message,
      );

      onMessage?.(message);

      if (
        message.type ===
        "SUBMISSION_TEST_CASE_RESULT"
      ) {
        setResults((currentResults) => {
          const exists =
            currentResults.some(
              (result) =>
                result.id ===
                message.result.id,
            );

          if (exists) {
            return currentResults;
          }

          return [
            ...currentResults,
            message.result,
          ];
        });

        return;
      }

      if (
        message.type ===
        "SUBMISSION_COMPLETED"
      ) {
        setEvaluation(
          message.evaluation,
        );

        setIsSubmitting(false);

        return;
      }
    },
    [onMessage],
  );

  const submit = async (
    data: CreateSubmissionRequest,
  ) => {
    try {
      setIsSubmitting(true);
      setError(null);
      setResults([]);
      setEvaluation(null);

      const created =
        await submissionApi.createSubmission(
          data,
        );

      setSubmission(created);

      return created;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to submit code";

      setError(message);
      setIsSubmitting(false);

      throw error;
    }
  };

  return {
    submission,
    results,
    evaluation,
    isSubmitting,
    error,
    submit,
    handleMessage,
  };
}