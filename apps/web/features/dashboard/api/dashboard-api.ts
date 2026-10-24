import { apiClient } from "@/lib/api/api-client";

import { useAccessToken } from "@/lib/auth";
import { FriendRequest, Interview, Invite, InviteWithDetails, User } from "../types";

export const dashboardApi = {
  getCurrentUser() {
    return apiClient.get<User>("/user/me");
  },

  getReceivedInvites() {
    return apiClient.get<InviteWithDetails[]>("/invites");
  },

  getSender(userId: string) {
    return apiClient.get<User>(`/user/${userId}`);
  },

  getInterview(interviewId: string) {
    return apiClient.get<Interview>(`/interviews/${interviewId}`);
  },

  acceptInvitation(inviteId: string) {
    return apiClient.patch<Invite>(`/invites/${inviteId}/accept`);
  },

  declineInvitation(inviteId: string) {
    return apiClient.patch<Invite>(`/invites/${inviteId}/decline`);
  },

  getInterviews() {
    return apiClient.get<Interview[]>("/interviews");
  },

  getSentInvites() {
    return apiClient.get<Invite[]>("/invites/sent");
  },

  getUserByEmail(emailId: string) {
    return apiClient.get<User>(`/user/email/${emailId}`);
  },

  getAllFriendsofUser(userId: string) {
    return apiClient.get<User[]>(`/user/friends/${userId}/all`);
  },

  getAllReceivedFriendRequests() {
    return apiClient.get<FriendRequest[]>(`/user/friends/received`);
  },

  getAllSentFriendRequests() {
    return apiClient.get<FriendRequest[]>(`/user/friends/sent`);
  },

  acceptFriendRequest(requestId: string) {
    return apiClient.patch<FriendRequest>(`/user/friends/${requestId}/accept`);
  },

  declineFriendRequest(requestId: string) {
    return apiClient.patch<FriendRequest>(`/user/friends/${requestId}/decline`);
  },
};
