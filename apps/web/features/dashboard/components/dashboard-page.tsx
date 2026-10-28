"use client";

import { useAuth } from "@/lib/auth";
import { useDashboard } from "../hooks/use-dashboard";
import { Container, Page, Stack } from "@/components/layout";
import { DashboardHeader } from "./dashboard-header";
import { DashboardStats } from "./dashboard-stats";
import { InterviewList } from "./interview-list";
import { useInvitations } from "../hooks/use-invitations";
import { useInterviews } from "../hooks/use-interviews";
import { InvitationList } from "./invitation-list";
import { useEffect } from "react";
import { useFriendRequest } from "../hooks/use-friend-request";
import FriendsSection from "./friends-section";
import { useState } from "react";
import InvitePeopleDialog from "./invite-people-dialog";

export function DashboardPage() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const [inviteInterviewId, setInviteInterviewId] = useState<string | null>(null);
  useEffect(() => {
    async function logToken() {
      const token = await getToken();

      console.log("Clerk token:", token);
    }

    if (isLoaded && isSignedIn) {
      logToken();
    }
  }, [isLoaded, isSignedIn, getToken]);

  const { user, loading, error } = useDashboard({
    isLoaded,
    isSignedIn: isSignedIn ?? false,
  });
  const {
    friends,
    friendCount,
    receivedRequests,
    sentRequests,
    acceptRequest,
    declineRequest,
    loadData,
    loading: friendsLoading,
    error: friendsError,
  } = useFriendRequest(user?.id ?? "");

  const {
    interviews,
    loading: interviewsLoading,
    error: interviewsError,
    refreshInterviews,
  } = useInterviews({
    isLoaded,
    isSignedIn: isSignedIn ?? false,
  });

  const upcomingInterviews = interviews.filter(
    (interview) => interview.status === "SCHEDULED" || interview.status === "INPROGRESS",
  );

  const interviewHistory = interviews.filter(
    (interview) => interview.status === "COMPLETED" || interview.status === "CANCELLED",
  );

  const {
    invitations,
    loading: invitationsLoading,
    error: invitationsError,
    acceptInvitation,
    declineInvitation,
  } = useInvitations({
    isLoaded,
    isSignedIn: isSignedIn ?? false,
  });

  if (!isLoaded) {
    return <main>Loading...</main>;
  }

  if (!isSignedIn) {
    return <main>Please sign in.</main>;
  }

  if (loading) {
    return <main>Loading...</main>;
  }

  if (error) {
    return <main>{error}</main>;
  }

  if (!user) {
    return <main>Unable to load user.</main>;
  }

  return (
    <Page>
      <Container>
        <Stack gap="xl">
          <DashboardHeader name={user.name} />

          <DashboardStats
            upcoming={upcomingInterviews.length}
            completed={interviewHistory.length}
            invites={invitations.filter((invite) => invite.status === "PENDING").length}
          />

          <FriendsSection
            friends={friends}
            friendCount={friendCount}
            receivedRequests={receivedRequests}
            sentRequests={sentRequests}
            onAcceptRequest={acceptRequest}
            onDeclineRequest={declineRequest}
          />

          <InterviewList
            upcoming={upcomingInterviews}
            history={interviewHistory}
            currentUserId={user.id}
            onInvitePeople={(interviewId) => {
              setInviteInterviewId(interviewId);
            }}
          />

          <InvitePeopleDialog
            open={inviteInterviewId !== null}
            onOpenChange={(open) => {
              if (!open) setInviteInterviewId(null);
            }}
            interviewId={inviteInterviewId ?? ""}
            friends={friends}
            user={user}
          />

          {/* stats */}

          {/* interviews */}
        </Stack>
      </Container>
    </Page>
  );
}
