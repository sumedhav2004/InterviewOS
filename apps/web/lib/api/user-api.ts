import { User } from "@/features/auth/types";
import { apiClient } from "./api-client";



export const userApi = {
  getMe() {
    return apiClient.get<User>("/user/me");
  },
};