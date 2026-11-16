import { CodeRunRepository } from "../repositories/code-run.repository";
import { InterviewQuestionRepository } from "../repositories/interview-question.repository";
import { ParticipantRepository } from "../repositories/participant.repository";
import {
  CreateCodeRunData,
  ExecutionCompletedEvent,
  ExecutionJob,
  UpdateCodeRunData,
} from "../types/codeRun";
import { AppError } from "../../core/errors/app-error";
import { ExecutionStatus, ParticipantRole, Prisma } from "@interview-os/database";
import { TestCaseRepository } from "../repositories/testCase.repository";
import { RedisQueue } from "@interview-os/redis";
import { randomUUID } from "node:crypto";
import { CodeRunTestCaseResultRepository } from "../repositories/code-run-testCase-result.repository";
import { InterviewRoom } from "../realtime/websocket/interview-room";

function parseJsonOutput(output: string): Prisma.JsonValue | undefined {
  try {
    return JSON.parse(output.trim()) as Prisma.JsonValue;
  } catch {
    return undefined;
  }
}

function jsonEqual(a: Prisma.JsonValue, b: Prisma.JsonValue): boolean {
  if (a === b) return true;

  if (typeof a !== "object" || a === null || typeof b !== "object" || b === null) {
    return false;
  }

  if (Array.isArray(a) !== Array.isArray(b)) return false;

  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((value, index) => jsonEqual(value, b[index]));
  }

  const aObject = a as { [key: string]: Prisma.JsonValue };
  const bObject = b as { [key: string]: Prisma.JsonValue };

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

export class CodeRunService {
  constructor(
    private readonly codeRunRepository = new CodeRunRepository(),
    private readonly interviewQuestionRepository = new InterviewQuestionRepository(),
    private readonly participantRepository = new ParticipantRepository(),
    private readonly testCaseRepository = new TestCaseRepository(),
    private readonly codeRunTestCaseResultRepository = new CodeRunTestCaseResultRepository(),
    private readonly interviewRoom: InterviewRoom,
  ) {}

  async createCodeRun(
    interviewQuestionId: string,
    participantId: string,
    requesterId: string,
    data: CreateCodeRunData,
  ) {
    const interviewQuestion = await this.interviewQuestionRepository.findById(interviewQuestionId);

    if (!interviewQuestion) {
      throw new AppError("InterviewQuestion Not Found", 404, "INTERVIEWQUESTION_NOT_FOUND");
    }

    const participant = await this.participantRepository.findById(participantId);

    if (!participant) {
      throw new AppError("Participant Not Found", 404, "PARTICIPANT_NOT_FOUND");
    }

    if (participant.role !== ParticipantRole.CANDIDATE) {
      throw new AppError("Unauthorized", 403, "UNAUTHORIZED");
    }

    if (participant.userId !== requesterId) {
      throw new AppError("Unauthorized", 403, "UNAUTHORIZED");
    }

    return this.codeRunRepository.createCodeRun(interviewQuestionId, participantId, data);
  }

  async updateCodeRun(
    id: string,
    participantId: string,
    requesterId: string,
    data: UpdateCodeRunData,
  ) {
    const codeRun = await this.codeRunRepository.findById(id);

    if (!codeRun) {
      throw new AppError("CodeRun Not Found", 404, "CODERUN_NOT_FOUND");
    }

    if (codeRun.participantId !== participantId) {
      throw new AppError("Unauthorized", 403, "UNAUTHORIZED");
    }

    const participant = await this.participantRepository.findById(participantId);

    if (!participant) {
      throw new AppError("Participant Not Found", 404, "PARTICIPANT_NOT_FOUND");
    }

    if (participant.role !== ParticipantRole.CANDIDATE) {
      throw new AppError("Unauthorized", 403, "UNAUTHORIZED");
    }

    if (participant.userId !== requesterId) {
      throw new AppError("Unauthorized", 403, "UNAUTHORIZED");
    }

    return this.codeRunRepository.updateCodeRun(id, data);
  }

  async executeCodeRun(id: string, requesterId: string) {
    const codeRun = await this.codeRunRepository.findById(id);

    if (!codeRun) {
      throw new AppError(
        "Corresponding Code-Run Doesn't Exist",
        404,
        "CORRESPONDING_CODERUN_NOT_EXIST",
      );
    }

    const participant = await this.participantRepository.findById(codeRun.participantId);

    if (
      !participant ||
      participant.userId !== requesterId ||
      participant.role !== ParticipantRole.CANDIDATE
    ) {
      throw new AppError("Unauthorized", 403, "UNAUTHORIZED");
    }

    const interviewQuestion = await this.interviewQuestionRepository.findById(
      codeRun.interviewQuestionId,
    );

    if (!interviewQuestion) {
      throw new AppError("InterviewQuestion Not Found", 404, "INTERVIEWQUESTION_NOT_FOUND");
    }

    if (
      codeRun.language !== "PYTHON" &&
      codeRun.language !== "JAVASCRIPT" &&
      codeRun.language !== "JAVA" &&
      codeRun.language !== "CPP" &&
      codeRun.language !== "C" &&
      codeRun.language !== "GO" &&
      codeRun.language !== "RUST"
    ) {
      throw new AppError(
        "This language is not supported for execution yet",
        422,
        "LANGUAGE_NOT_SUPPORTED",
      );
    }

    const visibleTestCases = await this.testCaseRepository.getVisibleTestCasesForAQuestion(
      interviewQuestion.questionId,
    );

    if (visibleTestCases.length === 0) {
      throw new AppError("No Test Cases Found", 404, "NO_TEST_CASES_FOUND");
    }

    const queue = new RedisQueue();

    for (const testCase of visibleTestCases) {
      const job: ExecutionJob = {
        id: randomUUID(),
        target: {
          type: "CODE_RUN",
          codeRunId: codeRun.id,
        },
        testCaseId: testCase.id,
        participantId: codeRun.participantId,
        interviewQuestionId: codeRun.interviewQuestionId,
        language: codeRun.language,
        sourceCode: codeRun.sourceCode,
        status: "QUEUED",
        input: testCase.input,
      };

      await queue.enqueue(job);
    }

    const result = await this.codeRunRepository.updateCodeRun(id, {
      status: ExecutionStatus.RUNNING,
    });

    return result;
  }

  async getCodeRunResults(id: string, requesterId: string) {
    const codeRun = await this.codeRunRepository.getCodeRunWithResults(id);

    if (!codeRun) {
      throw new AppError("CodeRun Not Found", 404, "CODERUN_NOT_FOUND");
    }

    const participant = await this.participantRepository.findById(codeRun.participantId);

    if (!participant || participant.userId !== requesterId) {
      throw new AppError("Unauthorized", 403, "UNAUTHORIZED");
    }

    return codeRun;
  }

  async handleExecutionCompleted(event: ExecutionCompletedEvent) {
    console.log("🔥 [CODE RUN] EXECUTION_COMPLETED RECEIVED:", event);

    if (event.target.type !== "CODE_RUN") {
      throw new AppError("Unsupported Execution Target", 500, "UNSUPPORTED_EXECUTION_TARGET");
    }

    const codeRun = await this.codeRunRepository.findById(event.target.codeRunId);

    if (!codeRun) {
      throw new AppError(
        "Corresponding Code-Run Doesn't Exist",
        404,
        "CORRESPONDING_CODERUN_NOT_EXIST",
      );
    }

    const interviewQuestion = await this.interviewQuestionRepository.findById(
      codeRun.interviewQuestionId,
    );

    if (!interviewQuestion) {
      throw new AppError("InterviewQuestion Not Found", 404, "INTERVIEWQUESTION_NOT_FOUND");
    }

    const testCase = await this.testCaseRepository.findById(event.testCaseId);

    if (!testCase) {
      throw new AppError("Test Case Not Found", 404, "TEST_CASE_NOT_FOUND");
    }

    const status = event.status === "SUCCESS" ? ExecutionStatus.SUCCESS : ExecutionStatus.FAILED;

    const actualOutput = parseJsonOutput(event.stdout);

    const expectedOutput = testCase.expectedOutput as Prisma.JsonValue;

    const passed =
      status === ExecutionStatus.SUCCESS &&
      actualOutput !== undefined &&
      jsonEqual(actualOutput, expectedOutput);

    const createdResult = await this.codeRunTestCaseResultRepository.createResult({
      codeRunId: event.target.codeRunId,
      testCaseId: event.testCaseId,
      status,
      passed,
      stdout: event.stdout,
      stderr: event.stderr,
      executionTimeMS: event.executionTimeMS,
    });

    /*
     * This result is now persisted.
     *
     * Broadcast the exact persisted result so every
     * participant in the interview room receives it.
     */
    this.interviewRoom.broadcast(interviewQuestion.interviewId, {
      type: "CODE_RUN_TEST_CASE_RESULT",
      codeRunId: event.target.codeRunId,
      result: createdResult,
    });

    const visibleTestCases = await this.testCaseRepository.getVisibleTestCasesForAQuestion(
      interviewQuestion.questionId,
    );

    const results = await this.codeRunTestCaseResultRepository.getResultsForCodeRun(
      event.target.codeRunId,
    );

    /*
     * Do not complete the CodeRun until every visible
     * test case has produced a result.
     */
    if (results.length !== visibleTestCases.length) {
      return;
    }

    const executionFailed = results.some((result) => result.status === ExecutionStatus.FAILED);

    const finalCodeRunStatus = executionFailed ? ExecutionStatus.FAILED : ExecutionStatus.SUCCESS;

    await this.codeRunRepository.updateCodeRun(event.target.codeRunId, {
      status: finalCodeRunStatus,
    });

    /*
     * All test cases are finished.
     *
     * Notify every participant in the interview room
     * that the CodeRun itself has completed.
     */
    this.interviewRoom.broadcast(interviewQuestion.interviewId, {
      type: "CODE_RUN_COMPLETED",
      codeRunId: event.target.codeRunId,
      status: finalCodeRunStatus,
    });
  }
}
