
import { Request, Response } from "express";
import { TestCaseService } from "../services/testCase.service";
import { getRequiredRouteParam } from "../utils/route-params";

export class TestCaseController {
    constructor(
        private readonly testCaseService = new TestCaseService(),
    ) {}

    async findById(req: Request, res: Response) {
        const testCaseId = getRequiredRouteParam(
            req.params.testCaseId,
            "testCaseId",
        );

        const questionId = getRequiredRouteParam(
            req.params.questionId,
            "questionId",
        );

        const requesterId = req.user.id;

        const testCase = await this.testCaseService.findById(
            testCaseId,
            requesterId,
            questionId,
        );

        return res.status(200).json(testCase);
    }

    async findAllTestCasesForAQuestion(req: Request, res: Response) {
        const questionId = getRequiredRouteParam(
            req.params.questionId,
            "questionId",
        );

        const requesterId = req.user.id;

        const testCases =
            await this.testCaseService.findAllTestCasesForAQuestion(
                questionId,
            );

        return res.status(200).json(testCases);
    }

    async findAllVisibleTestCasesForAQuestion(req: Request, res: Response) {
        const questionId = getRequiredRouteParam(
            req.params.questionId,
            "questionId",
        );

        const visibleTestCases =
            await this.testCaseService.findVisibleTestCasesForAQuestion(
                questionId,
            );

        return res.status(200).json(visibleTestCases);
    }

    async createTestCase(req: Request, res: Response) {
        const questionId = getRequiredRouteParam(
            req.params.questionId,
            "questionId",
        );

        const requesterId = req.user.id;

        const createdTestCase = await this.testCaseService.createTestCase(
            questionId,
            requesterId,
            req.body,
        );

        return res.status(201).json(createdTestCase);
    }

    async updateTestCase(req: Request, res: Response) {
        const questionId = getRequiredRouteParam(
            req.params.questionId,
            "questionId",
        );

        const testCaseId = getRequiredRouteParam(
            req.params.testCaseId,
            "testCaseId",
        );

        const requesterId = req.user.id;

        const updatedTestCase = await this.testCaseService.updateTestCase(
            testCaseId,
            questionId,
            requesterId,
            req.body,
        );

        return res.status(200).json(updatedTestCase);
    }

    async deleteTestCase(req: Request, res: Response) {
        const questionId = getRequiredRouteParam(
            req.params.questionId,
            "questionId",
        );

        const testCaseId = getRequiredRouteParam(
            req.params.testCaseId,
            "testCaseId",
        );

        const requesterId = req.user.id;

        await this.testCaseService.deleteTestCase(
            testCaseId,
            questionId,
            requesterId,
        );

        return res.sendStatus(204);
    }
}
