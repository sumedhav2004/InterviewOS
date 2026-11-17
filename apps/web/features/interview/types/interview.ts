import { InterviewStatus, ParticipantRole } from "@interview-os/database";
import { TestCase } from "./testcase";

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
  questions: InterviewQuestion[];
  activeInterviewQuestionId: string;
  activeInterviewQuestion: InterviewQuestion;
};

export type InterviewQuestion = {
  id: string;
  questionOrder: number;
  points: number;
  question: Question;
};

export enum QuestionDifficulty {
  EASY = "EASY",
  MEDIUM = "MEDIUM",
  HARD = "HARD",
}

export type Question = {
  id: string;
  title: string;
  description: string;
  difficulty: QuestionDifficulty;
  testCases: TestCase[];
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

export type InterviewWorkspaceType = "CODE" | "WHITEBOARD";
