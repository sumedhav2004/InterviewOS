import { Participant } from "@interview-os/database";
import { InterviewQuestion } from "../../../../packages/database/generated/client";

export type InviteStatus = "PENDING" | "ACCEPTED" | "DECLINED" | "EXPIRED" | "CANCELLED";

export type ParticipantRole = "INTERVIEWER" | "CANDIDATE" | "OBSERVER";

export type Invite = {
  id: string;
  status: InviteStatus;
  role: ParticipantRole;
  expiresAt: string | null;
  respondedAt: string | null;
  createdAt: string;
  updatedAt: string;
  interviewId: string;
  senderId: string;
  receiverId: string;
};

export type InviteWithDetails = Invite & {
  sender: User;
  interview: Interview;
};

export type InterviewStatus = "DRAFT" | "SCHEDULED" | "INPROGRESS" | "COMPLETED" | "CANCELLED";

export type Interview = {
  id: string;
  title: string;
  description: string | null;
  status: InterviewStatus;
  scheduledAt: string | null;
  durationMinutes: number;
  createdAt: string;
  updatedAt: string;
  createdById: string;
  interviewQuestions: InterviewQuestion[];
};

export type Question = {
  id: string;
  title: string;
  description: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
};

export enum FriendRequestStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
  CANCELLED = "CANCELLED",
}

export type FriendRequest = {
  id: string;
  senderId: string;
  requesterId: string;
  status: FriendRequestStatus;
  respondedAt?: Date;
};

export interface User {
  id: string;
  clerkId: string;
  email: string;
  name: string;
  avatarUrl: string;
  createdInterviews: Interview[];
  participants: Participant[];
  questions: Question[];
}
