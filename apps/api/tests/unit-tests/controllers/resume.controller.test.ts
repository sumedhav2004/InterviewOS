import { beforeEach, describe, expect, it, vi } from "vitest";
import { ResumeController } from "../../../src/controllers/resumes.controller";

describe("ResumeController", () => {
    const mockService = {
        findByUserId: vi.fn(),
        findById: vi.fn(),
        deleteResume: vi.fn(),
        updateResume: vi.fn(),
        createResume: vi.fn(),
    };

    let controller: ResumeController;

    beforeEach(() => {
        vi.clearAllMocks();

        controller = new ResumeController(
            mockService as any
        );
    });

    describe("getResumes", () => {
        it("should respond with resumes and 200 status code", async() => {
            const req = {
                user: {
                    id: "user-1"
                }
            } as any

            const res = {
                status: vi.fn().mockReturnThis(),
                json: vi.fn()
            } as any

            const resumes = [
                            {
                                id: "resume-1",
                                userId: "user-1",
                                title: "Backend Resume",
                                fileUrl: "backend.pdf",
                            },
                            {
                                id: "resume-2",
                                userId: "user-1",
                                title: "Frontend Resume",
                                fileUrl: "frontend.pdf",
                            },
                        ];

            mockService.findByUserId.mockResolvedValue(resumes)

            await controller.getResumes(req,res)

            expect(mockService.findByUserId).toHaveBeenCalledOnce()
            expect(mockService.findByUserId).toHaveBeenCalledWith("user-1")

            expect(res.status).toHaveBeenCalledWith(200)
            expect(res.json).toHaveBeenCalledWith(resumes)
        })
    })

    describe("getResume", () => {
        it("should respond with a resume and 200 status code", async() => {
            const req = {
                params: {
                    id: "resume-1",
                }, 
                user: {
                    id: "user-1"
                }
            } as any

            const res = {
                status: vi.fn().mockReturnThis(),
                json : vi.fn()
            }as any

            const resume = {
                                id: "resume-1",
                                userId: "user-1",
                                title: "Frontend Resume",
                                fileUrl: "frontend.pdf",
                            }
            mockService.findById.mockResolvedValue(resume)

            await controller.getResume(req,res)

            expect(mockService.findById).toHaveBeenCalledOnce()
            expect(mockService.findById).toHaveBeenCalledWith("resume-1")

            expect(res.status).toHaveBeenCalledWith(200)
            expect(res.json).toHaveBeenCalledWith(resume)
        })
    })

    describe("deleteResume", () => {
        it("should delete a resume and return 204", async () => {
            const req = {
                params: {
                    id: "resume-1",
                },
                user: {
                    id: "user-1",
                },
            } as any;

            const res = {
                status: vi.fn().mockReturnThis(),
                send: vi.fn(),
            } as any;

            mockService.deleteResume.mockResolvedValue(undefined);

            await controller.deleteResume(req, res);

            expect(mockService.deleteResume)
                .toHaveBeenCalledOnce();

            expect(mockService.deleteResume)
                .toHaveBeenCalledWith("resume-1", "user-1");

            expect(res.status)
                .toHaveBeenCalledWith(204);

            expect(res.send)
                .toHaveBeenCalledOnce();
        });
    });

    describe("updateResume", () => {
        it("should respond with updated resume and a 200 status code", async () => {
            const req = {
                params: {
                    id: "resume-1",
                },
                user: {
                    id: "user-1",
                },
                body: {
                    title: "UpdatedTitle",
                    fileUrl: "updatedURL.com",
                },
            } as any;

            const res = {
                status: vi.fn().mockReturnThis(),
                json: vi.fn(),
            } as any;

            const updatedResume = {
                id: "resume-1",
                userId: "user-1",
                title: "UpdatedTitle",
                fileUrl: "updatedURL.com",
            };

            mockService.updateResume.mockResolvedValue(updatedResume);

            await controller.updateResume(req, res);

            expect(mockService.updateResume).toHaveBeenCalledOnce();

            expect(mockService.updateResume).toHaveBeenCalledWith(
                "resume-1",
                "user-1",
                {
                    title: "UpdatedTitle",
                    fileUrl: "updatedURL.com",
                }
            );

            expect(res.status).toHaveBeenCalledWith(200);

            expect(res.json).toHaveBeenCalledWith(updatedResume);
        });
    });

    describe("createResume", () => {
        it("should create a resume and a 201 status code", async () => {
            const req = {
                user: {
                    id: "user-1"
                },
                body: {
                    title: "BackendResume",
                    fileUrl: "BackendResume.com"
                }
            } as any

            const res = {
                status: vi.fn().mockReturnThis(),
                json: vi.fn()
            } as any

            const resume = {
                id: "resume-1",
                userId: "user-1",
                title: "BackendResume",
                fileUrl: "BackendResume.com",     
            }

            mockService.createResume.mockResolvedValue(resume)
            await controller.createResume(req,res)

            expect(mockService.createResume).toHaveBeenCalledOnce()
            expect(mockService.createResume).toHaveBeenCalledWith("user-1", {
                title: "BackendResume",
                fileUrl: "BackendResume.com"
            })
            expect(res.status).toHaveBeenCalledWith(201)
            expect(res.json).toHaveBeenCalledWith(resume)
        })
    })

})