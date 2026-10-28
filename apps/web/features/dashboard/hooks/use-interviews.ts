"use client";

import { useCallback, useEffect, useState } from "react";

import { dashboardApi } from "../api/dashboard-api";
import type { Interview } from "../types";

type UseInterviewsOptions = {
  isLoaded: boolean;
  isSignedIn: boolean;
};

export const useInterviews = ({ isLoaded, isSignedIn }: UseInterviewsOptions) => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshInterviews = useCallback(async () => {
    try {
      setError(null);
      const data = await dashboardApi.getInterviews();
      setInterviews(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to load interviews");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    const timeoutId = setTimeout(() => {
      void refreshInterviews();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [isLoaded, isSignedIn, refreshInterviews]);

  return {
    interviews,
    loading,
    error,
    refreshInterviews,
  };
};
