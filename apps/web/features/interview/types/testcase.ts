import { TestCaseVisibility } from "@interview-os/database";

export type TestCase = {
  id: string;
  input: unknown;
  expectedOutput: unknown;
};