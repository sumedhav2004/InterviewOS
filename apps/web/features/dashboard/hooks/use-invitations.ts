"use client";

import { useEffect, useState } from "react";

import { dashboardApi } from "../api/dashboard-api";
import type { Invite, Interview } from "../types";
import type { User } from "@/features/auth/types";
import type { InviteWithDetails } from "../types";


type UseInvitationsOptions = {
  isLoaded: boolean;
  isSignedIn: boolean;
};

export const useInvitations = ({
  isLoaded,
  isSignedIn,
}: UseInvitationsOptions) => {
  const [invitations, setInvitations] = useState<InviteWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const acceptInvitation = async (inviteId: string) => {
  const updatedInvite = await dashboardApi.acceptInvitation(inviteId);

  setInvitations((current) =>
    current.map((invite) =>
      invite.id === inviteId
        ? {
            ...invite,
            status: updatedInvite.status,
            respondedAt: updatedInvite.respondedAt,
            updatedAt: updatedInvite.updatedAt,
          }
        : invite,
    ),
  );
};

    const declineInvitation = async (inviteId: string) => {
  const updatedInvite = await dashboardApi.declineInvitation(inviteId);

  setInvitations((current) =>
    current.map((invite) =>
      invite.id === inviteId
        ? {
            ...invite,
            status: updatedInvite.status,
            respondedAt: updatedInvite.respondedAt,
            updatedAt: updatedInvite.updatedAt,
          }
        : invite,
    ),
  );
};

  useEffect(() => {
    if (!isLoaded || !isSignedIn) {
      return;
    }

    async function loadInvitations() {
      try {
        const data = await dashboardApi.getReceivedInvites();
        setInvitations(data);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load invitations",
        );
      } finally {
        setLoading(false);
      }
    }


    loadInvitations();
  }, [isLoaded, isSignedIn]);

  return {
    invitations,
    loading,
    error,
    acceptInvitation,
    declineInvitation,
  };
};