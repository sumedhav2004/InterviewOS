import pkg from "@prisma/client";

const {
  ParticipantRole,
  InviteStatus,
  InterviewStatus,
  QuestionDifficulty,
  ProgrammingLanguage,
  ExecutionStatus,
  TestCaseVisibility,
  EvaluationStatus,
} = pkg;

export * from "./client.js";

export type { User, Prisma, Participant } from "@prisma/client";

export {
  ParticipantRole,
  InviteStatus,
  InterviewStatus,
  QuestionDifficulty,
  ProgrammingLanguage,
  ExecutionStatus,
  TestCaseVisibility,
  EvaluationStatus,
};