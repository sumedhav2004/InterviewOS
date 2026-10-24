import { useCallback, useEffect, useState } from "react";
import { FriendRequestStatus, type FriendRequest, type User } from "../types";
import { dashboardApi } from "../api/dashboard-api";

export const useFriendRequest = (userId: string) => {
  const [friends, setFriends] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [friendCount, setFriendCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [receivedRequests, setReceivedRequests] = useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);

  const getAllFriends = useCallback(async () => {
    const res = await dashboardApi.getAllFriendsofUser(userId);
    console.log("MY ALL FREINDS FROM THE HOOK: ", res);
    setFriends(res);
    setFriendCount(res.length);
  }, [userId]);

  const getReceivedFriendRequests = useCallback(async () => {
    const res = await dashboardApi.getAllReceivedFriendRequests();

    setReceivedRequests(res.filter((request) => request.status === FriendRequestStatus.PENDING));
  }, []);

  const getSentFriendRequests = useCallback(async () => {
    const res = await dashboardApi.getAllSentFriendRequests();

    setSentRequests(res.filter((request) => request.status === FriendRequestStatus.PENDING));
  }, []);

  // Reload all three lists.
  const loadData = useCallback(async () => {
    if (!userId) return;

    setError(null);
    setLoading(true);

    try {
      await Promise.all([getAllFriends(), getReceivedFriendRequests(), getSentFriendRequests()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load friend data");
    } finally {
      setLoading(false);
    }
  }, [userId, getAllFriends, getReceivedFriendRequests, getSentFriendRequests]);

  useEffect(() => {
    if (!userId) return;

    queueMicrotask(() => {
      void loadData();
    });
  }, [userId, loadData]);

  async function acceptRequest(requestId: string) {
    try {
      setError(null);

      await dashboardApi.acceptFriendRequest(requestId);

      // Refresh friends, received requests, and sent requests.
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to accept friend request");
    }
  }

  async function declineRequest(requestId: string) {
    try {
      setError(null);

      await dashboardApi.declineFriendRequest(requestId);

      // Refresh all lists after the decline succeeds.
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to decline friend request");
    }
  }

  return {
    friends: userId ? friends : [],
    friendCount: userId ? friendCount : 0,
    receivedRequests: userId ? receivedRequests : [],
    sentRequests: userId ? sentRequests : [],
    loading: userId ? loading : false,
    error,
    acceptRequest,
    declineRequest,
    loadData,
  };
};
