import { beforeEach, describe, expect, it, vi } from "vitest";
import { InterviewService } from "../../../src/services/interview.service";
import { InterviewStatus, ParticipantRole } from "@interview-os/database";

describe("InterviewService", () => {
    const mockRepository = {
        createInterview: vi.fn(),
        deleteInterview: vi.fn(),
        updateInterview: vi.fn(),
        updateInterviewSchedule: vi.fn(),
        findById: vi.fn(),
        findByUserId: vi.fn(),
    };
    const mockParticipantRepository = {
        findParticipant: vi.fn(),
        createParticipant: vi.fn(),
    };

    
    let service: InterviewService;

    beforeEach(() => {
        vi.clearAllMocks();

        service = new InterviewService(
            mockRepository as any,
            mockParticipantRepository as any
        );
    });


        describe("findInterviewById", () => {
            const id = "interview-1";
            const userId = "user-1";

            it("returns the interview when the requester is the owner", async () => {
                const interview = {
                    id,
                    createdById: userId,
                    title: "Backend Interview",
                };

                mockRepository.findById.mockResolvedValue(interview);
                mockParticipantRepository.findParticipant.mockResolvedValue(null);

                const result = await service.findInterviewById(id, userId);

                expect(mockRepository.findById).toHaveBeenCalledWith(id);
                expect(mockParticipantRepository.findParticipant).toHaveBeenCalledWith(
                    userId,
                    id,
                );
                expect(result).toEqual(interview);
            });

            it("returns the interview when the requester is a participant", async () => {
                const interview = {
                    id,
                    createdById: "another-user",
                    title: "Backend Interview",
                };

                const participant = {
                    userId,
                    interviewId: id,
                    role: ParticipantRole.CANDIDATE,
                };

                mockRepository.findById.mockResolvedValue(interview);
                mockParticipantRepository.findParticipant.mockResolvedValue(participant);

                const result = await service.findInterviewById(id, userId);

                expect(result).toEqual(interview);
            });

            it("throws INTERVIEW_NOT_FOUND when the interview does not exist", async () => {
                mockRepository.findById.mockResolvedValue(null);

                await expect(
                    service.findInterviewById(id, userId),
                ).rejects.toMatchObject({
                    message: "Interview Not Found",
                    statusCode: 404,
                    code: "INTERVIEW_NOT_FOUND",
                });

                expect(
                    mockParticipantRepository.findParticipant,
                ).not.toHaveBeenCalled();
            });

            it("throws UNAUTHORIZED when the requester is neither owner nor participant", async () => {
                const interview = {
                    id,
                    createdById: "another-user",
                    title: "Backend Interview",
                };

                mockRepository.findById.mockResolvedValue(interview);
                mockParticipantRepository.findParticipant.mockResolvedValue(null);

                await expect(
                    service.findInterviewById(id, userId),
                ).rejects.toMatchObject({
                    message: "Unauthorized",
                    statusCode: 403,
                    code: "UNAUTHORIZED",
                });
            });
        });

    
    describe("scheduleInterview", () => {
        const id = "interview-1";
        const userId = "user-1";
        const scheduledAt = new Date("2099-10-11T09:25:50Z");

        beforeEach(() => {
            mockRepository.updateInterviewSchedule.mockReset();
        });

        it("schedules a draft interview for a future date", async () => {
            const interview = {
                id,
                createdById: userId,
                status: InterviewStatus.DRAFT,
            };

            mockRepository.findById.mockResolvedValue(interview);
            mockParticipantRepository.findParticipant.mockResolvedValue(null);
            mockRepository.updateInterviewSchedule.mockResolvedValue({
                ...interview,
                status: InterviewStatus.SCHEDULED,
                scheduledAt,
            });

            await service.scheduleInterview(userId, id, scheduledAt);

            expect(mockRepository.updateInterviewSchedule).toHaveBeenCalledWith(
                id,
                InterviewStatus.SCHEDULED,
                scheduledAt
            );
        });

        it("rejects scheduling when the interview is not a draft", async () => {
            mockRepository.findById.mockResolvedValue({
                id,
                createdById: userId,
                status: InterviewStatus.SCHEDULED,
            });
            mockParticipantRepository.findParticipant.mockResolvedValue(null);

            await expect(
                service.scheduleInterview(userId, id, scheduledAt)
            ).rejects.toMatchObject({
                statusCode: 400,
                code: "STATUS_NOT_DRAFT",
            });

            expect(mockRepository.updateInterviewSchedule).not.toHaveBeenCalled();
        });

        it("rejects a scheduled time in the past", async () => {
            mockRepository.findById.mockResolvedValue({
                id,
                createdById: userId,
                status: InterviewStatus.DRAFT,
            });
            mockParticipantRepository.findParticipant.mockResolvedValue(null);

            await expect(
                service.scheduleInterview(
                    userId,
                    id,
                    new Date("2000-01-01T00:00:00Z")
                )
            ).rejects.toMatchObject({
                statusCode: 400,
                code: "INVALID_SCHEDULED_TIME",
            });

            expect(mockRepository.updateInterviewSchedule).not.toHaveBeenCalled();
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
                scheduledAt: new Date("2026-10-11 09:25:50"),
                durationMinutes: 20,
                createdAs: ParticipantRole.INTERVIEWER
            }

            const createdInterview = {
                id: "interview-1",
                ...data,
                createdById: userId,
            };

            mockRepository.createInterview.mockResolvedValue(createdInterview)
            const result  = await service.createInterview(userId, data)

            expect(mockRepository.createInterview)
                .toHaveBeenCalledWith(
                    expect.anything(),
                    userId,
                    data
                );
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
                scheduledAt: new Date("2026-10-11 09:25:50"),
                durationMinutes: 20,
                createdAs: ParticipantRole.INTERVIEWER
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
                scheduledAt: new Date("2026-10-11 09:25:50"),
                durationMinutes: 20,
                createdAs: ParticipantRole.INTERVIEWER
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
                scheduledAt: new Date("2026-10-11 09:25:50"),
                durationMinutes: 20,
                createdAs: ParticipantRole.INTERVIEWER
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