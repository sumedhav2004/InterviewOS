import { TestCase } from "./testcase";

export type ActiveInterviewQuestion = {
  id: string;
  questionOrder: number;
  points: number;
  question: {
    id: string;
    title: string;
    description: string;
    difficulty: string;
    testCases: TestCase[];
  };
};