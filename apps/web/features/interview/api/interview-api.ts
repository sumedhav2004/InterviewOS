import { apiClient } from "@/lib/api/api-client";
import type { Interview } from "../types/interview";

export const interviewApi = {
  getInterview(interviewId: string) {
    return apiClient.get<Interview>(`/interviews/${interviewId}`);
  },
};