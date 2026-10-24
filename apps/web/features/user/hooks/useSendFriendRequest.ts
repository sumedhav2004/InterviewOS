"use client";

import { useCallback, useEffect, useState } from "react";
import { userApi } from "../api/user-api";
import { FriendRequestStatus, type User } from "../types";
import { FriendStatus } from "../components/friend-request-button";

export const useSendFriendRequest = (userId: string) => {
  const [friendStatus, setFriendStatus] = useState<FriendStatus>("NONE");
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    let cancelled = false;

    async function initialize() {
      setLoading(true);
      setError(null);

      try {
        const [me, profile] = await Promise.all([userApi.getMe(), userApi.getUser(userId)]);

        if (cancelled) return;

        setCurrentUser(me);
        setProfileUser(profile);

        if (me.id === profile.id) return;

        try {
          const request = await userApi.getFriendRequestForTwoUsers(me.id, profile.id);

          console.log("Friend request API response:", request);
          console.log("Expected ACCEPTED value:", FriendRequestStatus.ACCEPTED);

          if (cancelled) return;

          if (!request) {
            setFriendStatus("NONE");
          } else if (request.status === FriendRequestStatus.ACCEPTED) {
            setFriendStatus("FRIENDS");
          } else if (request.status === FriendRequestStatus.PENDING) {
            setFriendStatus(request.senderId === me.id ? "OUTGOING_PENDING" : "INCOMING_PENDING");
          } else {
            setFriendStatus("NONE");
          }
        } catch (err) {
          console.error("Friend request API failed:", err);
          if (!cancelled) {
            setError("Failed to fetch friend request.");
            setFriendStatus("NONE");
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    initialize();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const sendFriendRequest = useCallback(async () => {
    if (!profileUser || !currentUser || loading) return;

    setLoading(true);
    setError(null);

    try {
      await userApi.sendFriendRequest(profileUser.id);
      setFriendStatus("OUTGOING_PENDING");
    } catch {
      setError("Failed to send friend request.");
    } finally {
      setLoading(false);
    }
  }, [profileUser, currentUser, loading]);

  console.log("Current friendStatus:", friendStatus);

  return {
    friendStatus,
    loading,
    currentUser,
    profileUser,
    error,
    sendFriendRequest,
  };
};
