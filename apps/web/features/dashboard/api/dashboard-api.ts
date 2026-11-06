import { apiClient } from "@/lib/api/api-client";

import { useAccessToken } from "@/lib/auth";
import {
  FriendRequest,
  Interview,
  InterviewQuestion,
  Invite,
  InviteWithDetails,
  ParticipantRole,
  Question,
  User,
} from "../types";

export type QuestionFilters = {
  search?: string;
  difficulty?: "EASY" | "MEDIUM" | "HARD";
  tags?: string[];
  page?: number;
  limit?: number;
};

export type CreateInterviewQuestionPayload = {
  questionOrder: number;
  points: number;
};

export type QuestionsResponse = {
  data: Question[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

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

  sendInvite(interviewId: string, receiverId: string, role: ParticipantRole) {
    return apiClient.post<Invite>(`/interviews/${interviewId}/invites/${receiverId}`, { role });
  },

  getQuestions(filters: QuestionFilters = {}) {
    const params = new URLSearchParams();

    if (filters.search?.trim()) {
      params.set("search", filters.search.trim());
    }
    if (filters.difficulty) {
      params.set("difficulty", filters.difficulty);
    }
    if (filters.tags?.length) {
      params.set("tags", filters.tags.join(","));
    }
    if (filters.page !== undefined) {
      params.set("page", String(filters.page));
    }
    if (filters.limit !== undefined) {
      params.set("limit", String(filters.limit));
    }

    const query = params.toString();

    return apiClient.get<QuestionsResponse>(`/questions${query ? `?${query}` : ""}`);
  },

  createInterviewQuestion(
    interviewId: string,
    questionId: string,
    data: CreateInterviewQuestionPayload,
  ) {
    return apiClient.post<InterviewQuestion>(
      `/interviews/${interviewId}/questions/${questionId}`,
      data,
    );
  },

  removeInterviewQuestion(interviewId: string, questionId: string, interviewQuestionId: string) {
    return apiClient.delete(
      `/interviews/${interviewId}/questions/${questionId}/${interviewQuestionId}`,
    );
  },

  getInterviewQuestions(interviewId: string) {
    return apiClient.get<InterviewQuestion[]>(`/interviews/${interviewId}/questions`);
  },
};
