import { beforeEach, describe, expect, it, vi } from "vitest";
import { ExecutionStatus, ParticipantRole } from "@interview-os/database";
import { CodeRunService } from "../../../src/services/code-run.service";

const { enqueueMock } = vi.hoisted(() => ({
  enqueueMock: vi.fn(),
}));

vi.mock("@interview-os/redis", () => ({
  RedisQueue: class {
    enqueue = enqueueMock;
  },
}));

describe("CodeRunService", () => {
  let service: CodeRunService;

  let codeRunRepository: {
    createCodeRun: ReturnType<typeof vi.fn>;
    findById: ReturnType<typeof vi.fn>;
    updateCodeRun: ReturnType<typeof vi.fn>;
    getCodeRunWithResults: ReturnType<typeof vi.fn>;
  };

  let interviewQuestionRepository: {
    findById: ReturnType<typeof vi.fn>;
  };

  let participantRepository: {
    findById: ReturnType<typeof vi.fn>;
  };

  let testCaseRepository: {
    findById: ReturnType<typeof vi.fn>;
    getVisibleTestCasesForAQuestion: ReturnType<typeof vi.fn>;
  };

  let codeRunTestCaseResultRepository: {
    createResult: ReturnType<typeof vi.fn>;
    getResultsForCodeRun: ReturnType<typeof vi.fn>;
  };

  let interviewRoom: {
    broadcast: ReturnType<typeof vi.fn>;
  };

  const interviewQuestion = {
    id: "iq_1",
    questionId: "question_1",
    interviewId: "interview_1",
  };

  const participant = {
    id: "participant_1",
    userId: "user_1",
    role: ParticipantRole.CANDIDATE,
  };

  const codeRun = {
    id: "run_1",
    participantId: "participant_1",
    interviewQuestionId: "iq_1",
    language: "JAVASCRIPT",
    sourceCode: "console.log('hello')",
    status: ExecutionStatus.PENDING,
  };

  const testCase = {
    id: "test_case_1",
    input: "input",
    expectedOutput: "hello",
  };

  beforeEach(() => {
    vi.resetAllMocks();

    codeRunRepository = {
      createCodeRun: vi.fn(),
      findById: vi.fn(),
      updateCodeRun: vi.fn(),
      getCodeRunWithResults: vi.fn(),
    };

    interviewQuestionRepository = {
      findById: vi.fn(),
    };

    participantRepository = {
      findById: vi.fn(),
    };

    testCaseRepository = {
      findById: vi.fn(),
      getVisibleTestCasesForAQuestion: vi.fn(),
    };

    codeRunTestCaseResultRepository = {
      createResult: vi.fn(),
      getResultsForCodeRun: vi.fn(),
    };

    interviewRoom = {
      broadcast: vi.fn(),
    };

    service = new CodeRunService(
      codeRunRepository as never,
      interviewQuestionRepository as never,
      participantRepository as never,
      testCaseRepository as never,
      codeRunTestCaseResultRepository as never,
      interviewRoom as never,
    );
  });

  describe("createCodeRun", () => {
    it("creates a code run for an authorized candidate", async () => {
      const data = {
        language: "JAVASCRIPT",
        sourceCode: "console.log('hello')",
      };

      const createdRun = { ...codeRun };

      interviewQuestionRepository.findById.mockResolvedValue(interviewQuestion);
      participantRepository.findById.mockResolvedValue(participant);
      codeRunRepository.createCodeRun.mockResolvedValue(createdRun);

      const result = await service.createCodeRun("iq_1", "participant_1", "user_1", data as never);

      expect(interviewQuestionRepository.findById).toHaveBeenCalledWith("iq_1");
      expect(participantRepository.findById).toHaveBeenCalledWith("participant_1");
      expect(codeRunRepository.createCodeRun).toHaveBeenCalledWith("iq_1", "participant_1", data);
      expect(result).toEqual(createdRun);
    });

    it("throws 404 when the interview question does not exist", async () => {
      interviewQuestionRepository.findById.mockResolvedValue(null);

      await expect(
        service.createCodeRun("missing", "participant_1", "user_1", {} as never),
      ).rejects.toMatchObject({
        statusCode: 404,
        code: "INTERVIEWQUESTION_NOT_FOUND",
      });

      expect(participantRepository.findById).not.toHaveBeenCalled();
      expect(codeRunRepository.createCodeRun).not.toHaveBeenCalled();
    });

    it("throws 404 when the participant does not exist", async () => {
      interviewQuestionRepository.findById.mockResolvedValue(interviewQuestion);
      participantRepository.findById.mockResolvedValue(null);

      await expect(
        service.createCodeRun("iq_1", "missing", "user_1", {} as never),
      ).rejects.toMatchObject({
        statusCode: 404,
        code: "PARTICIPANT_NOT_FOUND",
      });

      expect(codeRunRepository.createCodeRun).not.toHaveBeenCalled();
    });

    it("rejects participants who are not candidates", async () => {
      interviewQuestionRepository.findById.mockResolvedValue(interviewQuestion);
      participantRepository.findById.mockResolvedValue({
        ...participant,
        role: "INTERVIEWER",
      });

      await expect(
        service.createCodeRun("iq_1", "participant_1", "user_1", {} as never),
      ).rejects.toMatchObject({
        statusCode: 403,
        code: "UNAUTHORIZED",
      });

      expect(codeRunRepository.createCodeRun).not.toHaveBeenCalled();
    });

    it("rejects a candidate who does not own the participant record", async () => {
      interviewQuestionRepository.findById.mockResolvedValue(interviewQuestion);
      participantRepository.findById.mockResolvedValue(participant);

      await expect(
        service.createCodeRun("iq_1", "participant_1", "another_user", {} as never),
      ).rejects.toMatchObject({
        statusCode: 403,
        code: "UNAUTHORIZED",
      });

      expect(codeRunRepository.createCodeRun).not.toHaveBeenCalled();
    });
  });

  describe("updateCodeRun", () => {
    it("updates a code run owned by the requesting candidate", async () => {
      const data = { sourceCode: "console.log('updated')" };
      const updatedRun = { ...codeRun, ...data };

      codeRunRepository.findById.mockResolvedValue(codeRun);
      participantRepository.findById.mockResolvedValue(participant);
      codeRunRepository.updateCodeRun.mockResolvedValue(updatedRun);

      const result = await service.updateCodeRun("run_1", "participant_1", "user_1", data as never);

      expect(codeRunRepository.updateCodeRun).toHaveBeenCalledWith("run_1", data);
      expect(result).toEqual(updatedRun);
    });

    it("throws 404 when the code run does not exist", async () => {
      codeRunRepository.findById.mockResolvedValue(null);

      await expect(
        service.updateCodeRun("missing", "participant_1", "user_1", {} as never),
      ).rejects.toMatchObject({
        statusCode: 404,
        code: "CODERUN_NOT_FOUND",
      });

      expect(participantRepository.findById).not.toHaveBeenCalled();
    });

    it("rejects attempts to update another participant's code run", async () => {
      codeRunRepository.findById.mockResolvedValue({
        ...codeRun,
        participantId: "other_participant",
      });

      await expect(
        service.updateCodeRun("run_1", "participant_1", "user_1", {} as never),
      ).rejects.toMatchObject({
        statusCode: 403,
        code: "UNAUTHORIZED",
      });

      expect(codeRunRepository.updateCodeRun).not.toHaveBeenCalled();
    });

    it("rejects updates when the participant belongs to another user", async () => {
      codeRunRepository.findById.mockResolvedValue(codeRun);
      participantRepository.findById.mockResolvedValue(participant);

      await expect(
        service.updateCodeRun("run_1", "participant_1", "another_user", {} as never),
      ).rejects.toMatchObject({
        statusCode: 403,
        code: "UNAUTHORIZED",
      });

      expect(codeRunRepository.updateCodeRun).not.toHaveBeenCalled();
    });
  });

  describe("executeCodeRun", () => {
    it("enqueues visible test cases and marks the run as running", async () => {
      const secondTestCase = {
        id: "test_case_2",
        input: "second input",
        expectedOutput: "second output",
      };

      codeRunRepository.findById.mockResolvedValue(codeRun);
      participantRepository.findById.mockResolvedValue(participant);
      interviewQuestionRepository.findById.mockResolvedValue(interviewQuestion);
      testCaseRepository.getVisibleTestCasesForAQuestion.mockResolvedValue([
        testCase,
        secondTestCase,
      ]);
      codeRunRepository.updateCodeRun.mockResolvedValue({
        ...codeRun,
        status: ExecutionStatus.RUNNING,
      });

      const result = await service.executeCodeRun("run_1", "user_1");

      expect(enqueueMock).toHaveBeenCalledTimes(2);

      expect(enqueueMock).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          target: {
            type: "CODE_RUN",
            codeRunId: "run_1",
          },
          testCaseId: "test_case_1",
          participantId: "participant_1",
          interviewQuestionId: "iq_1",
          language: "JAVASCRIPT",
          sourceCode: codeRun.sourceCode,
          status: "QUEUED",
          input: "input",
        }),
      );

      expect(enqueueMock).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          testCaseId: "test_case_2",
          input: "second input",
        }),
      );

      expect(codeRunRepository.updateCodeRun).toHaveBeenCalledWith("run_1", {
        status: ExecutionStatus.RUNNING,
      });

      expect(result).toMatchObject({
        status: ExecutionStatus.RUNNING,
      });
    });

    it("throws 404 when the code run does not exist", async () => {
      codeRunRepository.findById.mockResolvedValue(null);

      await expect(service.executeCodeRun("missing", "user_1")).rejects.toMatchObject({
        statusCode: 404,
        code: "CORRESPONDING_CODERUN_NOT_EXIST",
      });

      expect(enqueueMock).not.toHaveBeenCalled();
    });

    it("rejects execution by a different user", async () => {
      codeRunRepository.findById.mockResolvedValue(codeRun);
      participantRepository.findById.mockResolvedValue(participant);

      await expect(service.executeCodeRun("run_1", "another_user")).rejects.toMatchObject({
        statusCode: 403,
        code: "UNAUTHORIZED",
      });

      expect(enqueueMock).not.toHaveBeenCalled();
    });

    it("rejects unsupported programming languages", async () => {
      codeRunRepository.findById.mockResolvedValue({
        ...codeRun,
        language: "RUBY",
      });
      participantRepository.findById.mockResolvedValue(participant);
      interviewQuestionRepository.findById.mockResolvedValue(interviewQuestion);

      await expect(service.executeCodeRun("run_1", "user_1")).rejects.toMatchObject({
        statusCode: 422,
        code: "LANGUAGE_NOT_SUPPORTED",
      });

      expect(enqueueMock).not.toHaveBeenCalled();
    });

    it("rejects execution when there are no visible test cases", async () => {
      codeRunRepository.findById.mockResolvedValue(codeRun);
      participantRepository.findById.mockResolvedValue(participant);
      interviewQuestionRepository.findById.mockResolvedValue(interviewQuestion);
      testCaseRepository.getVisibleTestCasesForAQuestion.mockResolvedValue([]);

      await expect(service.executeCodeRun("run_1", "user_1")).rejects.toMatchObject({
        statusCode: 404,
        code: "NO_TEST_CASES_FOUND",
      });

      expect(enqueueMock).not.toHaveBeenCalled();
      expect(codeRunRepository.updateCodeRun).not.toHaveBeenCalled();
    });
  });

  describe("getCodeRunResults", () => {
    it("returns results to the participant's owning user", async () => {
      const runWithResults = {
        ...codeRun,
        results: [],
      };

      codeRunRepository.getCodeRunWithResults.mockResolvedValue(runWithResults);
      participantRepository.findById.mockResolvedValue(participant);

      const result = await service.getCodeRunResults("run_1", "user_1");

      expect(codeRunRepository.getCodeRunWithResults).toHaveBeenCalledWith("run_1");
      expect(result).toEqual(runWithResults);
    });

    it("throws 404 when the code run does not exist", async () => {
      codeRunRepository.getCodeRunWithResults.mockResolvedValue(null);

      await expect(service.getCodeRunResults("missing", "user_1")).rejects.toMatchObject({
        statusCode: 404,
        code: "CODERUN_NOT_FOUND",
      });

      expect(participantRepository.findById).not.toHaveBeenCalled();
    });

    it("rejects access by a user who does not own the run", async () => {
      codeRunRepository.getCodeRunWithResults.mockResolvedValue(codeRun);
      participantRepository.findById.mockResolvedValue(participant);

      await expect(service.getCodeRunResults("run_1", "another_user")).rejects.toMatchObject({
        statusCode: 403,
        code: "UNAUTHORIZED",
      });
    });
  });

  describe("handleExecutionCompleted", () => {
    const event = {
      target: {
        type: "CODE_RUN",
        codeRunId: "run_1",
      },
      testCaseId: "test_case_1",
      status: "SUCCESS",
      stdout: "hello\n",
      stderr: "",
      executionTimeMS: 25,
    };

    it("persists and broadcasts a result without completing a partially finished run", async () => {
      const persistedResult = {
        id: "result_1",
        codeRunId: "run_1",
        testCaseId: "test_case_1",
        status: ExecutionStatus.SUCCESS,
        passed: true,
        stdout: "hello\n",
        stderr: "",
        executionTimeMS: 25,
      };

      vi.spyOn(console, "log").mockImplementation(() => {});

      codeRunRepository.findById.mockResolvedValue(codeRun);
      interviewQuestionRepository.findById.mockResolvedValue(interviewQuestion);
      testCaseRepository.findById.mockResolvedValue(testCase);
      codeRunTestCaseResultRepository.createResult.mockResolvedValue(persistedResult);
      testCaseRepository.getVisibleTestCasesForAQuestion.mockResolvedValue([
        testCase,
        { id: "test_case_2", expectedOutput: "another output" },
      ]);
      codeRunTestCaseResultRepository.getResultsForCodeRun.mockResolvedValue([persistedResult]);

      await service.handleExecutionCompleted(event as never);

      expect(codeRunTestCaseResultRepository.createResult).toHaveBeenCalledWith({
        codeRunId: "run_1",
        testCaseId: "test_case_1",
        status: ExecutionStatus.SUCCESS,
        passed: true,
        stdout: "hello\n",
        stderr: "",
        executionTimeMS: 25,
      });

      expect(interviewRoom.broadcast).toHaveBeenCalledWith("interview_1", {
        type: "CODE_RUN_TEST_CASE_RESULT",
        codeRunId: "run_1",
        result: persistedResult,
      });

      expect(codeRunRepository.updateCodeRun).not.toHaveBeenCalled();

      expect(interviewRoom.broadcast).toHaveBeenCalledTimes(1);
    });

    it("marks the run successful when all test cases finish successfully", async () => {
      vi.spyOn(console, "log").mockImplementation(() => {});

      const persistedResult = {
        id: "result_1",
        status: ExecutionStatus.SUCCESS,
        passed: true,
      };

      codeRunRepository.findById.mockResolvedValue(codeRun);
      interviewQuestionRepository.findById.mockResolvedValue(interviewQuestion);
      testCaseRepository.findById.mockResolvedValue(testCase);
      codeRunTestCaseResultRepository.createResult.mockResolvedValue(persistedResult);
      testCaseRepository.getVisibleTestCasesForAQuestion.mockResolvedValue([testCase]);
      codeRunTestCaseResultRepository.getResultsForCodeRun.mockResolvedValue([persistedResult]);

      await service.handleExecutionCompleted(event as never);

      expect(codeRunRepository.updateCodeRun).toHaveBeenCalledWith("run_1", {
        status: ExecutionStatus.SUCCESS,
      });

      expect(interviewRoom.broadcast).toHaveBeenLastCalledWith("interview_1", {
        type: "CODE_RUN_COMPLETED",
        codeRunId: "run_1",
        status: ExecutionStatus.SUCCESS,
      });
    });

    it("marks the run failed when any completed test case failed", async () => {
      vi.spyOn(console, "log").mockImplementation(() => {});

      codeRunRepository.findById.mockResolvedValue(codeRun);
      interviewQuestionRepository.findById.mockResolvedValue(interviewQuestion);
      testCaseRepository.findById.mockResolvedValue(testCase);
      codeRunTestCaseResultRepository.createResult.mockResolvedValue({
        id: "result_1",
        status: ExecutionStatus.FAILED,
        passed: false,
      });
      testCaseRepository.getVisibleTestCasesForAQuestion.mockResolvedValue([testCase]);
      codeRunTestCaseResultRepository.getResultsForCodeRun.mockResolvedValue([
        { status: ExecutionStatus.FAILED },
      ]);

      await service.handleExecutionCompleted({
        ...event,
        status: "FAILED",
        stdout: "",
        stderr: "Runtime error",
      } as never);

      expect(codeRunRepository.updateCodeRun).toHaveBeenCalledWith("run_1", {
        status: ExecutionStatus.FAILED,
      });

      expect(interviewRoom.broadcast).toHaveBeenLastCalledWith("interview_1", {
        type: "CODE_RUN_COMPLETED",
        codeRunId: "run_1",
        status: ExecutionStatus.FAILED,
      });
    });

    it("throws when the execution target is unsupported", async () => {
      vi.spyOn(console, "log").mockImplementation(() => {});

      await expect(
        service.handleExecutionCompleted({
          ...event,
          target: {
            type: "SUBMISSION",
            submissionId: "submission_1",
          },
        } as never),
      ).rejects.toMatchObject({
        statusCode: 500,
        code: "UNSUPPORTED_EXECUTION_TARGET",
      });

      expect(codeRunRepository.findById).not.toHaveBeenCalled();
    });

    it("throws 404 when the code run does not exist", async () => {
      vi.spyOn(console, "log").mockImplementation(() => {});
      codeRunRepository.findById.mockResolvedValue(null);

      await expect(service.handleExecutionCompleted(event as never)).rejects.toMatchObject({
        statusCode: 404,
        code: "CORRESPONDING_CODERUN_NOT_EXIST",
      });
    });

    it("throws when the test case expected output is not a string", async () => {
      vi.spyOn(console, "log").mockImplementation(() => {});

      codeRunRepository.findById.mockResolvedValue(codeRun);
      interviewQuestionRepository.findById.mockResolvedValue(interviewQuestion);
      testCaseRepository.findById.mockResolvedValue({
        ...testCase,
        expectedOutput: null,
      });

      await expect(service.handleExecutionCompleted(event as never)).rejects.toMatchObject({
        statusCode: 500,
        code: "INVALID_TEST_CASE_EXPECTED_OUTPUT",
      });

      expect(codeRunTestCaseResultRepository.createResult).not.toHaveBeenCalled();
    });
  });
});
