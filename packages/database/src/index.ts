import * as pkg from "../generated/client/index.js";

const {
  InterviewStatus,
  ParticipantRole,
  ParticipantStatus,
  InviteStatus,
  QuestionDifficulty,
  TestCaseVisibility,
  ProgrammingLanguage,
  ExecutionStatus,
  EvaluationStatus,
  FriendRequestStatus,
} = pkg;

export * from "./client.js";

// Export all Prisma model types
export type {
  User,
  Interview,
  Participant,
  Invite,
  FriendRequest,
  Question,
  Tag,
  QuestionTag,
  InterviewQuestion,
  TestCase,
  CodeRun,
  Submission,
  Evaluation,
  Resume,
  CodeRunTestCaseResult,
  SubmissionTestCaseResult,
  Prisma,
} from "../generated/client/index.js";

// Export enum types
export type InterviewStatus = (typeof InterviewStatus)[keyof typeof InterviewStatus];

export type ParticipantRole = (typeof ParticipantRole)[keyof typeof ParticipantRole];

export type ParticipantStatus = (typeof ParticipantStatus)[keyof typeof ParticipantStatus];

export type InviteStatus = (typeof InviteStatus)[keyof typeof InviteStatus];

export type QuestionDifficulty = (typeof QuestionDifficulty)[keyof typeof QuestionDifficulty];

export type TestCaseVisibility = (typeof TestCaseVisibility)[keyof typeof TestCaseVisibility];

export type ProgrammingLanguage = (typeof ProgrammingLanguage)[keyof typeof ProgrammingLanguage];

export type ExecutionStatus = (typeof ExecutionStatus)[keyof typeof ExecutionStatus];

export type EvaluationStatus = (typeof EvaluationStatus)[keyof typeof EvaluationStatus];

export type FriendRequestStatus = (typeof FriendRequestStatus)[keyof typeof FriendRequestStatus];

// Export enum values for runtime use
export {
  InterviewStatus,
  ParticipantRole,
  ParticipantStatus,
  InviteStatus,
  QuestionDifficulty,
  TestCaseVisibility,
  ProgrammingLanguage,
  ExecutionStatus,
  EvaluationStatus,
  FriendRequestStatus,
};
