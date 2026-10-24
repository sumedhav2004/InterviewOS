import { apiClient } from "@/lib/api";
import { FriendRequest, User } from "../types";

export const userApi = {
  async getMe() {
    return apiClient.get<User>("/user/me");
  },

  async getUser(userId: string) {
    return apiClient.get<User>(`/user/${userId}`);
  },

  async getUserByEmail(emailId: string) {
    return apiClient.get<User>(`/user/email/${emailId}`);
  },

  async sendFriendRequest(receiverId: string) {
    return apiClient.post<FriendRequest>(`/user/friends/${receiverId}`);
  },

  async getAllFriends(userId: string) {
    return apiClient.get<User[]>(`/user/friends/${userId}/all`);
  },

  async getFriendRequestForTwoUsers(senderId: string, receiverId: string) {
    return apiClient.get<FriendRequest>(`/user/friends/${senderId}/${receiverId}`);
  },
};
