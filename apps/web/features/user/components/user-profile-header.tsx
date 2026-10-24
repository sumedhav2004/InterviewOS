"use client";

import type { User } from "../types";
import { Container, Stack } from "@/components/layout";
import FriendRequestButton from "./friend-request-button";
import { FriendStatus } from "./friend-request-button";

type UserProfileHeaderProps = {
  user: User;
  friendsCount?: number;
  questionsCount?: number;
  isOwnProfile?: boolean;
  onAddFriend?: () => void;
  onMessage?: () => void;
  friendStatus: FriendStatus;
  friendRequestLoading: boolean;
  onSendFriendRequest: () => void;
};

const UserProfileHeader = ({
  user,
  friendsCount = 0,
  questionsCount = 0,
  isOwnProfile = false,
  onAddFriend,
  onMessage,
  friendStatus,
  friendRequestLoading,
  onSendFriendRequest,
}: UserProfileHeaderProps) => {
  return (
    <section className="rounded-xl border bg-card p-5 sm:p-6">
      <Stack gap="lg">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full border bg-muted">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={`${user.name}'s avatar`}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-2xl font-semibold">
                {user.name?.charAt(0)?.toUpperCase() ?? "U"}
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-semibold tracking-tight">{user.name}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {("bio" in user && typeof user.bio === "string" && user.bio) ||
                "Building skills, sharing knowledge, and preparing for interviews."}
            </p>
          </div>

          {!isOwnProfile && (
            <div className="flex shrink-0 gap-2">
              <FriendRequestButton
                status={friendStatus}
                loading={friendRequestLoading}
                onSendRequest={onSendFriendRequest}
                onAcceptRequest={() => {}}
                onDeclineRequest={() => {}}
              />

              <button
                type="button"
                onClick={onMessage}
                aria-label="Message user"
                className="rounded-lg border px-3 py-2 text-sm transition-colors hover:bg-muted"
              >
                <span aria-hidden="true">✉</span>
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-t pt-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-semibold">{friendsCount}</span>
            <span className="text-muted-foreground">Friends</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <span className="font-semibold">{questionsCount}</span>
            <span className="text-muted-foreground">Questions created</span>
          </div>
        </div>
      </Stack>
    </section>
  );
};

export default UserProfileHeader;
