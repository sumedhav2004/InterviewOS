export type InterviewStatus =
  | "DRAFT"
  | "SCHEDULED"
  | "INPROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export type ParticipantRole =
  | "INTERVIEWER"
  | "CANDIDATE"
  | "OBSERVER";

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

export type InterviewParticipant = {
  id: string;
  role: ParticipantRole;
  status: "ACTIVE" | "INACTIVE";
  joinedAt: string | null;
  leftAt: string | null;
  userId: string;
  interviewId: string;
};