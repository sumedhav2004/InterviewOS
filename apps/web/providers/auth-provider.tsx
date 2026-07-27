"use client";

import { ReactNode, useEffect } from "react";

import { useAuth } from "@/lib/auth";
import { apiClient, ApiClient } from "@/lib/api";

interface AuthProviderProps {
  children: ReactNode;
}


export function AuthProvider({ children }: AuthProviderProps) {
  const { getToken } = useAuth();

  useEffect(() => {
    apiClient.setTokenProvider(getToken);
  }, [getToken]);

  return <>{children}</>;

}