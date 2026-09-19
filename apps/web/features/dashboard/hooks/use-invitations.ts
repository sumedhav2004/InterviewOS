"use client";

import { useEffect, useState } from "react";

import { dashboardApi } from "../api/dashboard-api";
import type { Invite, Interview } from "../types";
import type { User } from "@/features/auth/types";

type InviteWithSender = Invite & {
  sender: User;
  interview: Interview;
};

type UseInvitationsOptions = {
  isLoaded: boolean;
  isSignedIn: boolean;
};

export const useInvitations = ({
  isLoaded,
  isSignedIn,
}: UseInvitationsOptions) => {
  const [invitations, setInvitations] = useState<InviteWithSender[]>([]);
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

        const invitationsWithDetails = await Promise.all(
          data.map(async (invite) => {
            const [sender, interview] = await Promise.all([
              dashboardApi.getSender(invite.senderId),
              dashboardApi.getInterview(invite.interviewId),
            ]);

            return {
              ...invite,
              sender,
              interview,
            };
          }),
        );

        setInvitations(invitationsWithDetails);
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