"use client";

import { useEffect, useState } from "react";
import { interviewApi } from "../api/interview-api";
import type { Interview } from "../types/interview";

type UseInterviewOptions = {
  interviewId: string;
  isLoaded: boolean;
  isSignedIn: boolean;
};

export function useInterview({
  interviewId,
  isLoaded,
  isSignedIn,
}: UseInterviewOptions) {
  const [interview, setInterview] = useState<Interview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) {
      return;
    }

    async function loadInterview() {
      try {
        setLoading(true);
        setError(null);

        const data = await interviewApi.getInterview(interviewId);

        setInterview(data);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load interview",
        );
      } finally {
        setLoading(false);
      }
    }

    loadInterview();
  }, [interviewId, isLoaded, isSignedIn]);

  return {
    interview,
    loading,
    error,
  };
}