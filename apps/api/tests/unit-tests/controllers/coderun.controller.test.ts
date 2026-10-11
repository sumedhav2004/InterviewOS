
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CodeRunController } from "../../../src/controllers/code-run.controller";

const { mockCreateCodeRun, mockGetCodeRunResults, mockUpdateCodeRun, mockExecuteCodeRun } =
    vi.hoisted(() => ({
        mockCreateCodeRun: vi.fn(),
        mockGetCodeRunResults: vi.fn(),
        mockUpdateCodeRun: vi.fn(),
        mockExecuteCodeRun: vi.fn(),
    }));

vi.mock("../../../src/services/code-run.service", () => ({
    CodeRunService: class {
        createCodeRun = mockCreateCodeRun;
        getCodeRunResults = mockGetCodeRunResults;
        updateCodeRun = mockUpdateCodeRun;
        executeCodeRun = mockExecuteCodeRun;
    },
}));

describe("CodeRunController", () => {
    let controller: CodeRunController;
    let req: any;
    let res: any;

    beforeEach(() => {
        vi.clearAllMocks();

        controller = new CodeRunController({} as any);

        req = {
            body: {},
            params: {},
            user: { id: "user-1" },
        };

        res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn().mockReturnThis(),
        };
    });

    describe("createCodeRun", () => {
        it("should create a code run and return 201", async () => {
            const data = {
                language: "javascript",
                code: "console.log('hello')",
            };
            const createdCodeRun = {
                id: "code-run-1",
                ...data,
            };

            req.body = {
                interviewQuestionId: "interview-question-1",
                participantId: "participant-1",
                ...data,
            };

            mockCreateCodeRun.mockResolvedValue(createdCodeRun);

            await controller.createCodeRun(req, res);

            expect(mockCreateCodeRun).toHaveBeenCalledWith(
                "interview-question-1",
                "participant-1",
                "user-1",
                data,
            );
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(createdCodeRun);
        });

        it("should propagate service errors", async () => {
            req.body = {
                interviewQuestionId: "interview-question-1",
                participantId: "participant-1",
                code: "invalid code",
            };

            mockCreateCodeRun.mockRejectedValue(new Error("Creation failed"));

            await expect(
                controller.createCodeRun(req, res),
            ).rejects.toThrow("Creation failed");

            expect(res.status).not.toHaveBeenCalled();
        });
    });

    describe("getCodeRunResults", () => {
        it("should return code run results with status 200", async () => {
            const result = {
                id: "code-run-1",
                output: "hello",
                status: "SUCCESS",
            };

            req.params.id = "code-run-1";
            mockGetCodeRunResults.mockResolvedValue(result);

            await controller.getCodeRunResults(req, res);

            expect(mockGetCodeRunResults).toHaveBeenCalledWith(
                "code-run-1",
                "user-1",
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(result);
        });

        it("should return 400 when the route parameter is not a string", async () => {
            req.params.id = ["code-run-1"];

            await controller.getCodeRunResults(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: "Invalid route parameter",
            });
            expect(mockGetCodeRunResults).not.toHaveBeenCalled();
        });

        it("should propagate service errors", async () => {
            req.params.id = "code-run-1";
            mockGetCodeRunResults.mockRejectedValue(
                new Error("Could not fetch results"),
            );

            await expect(
                controller.getCodeRunResults(req, res),
            ).rejects.toThrow("Could not fetch results");

            expect(res.status).not.toHaveBeenCalled();
        });
    });

    describe("updateCodeRun", () => {
        it("should update a code run and return 200", async () => {
            const data = {
                code: "console.log('updated')",
                language: "javascript",
            };
            const updatedCodeRun = {
                id: "code-run-1",
                ...data,
            };

            req.params.id = "code-run-1";
            req.body = {
                interviewQuestionId: "interview-question-1",
                participantId: "participant-1",
                ...data,
            };

            mockUpdateCodeRun.mockResolvedValue(updatedCodeRun);

            await controller.updateCodeRun(req, res);

            expect(mockUpdateCodeRun).toHaveBeenCalledWith(
                "code-run-1",
                "participant-1",
                "user-1",
                data,
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(updatedCodeRun);
        });

        it("should return 400 when the route parameter is not a string", async () => {
            req.params.id = ["code-run-1"];

            await controller.updateCodeRun(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: "Invalid route parameter",
            });
            expect(mockUpdateCodeRun).not.toHaveBeenCalled();
        });

        it("should propagate service errors", async () => {
            req.params.id = "code-run-1";
            req.body = {
                participantId: "participant-1",
                code: "updated code",
            };

            mockUpdateCodeRun.mockRejectedValue(new Error("Update failed"));

            await expect(
                controller.updateCodeRun(req, res),
            ).rejects.toThrow("Update failed");

            expect(res.status).not.toHaveBeenCalled();
        });
    });

    describe("executeCodeRun", () => {
        it("should execute a code run and return 202", async () => {
            const result = {
                id: "code-run-1",
                status: "QUEUED",
            };

            req.params.id = "code-run-1";
            mockExecuteCodeRun.mockResolvedValue(result);

            await controller.executeCodeRun(req, res);

            expect(mockExecuteCodeRun).toHaveBeenCalledWith(
                "code-run-1",
                "user-1",
            );
            expect(res.status).toHaveBeenCalledWith(202);
            expect(res.json).toHaveBeenCalledWith(result);
        });

        it("should return 400 when the route parameter is not a string", async () => {
            req.params.id = ["code-run-1"];

            await controller.executeCodeRun(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: "Invalid route parameter",
            });
            expect(mockExecuteCodeRun).not.toHaveBeenCalled();
        });

        it("should propagate service errors", async () => {
            req.params.id = "code-run-1";
            mockExecuteCodeRun.mockRejectedValue(
                new Error("Execution failed"),
            );

            await expect(
                controller.executeCodeRun(req, res),
            ).rejects.toThrow("Execution failed");

            expect(res.status).not.toHaveBeenCalled();
        });
    });
});
