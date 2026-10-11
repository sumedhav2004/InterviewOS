import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  subscribeMock,
  codeRunHandlerMock,
  submissionHandlerMock,
} = vi.hoisted(() => ({
  subscribeMock: vi.fn(),
  codeRunHandlerMock: vi.fn(),
  submissionHandlerMock: vi.fn(),
}));

vi.mock("@interview-os/redis", () => ({
  subscribe: subscribeMock,
}));

vi.mock("../../../src/services/code-run.service", () => ({
  CodeRunService: class {
    handleExecutionCompleted = codeRunHandlerMock;
  },
}));

vi.mock("../../../src/services/submission.service", () => ({
  SubmissionService: class {
    handleExecutionCompleted = submissionHandlerMock;
  },
}));

import { ExecutionResultsService } from "../../../src/services/execution-result.service";

describe("ExecutionResultsService", () => {
  let service: ExecutionResultsService;

  const interviewRoom = {
    broadcast: vi.fn(),
  };

  beforeEach(() => {
    vi.resetAllMocks();

    service = new ExecutionResultsService(interviewRoom as never);
  });

  async function startAndGetHandler() {
    await service.start();

    expect(subscribeMock).toHaveBeenCalledWith(
      "execution:results",
      expect.any(Function),
    );

    return subscribeMock.mock.calls[0][1] as (
      message: string,
    ) => Promise<void>;
  }

  it("subscribes to the execution results channel", async () => {
    await service.start();

    expect(subscribeMock).toHaveBeenCalledTimes(1);
    expect(subscribeMock).toHaveBeenCalledWith(
      "execution:results",
      expect.any(Function),
    );
  });

  it("routes CODE_RUN events to CodeRunService", async () => {
    const handler = await startAndGetHandler();

    const event = {
      target: {
        type: "CODE_RUN",
        codeRunId: "run_123",
      },
      testCaseId: "test_case_123",
      status: "SUCCESS",
      stdout: "hello",
      stderr: "",
      executionTimeMS: 20,
    };

    await handler(JSON.stringify(event));

    expect(codeRunHandlerMock).toHaveBeenCalledTimes(1);
    expect(codeRunHandlerMock).toHaveBeenCalledWith(event);
    expect(submissionHandlerMock).not.toHaveBeenCalled();
  });

  it("routes SUBMISSION events to SubmissionService", async () => {
    const handler = await startAndGetHandler();

    const event = {
      target: {
        type: "SUBMISSION",
        submissionId: "submission_123",
      },
      testCaseId: "test_case_123",
      status: "SUCCESS",
      stdout: "hello",
      stderr: "",
      executionTimeMS: 20,
    };

    await handler(JSON.stringify(event));

    expect(submissionHandlerMock).toHaveBeenCalledTimes(1);
    expect(submissionHandlerMock).toHaveBeenCalledWith(event);
    expect(codeRunHandlerMock).not.toHaveBeenCalled();
  });

  it("ignores events with an unsupported target type", async () => {
    const handler = await startAndGetHandler();

    const event = {
      target: {
        type: "UNKNOWN",
        id: "unknown_123",
      },
    };

    await handler(JSON.stringify(event));

    expect(codeRunHandlerMock).not.toHaveBeenCalled();
    expect(submissionHandlerMock).not.toHaveBeenCalled();
  });

  it("propagates malformed JSON errors", async () => {
    const handler = await startAndGetHandler();

    await expect(handler("{invalid-json")).rejects.toThrow();

    expect(codeRunHandlerMock).not.toHaveBeenCalled();
    expect(submissionHandlerMock).not.toHaveBeenCalled();
  });

  it("propagates errors from CodeRunService", async () => {
    const handler = await startAndGetHandler();

    codeRunHandlerMock.mockRejectedValue(
      new Error("Code run processing failed"),
    );

    const event = {
      target: {
        type: "CODE_RUN",
        codeRunId: "run_123",
      },
    };

    await expect(handler(JSON.stringify(event))).rejects.toThrow(
      "Code run processing failed",
    );

    expect(submissionHandlerMock).not.toHaveBeenCalled();
  });

  it("propagates errors from SubmissionService", async () => {
    const handler = await startAndGetHandler();

    submissionHandlerMock.mockRejectedValue(
      new Error("Submission processing failed"),
    );

    const event = {
      target: {
        type: "SUBMISSION",
        submissionId: "submission_123",
      },
    };

    await expect(handler(JSON.stringify(event))).rejects.toThrow(
      "Submission processing failed",
    );

    expect(codeRunHandlerMock).not.toHaveBeenCalled();
  });
});