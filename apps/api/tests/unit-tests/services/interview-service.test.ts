import { beforeEach, describe, expect, it, vi } from "vitest";
import { InterviewService } from "../../../src/services/interview.service";

describe("InterviewService", () => {
    const mockRepository = {
        createInterview: vi.fn(),
        deleteInterview: vi.fn(),
        updateInterview: vi.fn(),
        findById: vi.fn(),
        findByUserId: vi.fn(),
    };

    let service: InterviewService;

    beforeEach(() => {
        vi.clearAllMocks();
        service = new InterviewService(mockRepository as any);
    });

    describe("findInterviewById", () => {
        it("should find the interview by its ID", async () => {
            const id = "interview-1";

            const interview = {
                id,
                title: "Backend Interview",
            };

            mockRepository.findById.mockResolvedValue(interview);

            const result = await service.findInterviewById(id);

            expect(mockRepository.findById).toHaveBeenCalledWith(id);
            expect(result).toEqual(interview);
        });
    });

    describe("findAllInterviewsByUserId", () => {
        it("should find all interviews created by the user", async () => {
            const userId = "user-1"

            const interviews = [
                {
                    userId,
                    id: "interview-1",
                    title: "Backend Interview"
                },
                {
                    userId,
                    id: "interview-2",
                    title: "Frontend Interview"
                }
            ]

            mockRepository.findByUserId.mockResolvedValue(interviews)

            const foundInterviews = await service.findAllInterviewsByUserId(userId)

            expect(mockRepository.findByUserId).toHaveBeenCalledWith(userId)
            expect(foundInterviews).toEqual(interviews)
        })
    })

    describe("deleteInterview", () => {
        it("should delete the interview", async () => {
            const id = "interview-1"
            const userId = "user-1"
            const interview = {
                id,
                createdById: userId,
                title: "Backend Interview",
                description: "backend interview for fullstack role"
            }

            mockRepository.findById.mockResolvedValue(interview)
            mockRepository.deleteInterview.mockResolvedValue(undefined)

            const result = await service.deleteInterview(id, userId)

            expect(mockRepository.findById).toHaveBeenCalledWith(id)
            expect(result).toBeUndefined()

        })
        it("should produce error when interview doesnt exist", async () => {
            const id = "interview-1"
            const userId = "user-1"

            mockRepository.findById.mockResolvedValue(null)
            await expect(service.deleteInterview(id,userId)).rejects.toMatchObject({
                message: "Interview Not Found",
                statusCode: 404,
                code: "INTERVIEW_NOT_FOUND"
            })

            expect(mockRepository.deleteInterview).not.toHaveBeenCalled()
        })
        it("should produce error when user doesnt own the interview", async() => {
            const id = "interview-1"
            const userId = "user-1"

            const interview = {
                id,
                createdById: "user-2",
                title: "Backend Interview"
            }

            mockRepository.findById.mockResolvedValue(interview)

            await expect(service.deleteInterview(id,userId)).rejects.toMatchObject({
                message: "Unauthorized",
                statusCode: 403,
                code: "UNAUTHORIZED"
            })

            expect(mockRepository.deleteInterview).not.toHaveBeenCalled()
        })
    })

    describe("createInterview", () => {
        it("should create an interview", async () => {
            const userId = "user-1"
            const data = {
                title: "Backend Interview",
                description: "backend role backend interview",
                scheduledAt: "",
                durationMinutes: 20
            }

            const createdInterview = {
                id: "interview-1",
                ...data,
                createdById: userId
            };

            mockRepository.createInterview.mockResolvedValue(createdInterview)
            const result  = await service.createInterview(userId, data)

            expect(mockRepository.createInterview).toHaveBeenCalledWith(userId, data)
            expect(result).toEqual(createdInterview)
        })
    })

    describe("updateInterview", () => {
        it("should update an interview", async () => {
            const id = "interview-1"
            const userId = "user-1"
            const data = {
                title: "Backend Interview",
                description: "backend role backend interview",
                scheduledAt: "",
                durationMinutes: 20
            }

            const updatedInterview = {
                id,
                ...data,
                createdById: userId
            };

            mockRepository.findById.mockResolvedValue(updatedInterview)
            mockRepository.updateInterview.mockResolvedValue(updatedInterview)
            const result  = await service.updateInterview(id,userId, data)

            expect(mockRepository.findById).toHaveBeenCalledWith(id);
            expect(mockRepository.updateInterview).toHaveBeenCalledWith(id, data)
            expect(result).toEqual(updatedInterview)
        })

        it("should produce error when interview doesnt exist", async () => {
            const id = "interview-1"
            const userId = "user-1"
            const data = {
                title: "Backend Interview",
                description: "backend role backend interview",
                scheduledAt: "",
                durationMinutes: 20
            }

            mockRepository.findById.mockResolvedValue(null)
            await expect(service.updateInterview(id,userId, data)).rejects.toMatchObject({
                message: "Interview Not Found",
                statusCode: 404,
                code: "INTERVIEW_NOT_FOUND"
            })

            expect(mockRepository.updateInterview).not.toHaveBeenCalled()
        })
        it("should produce error when user doesnt own the interview", async() => {
            const id = "interview-1"
            const userId = "user-1"
            const data = {
                title: "Backend Interview",
                description: "backend role backend interview",
                scheduledAt: "",
                durationMinutes: 20
            }

            const interview = {
                id,
                createdById: "user-2",
                title: "Backend Interview"
            }

            mockRepository.findById.mockResolvedValue(interview)

            await expect(service.updateInterview(id,userId, data)).rejects.toMatchObject({
                message: "Unauthorized",
                statusCode: 403,
                code: "UNAUTHORIZED"
            })

            expect(mockRepository.updateInterview).not.toHaveBeenCalled()
        })
    })
});