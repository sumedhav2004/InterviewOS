import { apiClient } from "@/lib/api/api-client";
import type { Interview } from "../types/interview";

export const interviewApi = {
  getInterview(interviewId: string) {
    return apiClient.get<Interview>(`/interviews/${interviewId}`);
  },

  addActiveQuestion(interviewId: string, interviewQuestionId: string) {
    return apiClient.patch(`/interviews/${interviewId}/active-question/${interviewQuestionId}`);
  },

  removeActiveQuestion(interviewId: string) {
    return apiClient.delete(`/interviews/${interviewId}/active-question`);
  },
};
