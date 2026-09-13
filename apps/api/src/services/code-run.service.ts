import { CodeRunRepository } from "../repositories/code-run.repository";
import { InterviewQuestionRepository } from "../repositories/interview-question.repository";
import { ParticipantRepository } from "../repositories/participant.repository";
import { CreateCodeRunData, ExecutionCompletedEvent, ExecutionJob, UpdateCodeRunData } from "../types/codeRun";
import { AppError } from "../../core/errors/app-error"
import { ExecutionStatus, ParticipantRole } from "@interview-os/database";
import { TestCaseRepository } from "../repositories/testCase.repository";
import { RedisQueue } from "@interview-os/redis";
import { randomUUID } from "node:crypto";
import { CodeRunTestCaseResultRepository } from "../repositories/code-run-testCase-result.repository";

export class CodeRunService{
    constructor(
        private readonly codeRunRepository = new CodeRunRepository,
        private readonly interviewQuestionRepository = new InterviewQuestionRepository,
        private readonly participantRepository = new ParticipantRepository,
        private readonly testCaseRepository = new TestCaseRepository,
        private readonly codeRunTestCaseResultRepository = new CodeRunTestCaseResultRepository
    ){}

    async createCodeRun(interviewQuestionId:string, participantId:string, requesterId:string, data:CreateCodeRunData){
        const interviewQuestion = await this.interviewQuestionRepository.findById(interviewQuestionId)
        if(!interviewQuestion){
            throw new AppError(
                "InterviewQuestion Not Found",
                404,
                "INTERVIEWQUESTION_NOT_FOUND"
            )
        }

        const participant = await this.participantRepository.findById(participantId)

        if(!participant){
            throw new AppError(
                "Participant Not Found",
                404,
                "PARTICIPANT_NOT_FOUND"
            )
        }
        if(participant.role !== ParticipantRole.CANDIDATE){
            throw new AppError(
                "Unauthorized",
                403,
                "UNAUTHORIZED"
            )
        }
        if(participant.userId !== requesterId){
            throw new AppError(
                "Unauthorized",
                403,
                "UNAUTHORIZED"
            )
        }

        return this.codeRunRepository.createCodeRun(interviewQuestionId,participantId,data)
    }

    async updateCodeRun(
        id: string,
        participantId: string,
        requesterId:string,
        data: UpdateCodeRunData
    ) {
        const codeRun = await this.codeRunRepository.findById(id);

        if (!codeRun) {
            throw new AppError(
                "CodeRun Not Found",
                404,
                "CODERUN_NOT_FOUND"
            );
        }

        if (codeRun.participantId !== participantId) {
            throw new AppError(
                "Unauthorized",
                403,
                "UNAUTHORIZED"
            );
        }

        const participant = await this.participantRepository.findById(participantId)

        if(!participant){
            throw new AppError(
                "Participant Not Found",
                404,
                "PARTICIPANT_NOT_FOUND"
            )
        }
        if(participant.role !== ParticipantRole.CANDIDATE){
            throw new AppError(
                "Unauthorized",
                403,
                "UNAUTHORIZED"
            )
        }
        if(participant.userId !== requesterId){
            throw new AppError(
                "Unauthorized",
                403,
                "UNAUTHORIZED"
            )
        }

        return this.codeRunRepository.updateCodeRun(id, data);
    }

    async executeCodeRun(id:string, requesterId:string){
        const codeRun = await this.codeRunRepository.findById(id)
        if(!codeRun){
            throw new AppError(
                "Corresponding Code-Run Doesn't Exist",
                404,
                "CORRESPONDING_CODERUN_NOT_EXIST"
            )
        }

        const participant = await this.participantRepository.findById(
            codeRun.participantId
        );
        if (
            !participant ||
            participant.userId !== requesterId ||
            participant.role !== ParticipantRole.CANDIDATE
        ) {
            throw new AppError(
                "Unauthorized",
                403,
                "UNAUTHORIZED"
            );
        }

        const interviewQuestion =
            await this.interviewQuestionRepository.findById(
                codeRun.interviewQuestionId
            );

        if (!interviewQuestion) {
            throw new AppError(
                "InterviewQuestion Not Found",
                404,
                "INTERVIEWQUESTION_NOT_FOUND"
            );
        }

        if (codeRun.language !== "PYTHON" &&
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
                "LANGUAGE_NOT_SUPPORTED"
            );
        }
        
        const visibleTestCases = await this.testCaseRepository.getVisibleTestCasesForAQuestion(interviewQuestion.questionId)
        if(visibleTestCases.length === 0){
            throw new AppError(
                "No Test Cases Found",
                404,
                "NO_TEST_CASES_FOUND"
            )
        }

        const queue = new RedisQueue()

        for (const testCase of visibleTestCases) {
            const job: ExecutionJob = {
                id: randomUUID(),
                codeRunId: codeRun.id,
                testCaseId: testCase.id,
                participantId: codeRun.participantId,
                interviewQuestionId: codeRun.interviewQuestionId,
                language: codeRun.language,
                sourceCode: codeRun.sourceCode,
                status: "QUEUED",
                input: testCase.input as string,
            };

            await queue.enqueue(job);
        }
        await this.codeRunRepository.updateCodeRun(id, {
            status: ExecutionStatus.RUNNING
        });
    }

    async handleExecutionCompleted(event: ExecutionCompletedEvent) {
        const codeRun = await this.codeRunRepository.findById(event.codeRunId);

        if (!codeRun) {
            throw new AppError(
                "Corresponding Code-Run Doesn't Exist",
                404,
                "CORRESPONDING_CODERUN_NOT_EXIST"
            );
        }
        const interviewQuestion =
            await this.interviewQuestionRepository.findById(
                codeRun.interviewQuestionId
            );

        if (!interviewQuestion) {
            throw new AppError(
                "InterviewQuestion Not Found",
                404,
                "INTERVIEWQUESTION_NOT_FOUND"
            );
        }

        const testCase = await this.testCaseRepository.findById(event.testCaseId);

        if (!testCase) {
            throw new AppError(
                "Test Case Not Found",
                404,
                "TEST_CASE_NOT_FOUND"
            );
        }

        const status =
            event.status === "SUCCESS"
                ? ExecutionStatus.SUCCESS
                : ExecutionStatus.FAILED;

        if (typeof testCase.expectedOutput !== "string") {
            throw new AppError(
                "Test Case Expected Output Must Be A String",
                500,
                "INVALID_TEST_CASE_EXPECTED_OUTPUT"
            );
        }

        const passed =
            status === ExecutionStatus.SUCCESS &&
            event.stdout.trim() === testCase.expectedOutput.trim();

        await this.codeRunTestCaseResultRepository.createResult({
            codeRunId: event.codeRunId,
            testCaseId: event.testCaseId,
            status,
            passed,
            stdout: event.stdout,
            stderr: event.stderr,
            executionTimeMS: event.executionTimeMS,
        });

        const visibleTestCases =
            await this.testCaseRepository.getVisibleTestCasesForAQuestion(
                interviewQuestion.questionId
            );

        const results =
            await this.codeRunTestCaseResultRepository.getResultsForCodeRun(
                event.codeRunId
            );

        if (results.length === visibleTestCases.length) {
            const executionFailed = results.some(
                result => result.status === ExecutionStatus.FAILED
            );

            await this.codeRunRepository.updateCodeRun(
                event.codeRunId,
                {
                    status: executionFailed
                        ? ExecutionStatus.FAILED
                        : ExecutionStatus.SUCCESS
                }
            );
        }
        
    }
}