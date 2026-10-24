import { Participant } from "@interview-os/database";
import { Interview } from "../interview/types/interview";

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
