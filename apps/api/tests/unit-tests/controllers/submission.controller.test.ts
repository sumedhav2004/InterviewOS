import { beforeEach, describe, expect, it, vi } from "vitest";
import { SubmissionController } from "../../../src/controllers/submission.controller";

const { mockCreateSubmission, mockGetSubmissionById } = vi.hoisted(() => ({
  mockCreateSubmission: vi.fn(),
  mockGetSubmissionById: vi.fn(),
}));

vi.mock("../../../src/services/submission.service", () => ({
  SubmissionService: class {
    createSubmission = mockCreateSubmission;
    getSubmissionById = mockGetSubmissionById;
  },
}));

describe("SubmissionController", () => {
  let controller: SubmissionController;
  let req: any;
  let res: any;

  beforeEach(() => {
    vi.clearAllMocks();

    controller = new SubmissionController();

    req = {
      params: {},
      body: {},
      user: { id: "user-1" },
    };

    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
  });

  describe("createSubmission", () => {
    it("should create a submission and return status 201", async () => {
      const data = {
        code: "console.log('Hello, world!')",
        language: "javascript",
      };
      const submission = {
        id: "submission-1",
        status: "PENDING",
      };

      req.body = {
        interviewQuestionId: "interview-question-1",
        participantId: "participant-1",
        ...data,
      };
      mockCreateSubmission.mockResolvedValue(submission);

      await controller.createSubmission(req, res);

      expect(mockCreateSubmission).toHaveBeenCalledWith(
        "interview-question-1",
        "participant-1",
        "user-1",
        data,
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(submission);
    });

    it("should pass an empty data object when only IDs are provided", async () => {
      req.body = {
        interviewQuestionId: "interview-question-1",
        participantId: "participant-1",
      };
      mockCreateSubmission.mockResolvedValue({ id: "submission-1" });

      await controller.createSubmission(req, res);

      expect(mockCreateSubmission).toHaveBeenCalledWith(
        "interview-question-1",
        "participant-1",
        "user-1",
        {},
      );
    });

    it("should propagate service errors", async () => {
      req.body = {
        interviewQuestionId: "interview-question-1",
        participantId: "participant-1",
        code: "console.log('Hello')",
      };
      mockCreateSubmission.mockRejectedValue(new Error("Submission creation failed"));

      await expect(controller.createSubmission(req, res)).rejects.toThrow(
        "Submission creation failed",
      );
    });
  });

  describe("findById", () => {
    it("should return a submission with status 200", async () => {
      const submission = {
        id: "submission-1",
        status: "COMPLETED",
      };
      req.params.submissionId = "submission-1";
      mockGetSubmissionById.mockResolvedValue(submission);

      await controller.findById(req, res);

      expect(mockGetSubmissionById).toHaveBeenCalledWith("submission-1", "user-1");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(submission);
    });

    it("should return 400 when submissionId is not a string", async () => {
      req.params.submissionId = ["submission-1"];

      await controller.findById(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Invalid route parameter",
      });
      expect(mockGetSubmissionById).not.toHaveBeenCalled();
    });

    it("should propagate service errors", async () => {
      req.params.submissionId = "submission-1";
      mockGetSubmissionById.mockRejectedValue(new Error("Submission lookup failed"));

      await expect(controller.findById(req, res)).rejects.toThrow("Submission lookup failed");
    });
  });
});
