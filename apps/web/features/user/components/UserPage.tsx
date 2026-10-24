"use client";

import { useParams } from "next/navigation";
import { Container, Page, Stack } from "@/components/layout";
import { useUser } from "../hooks/useUser";
import UserProfileHeader from "./user-profile-header";
import UserProfileStats from "./user-profile-stats";
import UserCreatedQuestions from "./user-created-questions";
import type { User } from "../types";
import { useSendFriendRequest } from "../hooks/useSendFriendRequest";

function getUserProfileStats(user: User) {
  return {
    interviewsCreatedCount: user.createdInterviews?.length ?? 0,
    interviewsParticipatedCount: user.participants?.length ?? 0,
    friendsCount: 0, // Replace when friend data is available
    questionsCount: 0, // Replace when question data is available
  };
}

function getUserCreatedQuestions(user: User) {
  return {};
}

export default function UserPage() {
  const params = useParams<{ userId: string }>();
  const { user, loading, error } = useUser(params.userId);

  const {
    friendStatus,
    loading: friendRequestLoading,
    profileUser,
    currentUser,
    error: friendRequestError,
    sendFriendRequest,
  } = useSendFriendRequest(params.userId);

  if (loading) return <main>Loading profile...</main>;
  if (error) return <main>{error}</main>;
  if (!user) return <main>User not found.</main>;

  const stats = getUserProfileStats(user);

  return (
    <Page>
      <Container>
        <Stack gap="xl">
          <UserProfileHeader
            user={user}
            friendStatus={friendStatus}
            friendRequestLoading={friendRequestLoading}
            onSendFriendRequest={sendFriendRequest}
          />

          <UserProfileStats
            friendsCount={stats.friendsCount}
            questionsCount={stats.questionsCount}
            interviewsCreatedCount={stats.interviewsCreatedCount}
            interviewsParticipatedCount={stats.interviewsParticipatedCount}
          />
          <UserCreatedQuestions user={user} />
        </Stack>
      </Container>
    </Page>
  );
}
