"use client";

import { useState } from "react";
import { dashboardApi } from "../api/dashboard-api";

type ParticipantRole = "INTERVIEWER" | "CANDIDATE" | "OBSERVER";

export function useSendInvite() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendInvite(interviewId: string, receiverId: string, role: ParticipantRole) {
    setLoading(true);
    setError(null);

    try {
      return await dashboardApi.sendInvite(interviewId, receiverId, role);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to send invitation.";

      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  return { sendInvite, loading, error };
}
