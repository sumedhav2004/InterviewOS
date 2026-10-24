
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { userApi } from "../api/user-api";
import type { User } from "../types";

export const useUser = (userId: string) => {
  const { isLoaded, isSignedIn } = useAuth();

  const [user, setUser] = useState<User | null>(null);
  const [userFriends, setUserFriends] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !userId) return;

    let cancelled = false;

    async function loadUser() {
      setLoading(true);
      setError(null);

      try {
        const result = await userApi.getUser(userId);

        if (cancelled) return;
        setUser(result);

        try {
          const friends = await userApi.getAllFriends(userId);
          if (!cancelled) setUserFriends(friends);
        } catch (err) {
          console.error("Failed to load user friends:", err);
          if (!cancelled) setUserFriends([]);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load user");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadUser();

    return () => {
      cancelled = true;
    };
  }, [userId, isLoaded, isSignedIn]);

  if (!isLoaded) {
    return { user, userFriends, loading: true, error };
  }

  if (!isSignedIn) {
    return {
      user: null,
      userFriends: [],
      loading: false,
      error: "Please sign in to view this profile.",
    };
  }

  if (!userId) {
    return { user, userFriends, loading: false, error };
  }

  return { user, userFriends, loading, error };
};
