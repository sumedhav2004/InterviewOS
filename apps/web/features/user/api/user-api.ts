import { apiClient } from "@/lib/api";
import { User } from "../types";

export const userApi = {
  async getUser(userId: string) {
    return apiClient.get<User>(`/users/${userId}`);
  },

  async getUserByEmail(emailId: string) {
    return apiClient.get<User>(`/users/${emailId}`);
  },
};
