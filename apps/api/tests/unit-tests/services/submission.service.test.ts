import { beforeEach, describe, expect, it, vi } from "vitest";
import { EvaluationStatus, ExecutionStatus, ParticipantRole } from "@interview-os/database";

const {
  createSubmissionMock,
  findSubmissionByIdMock,
  findSubmissionsForQuestionMock,
  findInterviewQuestionByIdMock,
  findParticipantByIdMock,
  findParticipantsForInterviewMock,
  getAllTestCasesMock,
  findTestCaseByIdMock,
  enqueueMock,
  createSubmissionResultMock,
  getResultsForSubmissionMock,
  findEvaluationBySubmissionIdMock,
  createEvaluationMock,
  findInterviewByIdMock,
  broadcastMock,
} = vi.hoisted(() => ({
  createSubmissionMock: vi.fn(),
  findSubmissionByIdMock: vi.fn(),
  findSubmissionsForQuestionMock: vi.fn(),
  findInterviewQuestionByIdMock: vi.fn(),
  findParticipantByIdMock: vi.fn(),
  findParticipantsForInterviewMock: vi.fn(),
  getAllTestCasesMock: vi.fn(),
  findTestCaseByIdMock: vi.fn(),
  enqueueMock: vi.fn(),
  createSubmissionResultMock: vi.fn(),
  getResultsForSubmissionMock: vi.fn(),
  findEvaluationBySubmissionIdMock: vi.fn(),
  createEvaluationMock: vi.fn(),
  findInterviewByIdMock: vi.fn(),
  broadcastMock: vi.fn(),
}));

vi.mock("../../../src/repositories/submission.repository", () => ({
  SubmissionRepository: class {
    createSubmission = createSubmissionMock;
    findById = findSubmissionByIdMock;
    findSubmissionsForInterviewQuestion = findSubmissionsForQuestionMock;
  },
}));

vi.mock("../../../src/repositories/interview-question.repository", () => ({
  InterviewQuestionRepository: class {
    findById = findInterviewQuestionByIdMock;
  },
}));

vi.mock("../../../src/repositories/participant.repository", () => ({
  ParticipantRepository: class {
    findById = findParticipantByIdMock;
    findParticipantsForInterview = findParticipantsForInterviewMock;
  },
}));

vi.mock("../../../src/repositories/testCase.repository", () => ({
  TestCaseRepository: class {
    findById = findTestCaseByIdMock;
    getAllTestCasesForAQuestion = getAllTestCasesMock;
  },
}));

vi.mock("@interview-os/redis", () => ({
  RedisQueue: class {
    enqueue = enqueueMock;
  },
}));

vi.mock("../../../src/repositories/submission-testCase-result.repository", () => ({
  SubmissionTestCaseResultRepository: class {
    createSubmissionResult = createSubmissionResultMock;
    getResultsForSubmission = getResultsForSubmissionMock;
  },
}));

vi.mock("../../../src/repositories/evaluation.repository", () => ({
  EvaluationRepository: class {
    findBySubmissionId = findEvaluationBySubmissionIdMock;
    createEvaluation = createEvaluationMock;
  },
}));

vi.mock("../../../src/repositories/interview.repository", () => ({
  InterviewRepository: class {
    findById = findInterviewByIdMock;
  },
}));

import { SubmissionService } from "../../../src/services/submission.service";

describe("SubmissionService", () => {
  let service: SubmissionService;

  const interviewQuestion = {
    id: "iq_1",
    questionId: "question_1",
    interviewId: "interview_1",
    points: 100,
  };

  const participant = {
    id: "participant_1",
    userId: "user_1",
    interviewId: "interview_1",
    role: ParticipantRole.CANDIDATE,
  };

  const submission = {
    id: "submission_1",
    participantId: "participant_1",
    interviewQuestionId: "iq_1",
    language: "JAVASCRIPT",
    sourceCode: "console.log('hello')",
  };

  const testCase = {
    id: "test_case_1",
    questionId: "question_1",
    input: "",
    expectedOutput: "hello",
  };

  beforeEach(() => {
    vi.resetAllMocks();

    service = new SubmissionService(
      {
        createSubmission: createSubmissionMock,
        findById: findSubmissionByIdMock,
        findSubmissionsForInterviewQuestion: findSubmissionsForQuestionMock,
      } as never,
      { findById: findInterviewQuestionByIdMock } as never,
      {
        findById: findParticipantByIdMock,
        findParticipantsForInterview: findParticipantsForInterviewMock,
      } as never,
      {
        findById: findTestCaseByIdMock,
        getAllTestCasesForAQuestion: getAllTestCasesMock,
      } as never,
      { enqueue: enqueueMock } as never,
      {
        createSubmissionResult: createSubmissionResultMock,
        getResultsForSubmission: getResultsForSubmissionMock,
      } as never,
      {
        findBySubmissionId: findEvaluationBySubmissionIdMock,
        createEvaluation: createEvaluationMock,
      } as never,
      { findById: findInterviewByIdMock } as never,
      { broadcast: broadcastMock } as never,
    );
  });

  describe("createSubmission", () => {
    it("creates a submission and queues every test case", async () => {
      const data = {
        language: "JAVASCRIPT",
        sourceCode: "console.log('hello')",
      };

      createSubmissionMock.mockResolvedValue(submission);
      findInterviewQuestionByIdMock.mockResolvedValue(interviewQuestion);
      findParticipantByIdMock.mockResolvedValue(participant);
      getAllTestCasesMock.mockResolvedValue([
        testCase,
        { ...testCase, id: "test_case_2", input: "second" },
      ]);

      const result = await service.createSubmission(
        "iq_1",
        "participant_1",
        "user_1",
        data as never,
      );

      expect(createSubmissionMock).toHaveBeenCalledWith("iq_1", "participant_1", data);
      expect(enqueueMock).toHaveBeenCalledTimes(2);
      expect(enqueueMock).toHaveBeenCalledWith(
        expect.objectContaining({
          target: { type: "SUBMISSION", submissionId: "submission_1" },
          testCaseId: "test_case_1",
          participantId: "participant_1",
          interviewQuestionId: "iq_1",
          language: "JAVASCRIPT",
          status: "QUEUED",
        }),
      );
      expect(result).toEqual(submission);
    });

    it("throws 404 when the interview question does not exist", async () => {
      findInterviewQuestionByIdMock.mockResolvedValue(null);

      await expect(
        service.createSubmission("missing", "participant_1", "user_1", {} as never),
      ).rejects.toMatchObject({
        statusCode: 404,
        code: "INTERVIEWQUESTION_NOT_FOUND",
      });

      expect(createSubmissionMock).not.toHaveBeenCalled();
    });

    it("throws 404 when the participant does not exist", async () => {
      findInterviewQuestionByIdMock.mockResolvedValue(interviewQuestion);
      findParticipantByIdMock.mockResolvedValue(null);

      await expect(
        service.createSubmission("iq_1", "missing", "user_1", {} as never),
      ).rejects.toMatchObject({
        statusCode: 404,
        code: "PARTICIPANT_NOT_FOUND",
      });

      expect(createSubmissionMock).not.toHaveBeenCalled();
    });

    it("rejects non-candidates and users who do not own the participant", async () => {
      findInterviewQuestionByIdMock.mockResolvedValue(interviewQuestion);
      findParticipantByIdMock.mockResolvedValue({
        ...participant,
        role: "INTERVIEWER",
      });

      await expect(
        service.createSubmission("iq_1", "participant_1", "user_1", {} as never),
      ).rejects.toMatchObject({ statusCode: 403, code: "UNAUTHORIZED" });

      findParticipantByIdMock.mockResolvedValue(participant);

      await expect(
        service.createSubmission("iq_1", "participant_1", "other_user", {} as never),
      ).rejects.toMatchObject({ statusCode: 403, code: "UNAUTHORIZED" });

      expect(createSubmissionMock).not.toHaveBeenCalled();
    });

    it("throws 404 when the question has no test cases", async () => {
      findInterviewQuestionByIdMock.mockResolvedValue(interviewQuestion);
      findParticipantByIdMock.mockResolvedValue(participant);
      getAllTestCasesMock.mockResolvedValue([]);

      await expect(
        service.createSubmission("iq_1", "participant_1", "user_1", {} as never),
      ).rejects.toMatchObject({
        statusCode: 404,
        code: "NO_TEST_CASES_FOUND",
      });

      expect(createSubmissionMock).not.toHaveBeenCalled();
      expect(enqueueMock).not.toHaveBeenCalled();
    });
  });

  describe("handleExecutionCompleted", () => {
    const event = {
      target: { type: "SUBMISSION", submissionId: "submission_1" },
      testCaseId: "test_case_1",
      status: "SUCCESS",
      stdout: "hello\n",
      stderr: "",
      executionTimeMS: 25,
    };

    beforeEach(() => {
      findSubmissionByIdMock.mockResolvedValue(submission);
      findInterviewQuestionByIdMock.mockResolvedValue(interviewQuestion);
      findTestCaseByIdMock.mockResolvedValue(testCase);
      findParticipantByIdMock.mockResolvedValue(participant);
      createSubmissionResultMock.mockResolvedValue({
        id: "result_1",
        status: ExecutionStatus.SUCCESS,
        passed: true,
        executionTimeMS: 25,
      });
      getAllTestCasesMock.mockResolvedValue([testCase]);
      getResultsForSubmissionMock.mockResolvedValue([
        {
          passed: true,
          status: ExecutionStatus.SUCCESS,
          executionTimeMS: 25,
        },
      ]);
      findEvaluationBySubmissionIdMock.mockResolvedValue(null);
      createEvaluationMock.mockResolvedValue({
        id: "evaluation_1",
        status: EvaluationStatus.PASSED,
        score: 100,
      });
    });

    it("persists and broadcasts a passing test result", async () => {
      await service.handleExecutionCompleted(event as never);

      expect(createSubmissionResultMock).toHaveBeenCalledWith({
        submissionId: "submission_1",
        testCaseId: "test_case_1",
        status: ExecutionStatus.SUCCESS,
        passed: true,
        stdout: "hello\n",
        stderr: "",
        executionTimeMS: 25,
      });

      expect(broadcastMock).toHaveBeenCalledWith(
        "interview_1",
        expect.objectContaining({
          type: "SUBMISSION_TEST_CASE_RESULT",
          submissionId: "submission_1",
        }),
      );

      expect(createEvaluationMock).toHaveBeenCalledWith({
        submissionId: "submission_1",
        status: EvaluationStatus.PASSED,
        score: 100,
        passedTests: 1,
        totalTests: 1,
        executionTimeMS: 25,
      });
    });

    it("rejects an unsupported execution target", async () => {
      await expect(
        service.handleExecutionCompleted({
          ...event,
          target: { type: "CODE_RUN", codeRunId: "run_1" },
        } as never),
      ).rejects.toMatchObject({
        statusCode: 400,
        code: "UNSUPPORTED_TARGET",
      });

      expect(findSubmissionByIdMock).not.toHaveBeenCalled();
    });

    it("throws 404 when the submission does not exist", async () => {
      findSubmissionByIdMock.mockResolvedValue(null);

      await expect(service.handleExecutionCompleted(event as never)).rejects.toMatchObject({
        statusCode: 404,
        code: "SUBMISSION_NOT_FOUND",
      });
    });

    it("rejects a test case belonging to another question", async () => {
      findTestCaseByIdMock.mockResolvedValue({
        ...testCase,
        questionId: "different_question",
      });

      await expect(service.handleExecutionCompleted(event as never)).rejects.toMatchObject({
        statusCode: 400,
        code: "INVALID_TEST_CASE",
      });

      expect(createSubmissionResultMock).not.toHaveBeenCalled();
    });

    it("does not create an evaluation until all test cases finish", async () => {
      getAllTestCasesMock.mockResolvedValue([testCase, { ...testCase, id: "test_case_2" }]);

      getResultsForSubmissionMock.mockResolvedValue([{ passed: true, executionTimeMS: 25 }]);

      await service.handleExecutionCompleted(event as never);

      expect(createEvaluationMock).not.toHaveBeenCalled();
      expect(broadcastMock).toHaveBeenCalledTimes(1);
    });

    it("does not create a duplicate evaluation", async () => {
      findEvaluationBySubmissionIdMock.mockResolvedValue({
        id: "existing_evaluation",
      });

      await service.handleExecutionCompleted(event as never);

      expect(createEvaluationMock).not.toHaveBeenCalled();
      expect(broadcastMock).toHaveBeenCalledTimes(1);
    });

    it("calculates a failed evaluation when not all tests pass", async () => {
      getResultsForSubmissionMock.mockResolvedValue([
        { passed: true, executionTimeMS: 10 },
        { passed: false, executionTimeMS: 20 },
      ]);
      getAllTestCasesMock.mockResolvedValue([testCase, { ...testCase, id: "test_case_2" }]);

      await service.handleExecutionCompleted(event as never);

      expect(createEvaluationMock).toHaveBeenCalledWith({
        submissionId: "submission_1",
        status: EvaluationStatus.FAILED,
        score: 50,
        passedTests: 1,
        totalTests: 2,
        executionTimeMS: 30,
      });
    });
  });

  describe("getSubmissionById", () => {
    it("returns the submission, results, and evaluation for its owner", async () => {
      findSubmissionByIdMock.mockResolvedValue(submission);
      findParticipantByIdMock.mockResolvedValue(participant);
      getResultsForSubmissionMock.mockResolvedValue([{ id: "result_1" }]);
      findEvaluationBySubmissionIdMock.mockResolvedValue({ id: "evaluation_1" });

      const result = await service.getSubmissionById("submission_1", "user_1");

      expect(result).toEqual({
        submission,
        results: [{ id: "result_1" }],
        evaluation: { id: "evaluation_1" },
      });
    });

    it("throws 404 when the submission does not exist", async () => {
      findSubmissionByIdMock.mockResolvedValue(null);

      await expect(service.getSubmissionById("missing", "user_1")).rejects.toMatchObject({
        statusCode: 404,
        code: "SUBMISSION_NOT_FOUND",
      });
    });

    it("rejects access by a different user", async () => {
      findSubmissionByIdMock.mockResolvedValue(submission);
      findParticipantByIdMock.mockResolvedValue(participant);

      await expect(service.getSubmissionById("submission_1", "other_user")).rejects.toMatchObject({
        statusCode: 403,
        code: "UNAUTHORIZED",
      });

      expect(getResultsForSubmissionMock).not.toHaveBeenCalled();
    });
  });

  describe("getSubmissionsForInterviewQuestion", () => {
    it("returns submissions when the requester is an interview participant", async () => {
      findInterviewQuestionByIdMock.mockResolvedValue(interviewQuestion);
      findInterviewByIdMock.mockResolvedValue({ id: "interview_1" });
      findParticipantsForInterviewMock.mockResolvedValue([
        participant,
        { ...participant, userId: "interviewer_1" },
      ]);
      findSubmissionsForQuestionMock.mockResolvedValue([submission]);

      const result = await service.getSubmissionsForInterviewQuestion("iq_1", "interviewer_1");

      expect(findSubmissionsForQuestionMock).toHaveBeenCalledWith("iq_1");
      expect(result).toEqual([submission]);
    });

    it("throws 404 when the interview question does not exist", async () => {
      findInterviewQuestionByIdMock.mockResolvedValue(null);

      await expect(
        service.getSubmissionsForInterviewQuestion("missing", "user_1"),
      ).rejects.toMatchObject({
        statusCode: 404,
        code: "INTERVIEW_QUESTION_NOT_FOUND",
      });
    });

    it("throws 404 when the interview does not exist", async () => {
      findInterviewQuestionByIdMock.mockResolvedValue(interviewQuestion);
      findInterviewByIdMock.mockResolvedValue(null);

      await expect(
        service.getSubmissionsForInterviewQuestion("iq_1", "user_1"),
      ).rejects.toMatchObject({
        statusCode: 404,
        code: "INTERVIEW_NOT_FOUND",
      });
    });

    it("rejects requesters who are not participants in the interview", async () => {
      findInterviewQuestionByIdMock.mockResolvedValue(interviewQuestion);
      findInterviewByIdMock.mockResolvedValue({ id: "interview_1" });
      findParticipantsForInterviewMock.mockResolvedValue([participant]);

      await expect(
        service.getSubmissionsForInterviewQuestion("iq_1", "outsider"),
      ).rejects.toMatchObject({
        statusCode: 403,
        code: "UNAUTHORIZED",
      });

      expect(findSubmissionsForQuestionMock).not.toHaveBeenCalled();
    });
  });
});
