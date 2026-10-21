
import { useState } from "react";
import { dashboardApi } from "../api/dashboard-api";



export function useUserByEmail() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getUserByEmail = async (email: string) => {
    try {
      setLoading(true);
      setError(null);

      const res = await dashboardApi.getUserByEmail(email);
      return res;
    } catch {
      setError("Failed to find user");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { getUserByEmail, loading, error };
}
