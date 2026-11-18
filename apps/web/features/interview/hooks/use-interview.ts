"use client";

import { useCallback, useEffect, useState } from "react";
import { interviewApi } from "../api/interview-api";
import type { Interview } from "../types/interview";

type UseInterviewOptions = {
  interviewId: string;
  isLoaded: boolean;
  isSignedIn: boolean;
};

export function useInterview({ interviewId, isLoaded, isSignedIn }: UseInterviewOptions) {
  const [interview, setInterview] = useState<Interview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshInterview = useCallback(async () => {
    const data = await interviewApi.getInterview(interviewId);
    setInterview(data);
  }, [interviewId]);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    async function loadInterview() {
      try {
        setLoading(true);
        setError(null);
        await refreshInterview();
      } catch (error) {
        setError(error instanceof Error ? error.message : "Failed to load interview");
      } finally {
        setLoading(false);
      }
    }

    loadInterview();
  }, [isLoaded, isSignedIn, refreshInterview]);

  const deleteActiveQuestion = async () => {
    try {
      setError(null);

      await interviewApi.removeActiveQuestion(interviewId);
      await refreshInterview();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to remove active question");
      throw error;
    }
  };

  const addActiveQuestion = async (interviewQuestionId: string) => {
    try {
      setError(null);

      await interviewApi.addActiveQuestion(interviewId, interviewQuestionId);
      await refreshInterview();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to add active question");
      throw error;
    }
  };

  return {
    interview,
    loading,
    error,
    refreshInterview,
    deleteActiveQuestion,
    addActiveQuestion,
  };
}
