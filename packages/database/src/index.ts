import * as pkg from "../generated/client/index.js";

const {
  ParticipantRole,
  InviteStatus,
  InterviewStatus,
  QuestionDifficulty,
  ProgrammingLanguage,
  ExecutionStatus,
  TestCaseVisibility,
  EvaluationStatus,
  FriendRequestStatus,
} = pkg;

export * from "./client.js";

export type { User, Prisma, Participant } from "../generated/client/index.js";

export type ParticipantRole = (typeof ParticipantRole)[keyof typeof ParticipantRole];
export type InviteStatus = (typeof InviteStatus)[keyof typeof InviteStatus];
export type InterviewStatus = (typeof InterviewStatus)[keyof typeof InterviewStatus];
export type QuestionDifficulty = (typeof QuestionDifficulty)[keyof typeof QuestionDifficulty];
export type ProgrammingLanguage = (typeof ProgrammingLanguage)[keyof typeof ProgrammingLanguage];
export type ExecutionStatus = (typeof ExecutionStatus)[keyof typeof ExecutionStatus];
export type TestCaseVisibility = (typeof TestCaseVisibility)[keyof typeof TestCaseVisibility];
export type EvaluationStatus = (typeof EvaluationStatus)[keyof typeof EvaluationStatus];
export type FriendRequestStatus = (typeof FriendRequestStatus)[keyof typeof FriendRequestStatus];

export {
  ParticipantRole,
  InviteStatus,
  InterviewStatus,
  QuestionDifficulty,
  ProgrammingLanguage,
  ExecutionStatus,
  TestCaseVisibility,
  EvaluationStatus,
  FriendRequestStatus,
};
