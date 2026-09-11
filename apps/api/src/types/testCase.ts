import { TestCaseVisibility } from "@interview-os/database"

export type createTestCaseData = {
    input: JSON,
    expectedOutput: JSON,
    visibility: TestCaseVisibility
}

export type updateTestCaseData = {
    input?: JSON,
    expectedOutput?: JSON,
    visibility:  TestCaseVisibility
}