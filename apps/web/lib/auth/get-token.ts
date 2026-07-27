"use client";

import { useAuth } from "./use-auth";

export function useAccessToken() {
  const { getToken } = useAuth();

  return getToken;
}