import { executeJob } from "./executor";

import { ExecutionJob, ExecutionTestCase, JsonValue, TestCaseResult } from "./types";

function parseJsonOutput(output: string): JsonValue | undefined {
  try {
    return JSON.parse(output.trim()) as JsonValue;
  } catch {
    return undefined;
  }
}

function jsonEqual(a: JsonValue, b: JsonValue): boolean {
  if (a === b) return true;

  if (typeof a !== "object" || a === null || typeof b !== "object" || b === null) {
    return false;
  }

  if (Array.isArray(a) !== Array.isArray(b)) {
    return false;
  }

  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((value, index) => jsonEqual(value, b[index]));
  }

  const aObject = a as { [key: string]: JsonValue };
  const bObject = b as { [key: string]: JsonValue };

  const aKeys = Object.keys(aObject);
  const bKeys = Object.keys(bObject);

  return (
    aKeys.length === bKeys.length &&
    aKeys.every(
      (key) =>
        Object.prototype.hasOwnProperty.call(bObject, key) && jsonEqual(aObject[key], bObject[key]),
    )
  );
}

export async function runTestCase(
  job: ExecutionJob,
  testCase: ExecutionTestCase,
): Promise<TestCaseResult> {
  const result = await executeJob({
    ...job,
    input: testCase.input,
  });

  const actualOutput = parseJsonOutput(result.stdout);

  const passed =
    result.exitCode === 0 &&
    !result.timedOut &&
    !result.outputLimitExceeded &&
    actualOutput !== undefined &&
    jsonEqual(actualOutput, testCase.expectedOutput);

  return {
    testCaseId: testCase.id,
    passed,
    input: testCase.input,
    expectedOutput: testCase.expectedOutput,
    actualOutput: result.stdout,
    stderr: result.stderr,
    executionTimeMS: result.executionTimeMS,
    timedOut: result.timedOut,
    outputLimitExceeded: result.outputLimitExceeded,
    exitCode: result.exitCode,
  };
}

export async function runTestCases(
  job: ExecutionJob,
  testCases: ExecutionTestCase[],
): Promise<TestCaseResult[]> {
  const results: TestCaseResult[] = [];

  for (const testCase of testCases) {
    const result = await runTestCase(job, testCase);

    results.push(result);

    if (!result.passed) {
      break;
    }
  }

  return results;
}
