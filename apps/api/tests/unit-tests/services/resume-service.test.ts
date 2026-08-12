import { beforeEach, describe, expect, it, vi } from "vitest";
import { ResumeService } from "../../../src/services/resume.service";

describe("ResumeService", () => {
  const mockRepository = {
    createResume: vi.fn(),
    findById: vi.fn(),
    findByUserId: vi.fn(),
    updateResume: vi.fn(),
    deleteResume: vi.fn(),
  };

  let service: ResumeService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new ResumeService(mockRepository as any);
  });

  describe("Resume Service", () => {
    describe("Create Resume", () => {
        it("should create a resume", async () => {
        const data = {
            title: "Backend_Resume",
            fileUrl: "my_backend_resume.com",
        };

        const userId = "user-1";

        const createdResume = {
            id: "resume-1",
            ...data,
            userId,
        };

        mockRepository.createResume.mockResolvedValue(createdResume);

        const result = await service.createResume(userId, data);

        expect(mockRepository.createResume).toHaveBeenCalledWith(userId, data);
        expect(result).toEqual(createdResume);
        });
    })

    describe("Update Resume", () => {
        it("should update a resume", async () => {
            const data ={
                title: "updatedTitle",
                fileUrl: "updatedURL.com",
            }

            const userId = "user-1";
            const id = "resume-1"
            const resume = {
                title: "title",
                fileUrl: "myResume.com",
                id,
                userId,
            }
            const updatedResume = {
                title: "updatedTitle",
                fileUrl: "updatedURL.com",
                userId,
                id
            }
          
            mockRepository.findById.mockResolvedValue(resume);
            mockRepository.updateResume.mockResolvedValue(updatedResume);

            const upResume = await service.updateResume( id, userId, data)

            expect(mockRepository.findById).toHaveBeenCalledOnce();
            expect(mockRepository.findById).toHaveBeenCalledWith(id);
            expect(mockRepository.updateResume).toHaveBeenCalledOnce()
            expect(mockRepository.updateResume).toHaveBeenCalledWith(id, data)

            expect(upResume).toEqual(updatedResume);
        })

        it("should produce error when resume doesnt exist", async()=> {
            const id = "resume-1"
            const userId = "user-1"

            mockRepository.findById.mockResolvedValue(null)

            await expect(service.updateResume(id, userId, {
                title: "updatedResume",
                fileUrl: "updatedUrl.com"
            })).rejects.toMatchObject({
                message: "Resume not found",
                statusCode: 404,
                code: "RESUME_NOT_FOUND",
            })

            expect(mockRepository.updateResume).not.toHaveBeenCalled();
        })

        it("should produce error when the user is not authorized to update", async() => {
            const id = "resume-1"
            const userId = "user-1"

            mockRepository.findById.mockResolvedValue({
                title: "BackendResume",
                fileUrl: "backendResume.com",
                userId: "different-user",
                id,
            })

            await expect(service.updateResume(id, userId, {
                title: "ypdatedtitle",
                fileUrl: "updatedUrl.com"
            })).rejects.toMatchObject({
                message: "Unauthorized",
                statusCode: 403,
                code: "UNAUTHORIZED",
            })

            expect(mockRepository.updateResume).not.toHaveBeenCalled();
        })
    })

    describe("deleteResume", () => {
        it("should delete an existing resume", async () => {
            const id = "resume-1";
            const userId = "user-1";

            const resume = {
            id,
            userId,
            title: "Backend Resume",
            fileUrl: "resume.pdf",
            };

            mockRepository.findById.mockResolvedValue(resume);
            mockRepository.deleteResume.mockResolvedValue(undefined);

            const result = await service.deleteResume(id, userId);

            expect(mockRepository.findById).toHaveBeenCalledOnce();
            expect(mockRepository.findById).toHaveBeenCalledWith(id);

            expect(mockRepository.deleteResume).toHaveBeenCalledOnce();
            expect(mockRepository.deleteResume).toHaveBeenCalledWith(id);

            expect(result).toBeUndefined();
        });

        it("should produce error when the user doesnt own the resume", async () => {
            const id = "resume-1"
            const userId = "user-1"

            mockRepository.findById.mockResolvedValue({
                id,
                userId: "user-2",
                title: "BackendResume",
                fileUrl: "fileURL.com"
            })

            await expect(service.deleteResume(id, userId)).rejects.toMatchObject({
                message: "Unauthorized",
                statusCode: 403,
                code: "UNAUTHORIZED",
            })

            expect(mockRepository.deleteResume).not.toHaveBeenCalled();
        })

        it("should produce error when resume doesnt exist", async () => {
            const id = "resume-1";
            const userId = "user-1";

            mockRepository.findById.mockResolvedValue(null);

            await expect(
                service.deleteResume(id, userId)
            ).rejects.toMatchObject({
                message: "Resume not found",
                statusCode: 404,
                code: "RESUME_NOT_FOUND",
            });

            expect(mockRepository.deleteResume).not.toHaveBeenCalled();
        });
    });
  });

  describe("findById", () => {
    it("should find a resume by id", async() => {
        const id = "resume-id"
        const resume = {
            id,
            userId: "user-1",
            fileUrl: "backendResume.com",
            title: "Backend Resume"
        }
        mockRepository.findById.mockResolvedValue(resume)

        const foundResume = await service.findById(id);

        expect(mockRepository.findById).toHaveBeenCalledOnce();
        expect(mockRepository.findById).toHaveBeenCalledWith(id);

        expect(foundResume).toEqual(resume)
    })
  })

  describe("findByUserId", () => {
    it("should find a resumes by user ids", async() => {
        const id = "resume-id"
        const userId = "user-1"
        const resumes = [
                            {
                                id: "resume-1",
                                userId,
                                title: "Backend Resume",
                                fileUrl: "backend.pdf",
                            },
                            {
                                id: "resume-2",
                                userId,
                                title: "Frontend Resume",
                                fileUrl: "frontend.pdf",
                            },
                        ];
        mockRepository.findByUserId.mockResolvedValue(resumes)

        const foundResumes = await service.findByUserId(userId);

        expect(mockRepository.findByUserId).toHaveBeenCalledOnce();
        expect(mockRepository.findByUserId).toHaveBeenCalledWith(userId);

        expect(foundResumes).toEqual(resumes)
    })
  })
});