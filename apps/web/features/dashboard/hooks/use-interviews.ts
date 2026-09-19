"use client";

import { useEffect, useState } from "react";

import { dashboardApi } from "../api/dashboard-api";
import type { Interview } from "../types";

type UseInterviewsOptions = {
  isLoaded: boolean;
  isSignedIn: boolean;
};

export const useInterviews = ({
  isLoaded,
  isSignedIn,
}: UseInterviewsOptions) => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) {
      return;
    }

    async function loadInterviews() {
      try {
        const data = await dashboardApi.getInterviews();
        setInterviews(data);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load interviews",
        );
      } finally {
        setLoading(false);
      }
    }

    loadInterviews();
  }, [isLoaded, isSignedIn]);

  return {
    interviews,
    loading,
    error,
  };
};