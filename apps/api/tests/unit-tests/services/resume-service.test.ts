import { beforeEach, describe, expect, it, vi } from "vitest";
import { ResumeService } from "../../../src/services/resume.service";

describe("ResumeService", () => {
  let service: ResumeService;
  let resumeRepository: {
    createResume: ReturnType<typeof vi.fn>;
    findById: ReturnType<typeof vi.fn>;
    updateResume: ReturnType<typeof vi.fn>;
    deleteResume: ReturnType<typeof vi.fn>;
    findByUserId: ReturnType<typeof vi.fn>;
  };

  const resume = {
    id: "resume-1",
    userId: "user-1",
    fileUrl: "https://example.com/resume.pdf",
  };

  const resumeData = {
    fileUrl: "https://example.com/resume.pdf",
  };

  beforeEach(() => {
    resumeRepository = {
      createResume: vi.fn(),
      findById: vi.fn(),
      updateResume: vi.fn(),
      deleteResume: vi.fn(),
      findByUserId: vi.fn(),
    };

    service = new ResumeService(resumeRepository as any);
  });

  describe("createResume", () => {
    it("creates and returns a resume", async () => {
      resumeRepository.createResume.mockResolvedValue(resume);

      await expect(service.createResume("user-1", resumeData as any)).resolves.toEqual(resume);

      expect(resumeRepository.createResume).toHaveBeenCalledWith("user-1", resumeData);
      expect(resumeRepository.createResume).toHaveBeenCalledTimes(1);
    });

    it("propagates repository errors", async () => {
      const error = new Error("Database error");
      resumeRepository.createResume.mockRejectedValue(error);

      await expect(service.createResume("user-1", resumeData as any)).rejects.toBe(error);
    });
  });

  describe("updateResume", () => {
    const updateData = {
      fileUrl: "https://example.com/updated-resume.pdf",
    };

    it("updates a resume owned by the user", async () => {
      const updatedResume = { ...resume, ...updateData };
      resumeRepository.findById.mockResolvedValue(resume);
      resumeRepository.updateResume.mockResolvedValue(updatedResume);

      await expect(service.updateResume("resume-1", "user-1", updateData as any)).resolves.toEqual(
        updatedResume,
      );

      expect(resumeRepository.findById).toHaveBeenCalledWith("resume-1");
      expect(resumeRepository.updateResume).toHaveBeenCalledWith("resume-1", updateData);
    });

    it("throws RESUME_NOT_FOUND when the resume does not exist", async () => {
      resumeRepository.findById.mockResolvedValue(null);

      await expect(
        service.updateResume("missing-resume", "user-1", updateData as any),
      ).rejects.toMatchObject({
        statusCode: 404,
        code: "RESUME_NOT_FOUND",
      });

      expect(resumeRepository.updateResume).not.toHaveBeenCalled();
    });

    it("throws UNAUTHORIZED when the resume belongs to another user", async () => {
      resumeRepository.findById.mockResolvedValue(resume);

      await expect(
        service.updateResume("resume-1", "other-user", updateData as any),
      ).rejects.toMatchObject({
        statusCode: 403,
        code: "UNAUTHORIZED",
      });

      expect(resumeRepository.updateResume).not.toHaveBeenCalled();
    });

    it("propagates errors from the repository lookup", async () => {
      const error = new Error("Database error");
      resumeRepository.findById.mockRejectedValue(error);

      await expect(service.updateResume("resume-1", "user-1", updateData as any)).rejects.toBe(
        error,
      );

      expect(resumeRepository.updateResume).not.toHaveBeenCalled();
    });

    it("propagates errors from the repository update", async () => {
      resumeRepository.findById.mockResolvedValue(resume);
      const error = new Error("Update failed");
      resumeRepository.updateResume.mockRejectedValue(error);

      await expect(service.updateResume("resume-1", "user-1", updateData as any)).rejects.toBe(
        error,
      );
    });
  });

  describe("deleteResume", () => {
    it("deletes a resume owned by the user", async () => {
      resumeRepository.findById.mockResolvedValue(resume);
      resumeRepository.deleteResume.mockResolvedValue(resume);

      await expect(service.deleteResume("resume-1", "user-1")).resolves.toEqual(resume);

      expect(resumeRepository.findById).toHaveBeenCalledWith("resume-1");
      expect(resumeRepository.deleteResume).toHaveBeenCalledWith("resume-1");
    });

    it("throws RESUME_NOT_FOUND when the resume does not exist", async () => {
      resumeRepository.findById.mockResolvedValue(null);

      await expect(service.deleteResume("missing-resume", "user-1")).rejects.toMatchObject({
        statusCode: 404,
        code: "RESUME_NOT_FOUND",
      });

      expect(resumeRepository.deleteResume).not.toHaveBeenCalled();
    });

    it("throws UNAUTHORIZED when the resume belongs to another user", async () => {
      resumeRepository.findById.mockResolvedValue(resume);

      await expect(service.deleteResume("resume-1", "other-user")).rejects.toMatchObject({
        statusCode: 403,
        code: "UNAUTHORIZED",
      });

      expect(resumeRepository.deleteResume).not.toHaveBeenCalled();
    });

    it("propagates errors from the repository lookup", async () => {
      const error = new Error("Database error");
      resumeRepository.findById.mockRejectedValue(error);

      await expect(service.deleteResume("resume-1", "user-1")).rejects.toBe(error);

      expect(resumeRepository.deleteResume).not.toHaveBeenCalled();
    });

    it("propagates errors from the repository deletion", async () => {
      resumeRepository.findById.mockResolvedValue(resume);
      const error = new Error("Delete failed");
      resumeRepository.deleteResume.mockRejectedValue(error);

      await expect(service.deleteResume("resume-1", "user-1")).rejects.toBe(error);
    });
  });

  describe("findById", () => {
    it("returns the resume when found", async () => {
      resumeRepository.findById.mockResolvedValue(resume);

      await expect(service.findById("resume-1")).resolves.toEqual(resume);

      expect(resumeRepository.findById).toHaveBeenCalledWith("resume-1");
    });

    it("returns null when the resume does not exist", async () => {
      resumeRepository.findById.mockResolvedValue(null);

      await expect(service.findById("missing-resume")).resolves.toBeNull();
    });

    it("propagates repository errors", async () => {
      const error = new Error("Database error");
      resumeRepository.findById.mockRejectedValue(error);

      await expect(service.findById("resume-1")).rejects.toBe(error);
    });
  });

  describe("findByUserId", () => {
    it("returns resumes belonging to the user", async () => {
      const resumes = [resume, { ...resume, id: "resume-2" }];
      resumeRepository.findByUserId.mockResolvedValue(resumes);

      await expect(service.findByUserId("user-1")).resolves.toEqual(resumes);

      expect(resumeRepository.findByUserId).toHaveBeenCalledWith("user-1");
    });

    it("returns an empty array when the user has no resumes", async () => {
      resumeRepository.findByUserId.mockResolvedValue([]);

      await expect(service.findByUserId("user-1")).resolves.toEqual([]);
    });

    it("propagates repository errors", async () => {
      const error = new Error("Database error");
      resumeRepository.findByUserId.mockRejectedValue(error);

      await expect(service.findByUserId("user-1")).rejects.toBe(error);
    });
  });
});
