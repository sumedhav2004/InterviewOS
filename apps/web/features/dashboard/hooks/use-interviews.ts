"use client";

import { useEffect, useState } from "react";

import {
  CreateInterviewPayload,
  CreateInterviewQuestionPayload,
  dashboardApi,
  UpdateInterviewPayload,
} from "../api/dashboard-api";
import type { Interview } from "../types";

type UseInterviewsOptions = {
  isLoaded: boolean;
  isSignedIn: boolean;
};

export const useInterviews = ({ isLoaded, isSignedIn }: UseInterviewsOptions) => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  async function createInterview(data: CreateInterviewPayload) {
    try {
      setLoading(true);
      setError(null);
      const res = await dashboardApi.createInterview(data);
      await refreshInterviews();
      return res;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create Interview");
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function updateInterview(interviewId: string, data: UpdateInterviewPayload) {
    try {
      setLoading(true);
      setError(null);
      const res = await dashboardApi.updateInterview(interviewId, data);
      await refreshInterviews();
      return res;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create Interview");
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function scheduleInterview(interviewId: string, scheduledAt: Date) {
    try {
      setLoading(true);
      setError(null);

      const res = await dashboardApi.scheduleInterview(interviewId, scheduledAt.toISOString());

      await refreshInterviews();
      return res;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to schedule interview");
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function startInterview(interviewId: string) {
    try {
      setLoading(true);
      setError(null);
      const res = await dashboardApi.startInterview(interviewId);
      await refreshInterviews();
      return res;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create Interview");
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function cancelInterview(interviewId: string) {
    try {
      setLoading(true);
      setError(null);
      const res = await dashboardApi.cancelInterview(interviewId);
      await refreshInterviews();
      return res;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create Interview");
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function createInterviewQuestion(
    interviewId: string,
    questionId: string,
    data: CreateInterviewQuestionPayload,
  ) {
    try {
      setLoading(true);
      setError(null);
      const res = await dashboardApi.createInterviewQuestion(interviewId, questionId, data);
      await refreshInterviews();
      return res;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create Interview Question");
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function removeInterviewQuestion(
    interviewId: string,
    questionId: string,
    interviewQuestionId: string,
  ) {
    try {
      setLoading(true);
      setError(null);
      const res = await dashboardApi.removeInterviewQuestion(
        interviewId,
        questionId,
        interviewQuestionId,
      );
      await refreshInterviews();
      return res;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create Interview Question");
      throw err;
    } finally {
      setLoading(false);
    }
  }

  const refreshInterviews = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await dashboardApi.getInterviews();
      setInterviews(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to load interviews");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    void refreshInterviews().catch(() => {});
  }, [isLoaded, isSignedIn]);

  return {
    interviews,
    loading,
    error,
    refreshInterviews,
    createInterviewQuestion,
    updateInterview,
    scheduleInterview,
    startInterview,
    cancelInterview,
    removeInterviewQuestion,
    createInterview,
  };
};
