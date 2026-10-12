import { Prisma, TestCaseVisibility } from "@interview-os/database";

export type createTestCaseData = {
  input: Prisma.InputJsonValue;
  expectedOutput: Prisma.InputJsonValue;
  visibility: TestCaseVisibility;
};

export type updateTestCaseData = {
  input?: Prisma.InputJsonValue;
  expectedOutput?: Prisma.InputJsonValue;
  visibility?: TestCaseVisibility;
};
