import { SubmissionRepository } from "../repositories/submission.repository";
import { InterviewQuestionRepository } from "../repositories/interview-question.repository";
import { ParticipantRepository } from "../repositories/participant.repository";
import { TestCaseRepository } from "../repositories/testCase.repository";

import { CreateSubmissionData} from "../types/submission";

import { AppError } from "../../core/errors/app-error";
import { EvaluationStatus, ExecutionStatus, ParticipantRole } from "@interview-os/database";
import { RedisQueue } from "@interview-os/redis";
import { randomUUID } from "node:crypto";
import { ExecutionCompletedEvent, ExecutionJob } from "../types/codeRun";
import { SubmissionTestCaseResultRepository } from "../repositories/submission-testCase-result.repository";
import { EvaluationRepository } from "../repositories/evaluation.repository";

export class SubmissionService {
    constructor(
        private readonly submissionRepository = new SubmissionRepository,
        private readonly interviewQuestionRepository = new InterviewQuestionRepository,
        private readonly participantRepository = new ParticipantRepository,
        private readonly testCaseRepository = new TestCaseRepository,
        private readonly queue = new RedisQueue(),
        private readonly submissionTestCaseResultRepository = new SubmissionTestCaseResultRepository,
        private readonly evaluationRepository = new EvaluationRepository
    ) {}

    async createSubmission(
        interviewQuestionId: string,
        participantId: string,
        requesterId: string,
        data: CreateSubmissionData
    ) {
        const interviewQuestion =
            await this.interviewQuestionRepository.findById(
                interviewQuestionId
            );

        if (!interviewQuestion) {
            throw new AppError(
                "InterviewQuestion Not Found",
                404,
                "INTERVIEWQUESTION_NOT_FOUND"
            );
        }

        const participant =
            await this.participantRepository.findById(participantId);

        if (!participant) {
            throw new AppError(
                "Participant Not Found",
                404,
                "PARTICIPANT_NOT_FOUND"
            );
        }

        if (
            participant.role !== ParticipantRole.CANDIDATE ||
            participant.userId !== requesterId
        ) {
            throw new AppError(
                "Unauthorized",
                403,
                "UNAUTHORIZED"
            );
        }
        const testCases =
            await this.testCaseRepository.getAllTestCasesForAQuestion(
                interviewQuestion.questionId
            );

        if (testCases.length === 0) {
            throw new AppError(
                "No Test Cases Found",
                404,
                "NO_TEST_CASES_FOUND"
            );
        }

        const submission =
            await this.submissionRepository.createSubmission(
                interviewQuestionId,
                participantId,
                data
            );

        for (const testCase of testCases) {
            const job: ExecutionJob = {
                id: randomUUID(),
                target: {
                    type: "SUBMISSION",
                    submissionId: submission.id,
                },
                testCaseId: testCase.id,
                participantId: submission.participantId,
                interviewQuestionId: submission.interviewQuestionId,
                language: submission.language,
                sourceCode: submission.sourceCode,
                status: "QUEUED",
                input: testCase.input as string,
            };

            await this.queue.enqueue(job);
        }

        return submission;
    }

    async handleExecutionCompleted(event: ExecutionCompletedEvent){
        if (event.target.type !== "SUBMISSION"){
            throw new AppError(
                "Unsupported target",
                400,
                "UNSUPPORTED_TARGET"
            )
        }
        const submissionId = event.target.submissionId
        const submission = await this.submissionRepository.findById(submissionId)

        if(!submission){
            throw new AppError(
                "Submission Not Found",
                404,
                "SUBMISSION_NOT_FOUND"
            )
        }

        const interviewQuestionId = submission.interviewQuestionId
        const interviewQuestion = await this.interviewQuestionRepository.findById(interviewQuestionId)
        if(!interviewQuestion){
            throw new AppError(
                "InterviewQuestion Not Found",
                404,
                "INTERVIEWQUESTION_NOT_FOUND"
            )
        }

        const testCaseId = event.testCaseId
        const testCase = await this.testCaseRepository.findById(testCaseId)
        if(!testCase){
            throw new AppError(
                "TestCase Not Found",
                404,
                "TESTCASE_NOT_FOUND"
            )
        }
        if (testCase.questionId !== interviewQuestion.questionId) {
            throw new AppError(
                "Test Case Does Not Belong To Interview Question",
                400,
                "INVALID_TEST_CASE"
            );
        }

        const status =
            event.status === "SUCCESS"
                ? ExecutionStatus.SUCCESS
                : ExecutionStatus.FAILED;

        const passed =
            status === ExecutionStatus.SUCCESS &&
            event.stdout.trim() === testCase.expectedOutput.trim();


        await this.submissionTestCaseResultRepository.createSubmissionResult({
            submissionId: event.target.submissionId,
            testCaseId: event.testCaseId,
            status,
            passed,
            stdout: event.stdout,
            stderr: event.stderr,
            executionTimeMS: event.executionTimeMS,
        });

        const testCases =
            await this.testCaseRepository.getAllTestCasesForAQuestion(
                interviewQuestion.questionId
            );


        const results =
            await this.submissionTestCaseResultRepository
                .getResultsForSubmission(event.target.submissionId);
        

        if (results.length === testCases.length) {
            const existingEvaluation =
                await this.evaluationRepository.findBySubmissionId(
                    submissionId
                );

            if (existingEvaluation) {
                return;
            }

            const passedTests = results.filter(
                result => result.passed
            ).length;

            const totalTests = results.length;

            const score = Math.floor(
                interviewQuestion.points * passedTests / totalTests
            );

            const status =
                passedTests === totalTests
                    ? EvaluationStatus.PASSED
                    : EvaluationStatus.FAILED;

            const executionTimeMS = results.reduce(
                (total, result) => total + (result.executionTimeMS ?? 0),
                0
            );

            await this.evaluationRepository.createEvaluation({
                submissionId,
                status,
                score,
                passedTests,
                totalTests,
                executionTimeMS
            });
        }
    }

    async getSubmissionById(
        submissionId: string,
        requesterId: string
    ) {
        const submission =
            await this.submissionRepository.findById(submissionId);

        if (!submission) {
            throw new AppError(
                "Submission Not Found",
                404,
                "SUBMISSION_NOT_FOUND"
            );
        }

        const participant =
            await this.participantRepository.findById(
                submission.participantId
            );

        if (!participant) {
            throw new AppError(
                "No Participant Found",
                404,
                "NO_PARTICIPANT_FOUND"
            );
        }

        if (participant.userId !== requesterId) {
            throw new AppError(
                "Unauthorized",
                403,
                "UNAUTHORIZED"
            );
        }

        const results =
            await this.submissionTestCaseResultRepository
                .getResultsForSubmission(submissionId);

        const evaluation =
            await this.evaluationRepository
                .findBySubmissionId(submissionId);

        return {
            submission,
            results,
            evaluation
        };
    }
}