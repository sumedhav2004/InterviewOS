import { User } from "@interview-os/database";


export type InviteStatus =
  | "PENDING"
  | "ACCEPTED"
  | "DECLINED"
  | "EXPIRED"
  | "CANCELLED";

export type ParticipantRole =
  | "INTERVIEWER"
  | "CANDIDATE"
  | "OBSERVER";

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

export type InterviewStatus =
  | "DRAFT"
  | "SCHEDULED"
  | "INPROGRESS"
  | "COMPLETED"
  | "CANCELLED";

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
};