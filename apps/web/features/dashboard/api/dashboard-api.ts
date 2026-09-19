import { apiClient } from "@/lib/api/api-client";
import type { User } from "@/features/auth/types";
import { useAccessToken } from "@/lib/auth";
import { Interview, Invite } from "../types";

export const dashboardApi = {
  getCurrentUser() {
    return apiClient.get<User>("/user/me");
  },

  getReceivedInvites() {
    return apiClient.get<Invite[]>("/invites");
    },

    getSender(userId:string){
        return apiClient.get<User>(`/user/${userId}`)
    },

    getInterview(interviewId:string){
        return apiClient.get<Interview>(`/interviews/${interviewId}`)
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
};