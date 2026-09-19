import { User } from "@/features/auth/types";
import { useEffect, useState } from "react";
import { dashboardApi } from "../api/dashboard-api";
import { useAccessToken, useAuth } from "@/lib/auth";

type UseDashboardOptions = {
  isLoaded: boolean;
  isSignedIn: boolean;
};

export const useDashboard = ({
  isLoaded,
  isSignedIn,
}: UseDashboardOptions) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 1. Don't do anything until auth is ready
    // 2. Don't call API if user isn't signed in
    // 3. Call dashboardApi.getCurrentUser()
    // 4. setUser(...)
    // 5. catch error
    // 6. setLoading(false)
    if(!isLoaded || !isSignedIn){
        return 
    }
    async function getUser(){
        try{
            const user = await dashboardApi.getCurrentUser()
            setUser(user)
        }catch(error){
            setError(
                error instanceof Error ? error.message : "Failed to load user",
            )
        }finally{
            setLoading(false)
        }
    }
    getUser()
  }, [isLoaded, isSignedIn]);

  return {
    user,
    loading,
    error,
  };
};