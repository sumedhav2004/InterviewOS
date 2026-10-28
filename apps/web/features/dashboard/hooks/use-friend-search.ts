"use client";

import { useMemo, useState } from "react";
import type { User } from "../types";

export function useFriendSearch(friends: User[]) {
  const [query, setQuery] = useState("");

  const searchedFriends = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) return [];

    return friends.filter(
      (friend) =>
        friend.name?.toLowerCase().includes(normalizedQuery) ||
        friend.email?.toLowerCase().includes(normalizedQuery),
    );
  }, [friends, query]);

  return {
    query,
    setQuery,
    searchedFriends,
  };
}
