import { beforeEach, describe, expect, it, vi } from "vitest";
import { InterviewController } from "../../../src/controllers/interview.controller";

const {
  mockFindInterviewById,
  mockFindAllInterviewsByUserId,
  mockCreateInterview,
  mockDeleteInterview,
  mockUpdateInterview,
  mockScheduleInterview,
  mockStartInterview,
  mockCompleteInterview,
  mockCancelInterview,
} = vi.hoisted(() => ({
  mockFindInterviewById: vi.fn(),
  mockFindAllInterviewsByUserId: vi.fn(),
  mockCreateInterview: vi.fn(),
  mockDeleteInterview: vi.fn(),
  mockUpdateInterview: vi.fn(),
  mockScheduleInterview: vi.fn(),
  mockStartInterview: vi.fn(),
  mockCompleteInterview: vi.fn(),
  mockCancelInterview: vi.fn(),
}));

vi.mock("../../../src/services/interview.service", () => ({
  InterviewService: class {
    findInterviewById = mockFindInterviewById;
    findAllInterviewsByUserId = mockFindAllInterviewsByUserId;
    createInterview = mockCreateInterview;
    deleteInterview = mockDeleteInterview;
    updateInterview = mockUpdateInterview;
    scheduleInterview = mockScheduleInterview;
    startInterview = mockStartInterview;
    completeInterview = mockCompleteInterview;
    cancelInterview = mockCancelInterview;
  },
}));

describe("InterviewController", () => {
  let controller: InterviewController;
  let req: any;
  let res: any;

  beforeEach(() => {
    vi.clearAllMocks();

    controller = new InterviewController();

    req = {
      params: {},
      body: {},
      user: { id: "user-1" },
    };

    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      sendStatus: vi.fn().mockReturnThis(),
    };
  });

  describe("findInterviewById", () => {
    it("should return an interview with status 200", async () => {
      const interview = { id: "interview-1", title: "Mock Interview" };
      req.params.id = "interview-1";
      mockFindInterviewById.mockResolvedValue(interview);

      await controller.findInterviewById(req, res);

      expect(mockFindInterviewById).toHaveBeenCalledWith("interview-1", "user-1");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(interview);
    });

    it("should return 400 when the route parameter is not a string", async () => {
      req.params.id = ["interview-1"];

      await controller.findInterviewById(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Invalid route parameter",
      });
      expect(mockFindInterviewById).not.toHaveBeenCalled();
    });

    it("should propagate service errors", async () => {
      req.params.id = "interview-1";
      mockFindInterviewById.mockRejectedValue(new Error("Lookup failed"));

      await expect(controller.findInterviewById(req, res)).rejects.toThrow("Lookup failed");
    });
  });

  describe("findAllInterviewsByUserId", () => {
    it("should return the user's interviews with status 200", async () => {
      const interviews = [{ id: "interview-1" }, { id: "interview-2" }];
      mockFindAllInterviewsByUserId.mockResolvedValue(interviews);

      await controller.findAllInterviewsByUserId(req, res);

      expect(mockFindAllInterviewsByUserId).toHaveBeenCalledWith("user-1");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(interviews);
    });

    it("should propagate service errors", async () => {
      mockFindAllInterviewsByUserId.mockRejectedValue(new Error("Lookup failed"));

      await expect(controller.findAllInterviewsByUserId(req, res)).rejects.toThrow("Lookup failed");
    });
  });

  describe("createInterview", () => {
    it("should create an interview and return 201", async () => {
      const data = { title: "Mock Interview" };
      const interview = { id: "interview-1", ...data };
      req.body = data;
      mockCreateInterview.mockResolvedValue(interview);

      await controller.createInterview(req, res);

      expect(mockCreateInterview).toHaveBeenCalledWith("user-1", data);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(interview);
    });

    it("should propagate service errors", async () => {
      req.body = { title: "Mock Interview" };
      mockCreateInterview.mockRejectedValue(new Error("Creation failed"));

      await expect(controller.createInterview(req, res)).rejects.toThrow("Creation failed");
    });
  });

  describe("deleteInterview", () => {
    it("should delete an interview and return 204", async () => {
      req.params.id = "interview-1";
      mockDeleteInterview.mockResolvedValue(undefined);

      await controller.deleteInterview(req, res);

      expect(mockDeleteInterview).toHaveBeenCalledWith("interview-1", "user-1");
      expect(res.sendStatus).toHaveBeenCalledWith(204);
    });

    it("should return 400 when the route parameter is not a string", async () => {
      req.params.id = ["interview-1"];

      await controller.deleteInterview(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Invalid route parameter",
      });
      expect(mockDeleteInterview).not.toHaveBeenCalled();
    });

    it("should propagate service errors", async () => {
      req.params.id = "interview-1";
      mockDeleteInterview.mockRejectedValue(new Error("Deletion failed"));

      await expect(controller.deleteInterview(req, res)).rejects.toThrow("Deletion failed");
    });
  });

  describe("updateInterview", () => {
    it("should update an interview and return 200", async () => {
      const data = { title: "Updated Interview" };
      const updatedInterview = { id: "interview-1", ...data };
      req.params.id = "interview-1";
      req.body = data;
      mockUpdateInterview.mockResolvedValue(updatedInterview);

      await controller.updateInterview(req, res);

      expect(mockUpdateInterview).toHaveBeenCalledWith("interview-1", "user-1", data);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(updatedInterview);
    });

    it("should return 400 when the route parameter is not a string", async () => {
      req.params.id = ["interview-1"];

      await controller.updateInterview(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Invalid route parameter",
      });
      expect(mockUpdateInterview).not.toHaveBeenCalled();
    });

    it("should propagate service errors", async () => {
      req.params.id = "interview-1";
      req.body = { title: "Updated Interview" };
      mockUpdateInterview.mockRejectedValue(new Error("Update failed"));

      await expect(controller.updateInterview(req, res)).rejects.toThrow("Update failed");
    });
  });

  describe("scheduleInterview", () => {
    it("should schedule an interview and return 200", async () => {
      const data = { scheduledAt: "2026-11-01T10:00:00.000Z" };
      const scheduledInterview = {
        id: "interview-1",
        status: "SCHEDULED",
      };
      req.params.id = "interview-1";
      req.body = data;
      mockScheduleInterview.mockResolvedValue(scheduledInterview);

      await controller.scheduleInterview(req, res);

      expect(mockScheduleInterview).toHaveBeenCalledWith("user-1", "interview-1", data);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(scheduledInterview);
    });

    it("should return 400 when the route parameter is not a string", async () => {
      req.params.id = ["interview-1"];

      await controller.scheduleInterview(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Invalid route parameter",
      });
      expect(mockScheduleInterview).not.toHaveBeenCalled();
    });

    it("should propagate service errors", async () => {
      req.params.id = "interview-1";
      req.body = {};
      mockScheduleInterview.mockRejectedValue(new Error("Scheduling failed"));

      await expect(controller.scheduleInterview(req, res)).rejects.toThrow("Scheduling failed");
    });
  });

  describe("startInterview", () => {
    it("should start an interview and return 200", async () => {
      const interview = { id: "interview-1", status: "IN_PROGRESS" };
      req.params.id = "interview-1";
      mockStartInterview.mockResolvedValue(interview);

      await controller.startInterview(req, res);

      expect(mockStartInterview).toHaveBeenCalledWith("user-1", "interview-1");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(interview);
    });

    it("should return 400 when the route parameter is not a string", async () => {
      req.params.id = ["interview-1"];

      await controller.startInterview(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Invalid route parameter",
      });
      expect(mockStartInterview).not.toHaveBeenCalled();
    });

    it("should propagate service errors", async () => {
      req.params.id = "interview-1";
      mockStartInterview.mockRejectedValue(new Error("Start failed"));

      await expect(controller.startInterview(req, res)).rejects.toThrow("Start failed");
    });
  });

  describe("completeInterview", () => {
    it("should complete an interview and return 200", async () => {
      const interview = { id: "interview-1", status: "COMPLETED" };
      req.params.id = "interview-1";
      mockCompleteInterview.mockResolvedValue(interview);

      await controller.completeInterview(req, res);

      expect(mockCompleteInterview).toHaveBeenCalledWith("user-1", "interview-1");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(interview);
    });

    it("should return 400 when the route parameter is not a string", async () => {
      req.params.id = ["interview-1"];

      await controller.completeInterview(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Invalid route parameter",
      });
      expect(mockCompleteInterview).not.toHaveBeenCalled();
    });

    it("should propagate service errors", async () => {
      req.params.id = "interview-1";
      mockCompleteInterview.mockRejectedValue(new Error("Completion failed"));

      await expect(controller.completeInterview(req, res)).rejects.toThrow("Completion failed");
    });
  });

  describe("cancelInterview", () => {
    it("should cancel an interview and return 200", async () => {
      const interview = { id: "interview-1", status: "CANCELLED" };
      req.params.id = "interview-1";
      mockCancelInterview.mockResolvedValue(interview);

      await controller.cancelInterview(req, res);

      expect(mockCancelInterview).toHaveBeenCalledWith("user-1", "interview-1");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(interview);
    });

    it("should return 400 when the route parameter is not a string", async () => {
      req.params.id = ["interview-1"];

      await controller.cancelInterview(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Invalid route parameter",
      });
      expect(mockCancelInterview).not.toHaveBeenCalled();
    });

    it("should propagate service errors", async () => {
      req.params.id = "interview-1";
      mockCancelInterview.mockRejectedValue(new Error("Cancellation failed"));

      await expect(controller.cancelInterview(req, res)).rejects.toThrow("Cancellation failed");
    });
  });
});
