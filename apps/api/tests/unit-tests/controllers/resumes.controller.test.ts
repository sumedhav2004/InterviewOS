import { beforeEach, describe, expect, it, vi } from "vitest";
import { ResumeController } from "../../../src/controllers/resumes.controller";

describe("ResumeController", () => {
  let controller: ResumeController;
  let resumeService: {
    findByUserId: ReturnType<typeof vi.fn>;
    findById: ReturnType<typeof vi.fn>;
    deleteResume: ReturnType<typeof vi.fn>;
    updateResume: ReturnType<typeof vi.fn>;
    createResume: ReturnType<typeof vi.fn>;
  };
  let req: any;
  let res: any;

  beforeEach(() => {
    vi.clearAllMocks();

    resumeService = {
      findByUserId: vi.fn(),
      findById: vi.fn(),
      deleteResume: vi.fn(),
      updateResume: vi.fn(),
      createResume: vi.fn(),
    };

    controller = new ResumeController(resumeService as any);

    req = {
      params: {},
      body: {},
      user: { id: "user-1" },
    };

    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis(),
    };
  });

  describe("getResumes", () => {
    it("should return the user's resumes with status 200", async () => {
      const resumes = [
        { id: "resume-1", title: "Backend Developer" },
        { id: "resume-2", title: "Frontend Developer" },
      ];
      resumeService.findByUserId.mockResolvedValue(resumes);

      await controller.getResumes(req, res);

      expect(resumeService.findByUserId).toHaveBeenCalledWith("user-1");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(resumes);
    });

    it("should propagate service errors", async () => {
      resumeService.findByUserId.mockRejectedValue(new Error("Resume retrieval failed"));

      await expect(controller.getResumes(req, res)).rejects.toThrow("Resume retrieval failed");
    });
  });

  describe("getResume", () => {
    it("should return a resume with status 200", async () => {
      const resume = {
        id: "resume-1",
        title: "Backend Developer",
      };
      req.params.id = "resume-1";
      resumeService.findById.mockResolvedValue(resume);

      await controller.getResume(req, res);

      expect(resumeService.findById).toHaveBeenCalledWith("resume-1");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(resume);
    });

    it("should return 400 when id is not a string", async () => {
      req.params.id = ["resume-1"];

      await controller.getResume(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Invalid route parameter",
      });
      expect(resumeService.findById).not.toHaveBeenCalled();
    });

    it("should propagate service errors", async () => {
      req.params.id = "resume-1";
      resumeService.findById.mockRejectedValue(new Error("Resume lookup failed"));

      await expect(controller.getResume(req, res)).rejects.toThrow("Resume lookup failed");
    });
  });

  describe("deleteResume", () => {
    it("should delete a resume and return status 204", async () => {
      req.params.id = "resume-1";
      resumeService.deleteResume.mockResolvedValue(undefined);

      await controller.deleteResume(req, res);

      expect(resumeService.deleteResume).toHaveBeenCalledWith("resume-1", "user-1");
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });

    it("should return 400 when id is not a string", async () => {
      req.params.id = ["resume-1"];

      await controller.deleteResume(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Invalid route parameter",
      });
      expect(resumeService.deleteResume).not.toHaveBeenCalled();
    });

    it("should propagate service errors", async () => {
      req.params.id = "resume-1";
      resumeService.deleteResume.mockRejectedValue(new Error("Resume deletion failed"));

      await expect(controller.deleteResume(req, res)).rejects.toThrow("Resume deletion failed");
    });
  });

  describe("updateResume", () => {
    it("should update a resume and return status 200", async () => {
      const data = { title: "Updated Resume" };
      const updatedResume = { id: "resume-1", ...data };

      req.params.id = "resume-1";
      req.body = data;
      resumeService.updateResume.mockResolvedValue(updatedResume);

      await controller.updateResume(req, res);

      expect(resumeService.updateResume).toHaveBeenCalledWith("resume-1", "user-1", data);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(updatedResume);
    });

    it("should return 400 when id is not a string", async () => {
      req.params.id = ["resume-1"];

      await controller.updateResume(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Invalid route parameter",
      });
      expect(resumeService.updateResume).not.toHaveBeenCalled();
    });

    it("should propagate service errors", async () => {
      req.params.id = "resume-1";
      req.body = { title: "Updated Resume" };
      resumeService.updateResume.mockRejectedValue(new Error("Resume update failed"));

      await expect(controller.updateResume(req, res)).rejects.toThrow("Resume update failed");
    });
  });

  describe("createResume", () => {
    it("should create a resume and return status 201", async () => {
      const data = { title: "Backend Developer" };
      const createdResume = { id: "resume-1", ...data };

      req.body = data;
      resumeService.createResume.mockResolvedValue(createdResume);

      await controller.createResume(req, res);

      expect(resumeService.createResume).toHaveBeenCalledWith("user-1", data);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(createdResume);
    });

    it("should propagate service errors", async () => {
      req.body = { title: "Backend Developer" };
      resumeService.createResume.mockRejectedValue(new Error("Resume creation failed"));

      await expect(controller.createResume(req, res)).rejects.toThrow("Resume creation failed");
    });
  });
});
