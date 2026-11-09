"use client";

import { useEffect, useState } from "react";

import { dashboardApi } from "../api/dashboard-api";
import type { InviteWithDetails } from "../types";

type UseInvitationsOptions = {
  isLoaded: boolean;
  isSignedIn: boolean;
};

export const useInvitations = ({ isLoaded, isSignedIn }: UseInvitationsOptions) => {
  const [invitations, setInvitations] = useState<InviteWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshInvitations = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await dashboardApi.getReceivedInvites();
      setInvitations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load invitations");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const acceptInvitation = async (inviteId: string) => {
    try {
      setError(null);
      await dashboardApi.acceptInvitation(inviteId);
      await refreshInvitations();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to accept invitation");
      throw err;
    }
  };

  const declineInvitation = async (inviteId: string) => {
    try {
      setError(null);
      await dashboardApi.declineInvitation(inviteId);
      await refreshInvitations();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to decline invitation");
      throw err;
    }
  };

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    const timer = setTimeout(() => {
      void refreshInvitations().catch(() => {});
    }, 0);

    return () => clearTimeout(timer);
  }, [isLoaded, isSignedIn]);

  return {
    invitations,
    loading,
    error,
    refreshInvitations,
    acceptInvitation,
    declineInvitation,
  };
};
