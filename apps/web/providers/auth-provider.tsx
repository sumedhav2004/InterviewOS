"use client";

import { ReactNode, useLayoutEffect } from "react";
import { useAuth } from "@/lib/auth";
import { apiClient } from "@/lib/api";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { getToken } = useAuth();

  useLayoutEffect(() => {
    apiClient.setTokenProvider(getToken);
  }, [getToken]);

  return <>{children}</>;
}
