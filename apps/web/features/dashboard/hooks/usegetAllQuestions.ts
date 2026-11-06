"use client";
import { useState } from "react";
import { dashboardApi, QuestionFilters } from "../api/dashboard-api";

export function useQuestions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function getQuestions(filters: QuestionFilters = {}) {
    try {
      setLoading(true);
      setError(null);

      const questions = await dashboardApi.getQuestions(filters);

      return questions;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch questions";

      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }

  return {
    getQuestions,
    loading,
    error,
  };
}
