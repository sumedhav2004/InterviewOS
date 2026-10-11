
import { beforeEach, describe, expect, it, vi } from "vitest";
import { InterviewService } from "../../../src/services/interview.service";
import { InterviewStatus, ParticipantRole, prisma } from "@interview-os/database";

vi.mock("@interview-os/database", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@interview-os/database")>();
    return {
        ...actual,
        prisma: {
            ...actual.prisma,
            $transaction: vi.fn(async (callback: (tx: object) => unknown) =>
                callback({ transaction: true }),
            ),
        },
    };
});

describe("InterviewService", () => {
    const mockRepository = {
        createInterview: vi.fn(),
        deleteInterview: vi.fn(),
        updateInterview: vi.fn(),
        updateInterviewSchedule: vi.fn(),
        updateInterviewStatus: vi.fn(),
        findById: vi.fn(),
        findByUserId: vi.fn(),
    };

    const mockParticipantRepository = {
        findParticipant: vi.fn(),
        createParticipant: vi.fn(),
    };

    let service: InterviewService;

    const id = "interview-1";
    const userId = "user-1";

    beforeEach(() => {
        vi.clearAllMocks();
        service = new InterviewService(
            mockRepository as any,
            mockParticipantRepository as any,
        );
    });

    describe("findInterviewById", () => {
        it("returns an interview when the requester owns it", async () => {
            const interview = { id, createdById: userId };
            mockRepository.findById.mockResolvedValue(interview);
            mockParticipantRepository.findParticipant.mockResolvedValue(null);

            await expect(service.findInterviewById(id, userId))
                .resolves.toEqual(interview);
            expect(mockParticipantRepository.findParticipant)
                .toHaveBeenCalledWith(userId, id);
        });

        it("returns an interview when the requester is a participant", async () => {
            const interview = { id, createdById: "other-user" };
            mockRepository.findById.mockResolvedValue(interview);
            mockParticipantRepository.findParticipant.mockResolvedValue({
                userId,
                interviewId: id,
            });

            await expect(service.findInterviewById(id, userId))
                .resolves.toEqual(interview);
        });

        it("throws when the interview does not exist", async () => {
            mockRepository.findById.mockResolvedValue(null);

            await expect(service.findInterviewById(id, userId))
                .rejects.toMatchObject({
                    message: "Interview Not Found",
                    statusCode: 404,
                    code: "INTERVIEW_NOT_FOUND",
                });

            expect(mockParticipantRepository.findParticipant).not.toHaveBeenCalled();
        });

        it("rejects a requester who is neither owner nor participant", async () => {
            mockRepository.findById.mockResolvedValue({
                id,
                createdById: "other-user",
            });
            mockParticipantRepository.findParticipant.mockResolvedValue(null);

            await expect(service.findInterviewById(id, userId))
                .rejects.toMatchObject({
                    statusCode: 403,
                    code: "UNAUTHORIZED",
                });
        });
    });

    describe("createInterview", () => {
        it("creates the interview and adds the creator as a participant", async () => {
            const data = {
                title: "Backend Interview",
                description: "Backend role",
                scheduledAt: new Date("2099-10-11T09:25:50Z"),
                durationMinutes: 20,
                createdAs: ParticipantRole.INTERVIEWER,
            };
            const createdInterview = { id, ...data, createdById: userId };

            mockRepository.createInterview.mockResolvedValue(createdInterview);

            await expect(service.createInterview(userId, data))
                .resolves.toEqual(createdInterview);

            expect(prisma.$transaction).toHaveBeenCalledOnce();
            expect(mockRepository.createInterview).toHaveBeenCalledWith(
                expect.anything(),
                userId,
                data,
            );
            expect(mockParticipantRepository.createParticipant).toHaveBeenCalledWith(
                expect.anything(),
                userId,
                id,
                { role: data.createdAs },
            );
        });

        it("propagates an error if creating the interview fails", async () => {
            mockRepository.createInterview.mockRejectedValue(new Error("DB error"));

            await expect(service.createInterview(userId, {
                title: "Interview",
                createdAs: ParticipantRole.INTERVIEWER,
            } as any)).rejects.toThrow("DB error");

            expect(mockParticipantRepository.createParticipant).not.toHaveBeenCalled();
        });

        it("propagates an error if creating the participant fails", async () => {
            mockRepository.createInterview.mockResolvedValue({ id });
            mockParticipantRepository.createParticipant.mockRejectedValue(
                new Error("Participant error"),
            );

            await expect(service.createInterview(userId, {
                title: "Interview",
                createdAs: ParticipantRole.INTERVIEWER,
            } as any)).rejects.toThrow("Participant error");
        });
    });

    describe("updateInterview", () => {
        it("updates an interview owned by the requester", async () => {
            const data = { title: "Updated interview" };
            const interview = { id, createdById: userId };
            const updated = { ...interview, ...data };

            mockRepository.findById.mockResolvedValue(interview);
            mockParticipantRepository.findParticipant.mockResolvedValue(null);
            mockRepository.updateInterview.mockResolvedValue(updated);

            await expect(service.updateInterview(id, userId, data as any))
                .resolves.toEqual(updated);
            expect(mockRepository.updateInterview).toHaveBeenCalledWith(id, data);
        });

        it("rejects updating a missing interview", async () => {
            mockRepository.findById.mockResolvedValue(null);

            await expect(service.updateInterview(id, userId, {} as any))
                .rejects.toMatchObject({ code: "INTERVIEW_NOT_FOUND" });
            expect(mockRepository.updateInterview).not.toHaveBeenCalled();
        });

        it("rejects updating an interview owned by another user", async () => {
            mockRepository.findById.mockResolvedValue({
                id,
                createdById: "other-user",
            });
            mockParticipantRepository.findParticipant.mockResolvedValue(null);

            await expect(service.updateInterview(id, userId, {} as any))
                .rejects.toMatchObject({ code: "UNAUTHORIZED" });
            expect(mockRepository.updateInterview).not.toHaveBeenCalled();
        });
    });

    describe("findAllInterviewsByUserId", () => {
        it("returns interviews for the given user", async () => {
            const interviews = [{ id }, { id: "interview-2" }];
            mockRepository.findByUserId.mockResolvedValue(interviews);

            await expect(service.findAllInterviewsByUserId(userId))
                .resolves.toEqual(interviews);
            expect(mockRepository.findByUserId).toHaveBeenCalledWith(userId);
        });

        it("propagates repository errors", async () => {
            mockRepository.findByUserId.mockRejectedValue(new Error("DB error"));

            await expect(service.findAllInterviewsByUserId(userId))
                .rejects.toThrow("DB error");
        });
    });

    describe("deleteInterview", () => {
        it("deletes an interview owned by the requester", async () => {
            mockRepository.findById.mockResolvedValue({ id, createdById: userId });
            mockParticipantRepository.findParticipant.mockResolvedValue(null);

            await expect(service.deleteInterview(id, userId)).resolves.toBeUndefined();
            expect(mockRepository.deleteInterview).toHaveBeenCalledWith(id);
        });

        it("rejects deleting a missing interview", async () => {
            mockRepository.findById.mockResolvedValue(null);

            await expect(service.deleteInterview(id, userId))
                .rejects.toMatchObject({ code: "INTERVIEW_NOT_FOUND" });
            expect(mockRepository.deleteInterview).not.toHaveBeenCalled();
        });

        it("rejects deleting an interview owned by another user", async () => {
            mockRepository.findById.mockResolvedValue({
                id,
                createdById: "other-user",
            });
            mockParticipantRepository.findParticipant.mockResolvedValue(null);

            await expect(service.deleteInterview(id, userId))
                .rejects.toMatchObject({ code: "UNAUTHORIZED" });
            expect(mockRepository.deleteInterview).not.toHaveBeenCalled();
        });
    });

    describe("scheduleInterview", () => {
        const scheduledAt = new Date("2099-10-11T09:25:50Z");

        beforeEach(() => {
            mockRepository.findById.mockResolvedValue({
                id,
                createdById: userId,
                status: InterviewStatus.DRAFT,
            });
            mockParticipantRepository.findParticipant.mockResolvedValue(null);
        });

        it("schedules a draft interview for a future date", async () => {
            const updated = { id, status: InterviewStatus.SCHEDULED, scheduledAt };
            mockRepository.updateInterviewSchedule.mockResolvedValue(updated);

            await expect(service.scheduleInterview(userId, id, scheduledAt))
                .resolves.toEqual(updated);
            expect(mockRepository.updateInterviewSchedule).toHaveBeenCalledWith(
                id,
                InterviewStatus.SCHEDULED,
                scheduledAt,
            );
        });

        it("rejects scheduling when the interview is not a draft", async () => {
            mockRepository.findById.mockResolvedValue({
                id,
                createdById: userId,
                status: InterviewStatus.SCHEDULED,
            });

            await expect(service.scheduleInterview(userId, id, scheduledAt))
                .rejects.toMatchObject({ code: "STATUS_NOT_DRAFT" });
            expect(mockRepository.updateInterviewSchedule).not.toHaveBeenCalled();
        });

        it("rejects a scheduled time in the past", async () => {
            await expect(service.scheduleInterview(
                userId,
                id,
                new Date("2000-01-01T00:00:00Z"),
            )).rejects.toMatchObject({ code: "INVALID_SCHEDULED_TIME" });

            expect(mockRepository.updateInterviewSchedule).not.toHaveBeenCalled();
        });

        it("rejects scheduling by a non-owner", async () => {
            mockRepository.findById.mockResolvedValue({
                id,
                createdById: "other-user",
                status: InterviewStatus.DRAFT,
            });

            await expect(service.scheduleInterview(userId, id, scheduledAt))
                .rejects.toMatchObject({ code: "UNAUTHORIZED" });
        });
    });

    describe("startInterview", () => {
        it("starts a scheduled interview", async () => {
            mockRepository.findById.mockResolvedValue({
                id,
                createdById: userId,
                status: InterviewStatus.SCHEDULED,
            });
            mockParticipantRepository.findParticipant.mockResolvedValue(null);
            mockRepository.updateInterviewStatus.mockResolvedValue({
                id,
                status: InterviewStatus.INPROGRESS,
            });

            await expect(service.startInterview(userId, id))
                .resolves.toMatchObject({ status: InterviewStatus.INPROGRESS });
            expect(mockRepository.updateInterviewStatus).toHaveBeenCalledWith(
                id,
                InterviewStatus.INPROGRESS,
            );
        });

        it("rejects starting an interview that is not scheduled", async () => {
            mockRepository.findById.mockResolvedValue({
                id,
                createdById: userId,
                status: InterviewStatus.DRAFT,
            });
            mockParticipantRepository.findParticipant.mockResolvedValue(null);

            await expect(service.startInterview(userId, id))
                .rejects.toMatchObject({ code: "STATUS_NOT_SCHEDULED" });
            expect(mockRepository.updateInterviewStatus).not.toHaveBeenCalled();
        });

        it("rejects starting an interview by a non-owner", async () => {
            mockRepository.findById.mockResolvedValue({
                id,
                createdById: "other-user",
                status: InterviewStatus.SCHEDULED,
            });
            mockParticipantRepository.findParticipant.mockResolvedValue(null);

            await expect(service.startInterview(userId, id))
                .rejects.toMatchObject({ code: "UNAUTHORIZED" });
        });
    });

    describe("completeInterview", () => {
        it("completes an in-progress interview", async () => {
            mockRepository.findById.mockResolvedValue({
                id,
                createdById: userId,
                status: InterviewStatus.INPROGRESS,
            });
            mockParticipantRepository.findParticipant.mockResolvedValue(null);
            mockRepository.updateInterviewStatus.mockResolvedValue({
                id,
                status: InterviewStatus.COMPLETED,
            });

            await expect(service.completeInterview(userId, id))
                .resolves.toMatchObject({ status: InterviewStatus.COMPLETED });
            expect(mockRepository.updateInterviewStatus).toHaveBeenCalledWith(
                id,
                InterviewStatus.COMPLETED,
            );
        });

        it("rejects completing an interview that is not in progress", async () => {
            mockRepository.findById.mockResolvedValue({
                id,
                createdById: userId,
                status: InterviewStatus.SCHEDULED,
            });
            mockParticipantRepository.findParticipant.mockResolvedValue(null);

            await expect(service.completeInterview(userId, id))
                .rejects.toMatchObject({ code: "STATUS_NOT_INPROGRESS" });
            expect(mockRepository.updateInterviewStatus).not.toHaveBeenCalled();
        });

        it("rejects completing an interview by a non-owner", async () => {
            mockRepository.findById.mockResolvedValue({
                id,
                createdById: "other-user",
                status: InterviewStatus.INPROGRESS,
            });
            mockParticipantRepository.findParticipant.mockResolvedValue(null);

            await expect(service.completeInterview(userId, id))
                .rejects.toMatchObject({ code: "UNAUTHORIZED" });
        });
    });

    describe("cancelInterview", () => {
        beforeEach(() => {
            mockParticipantRepository.findParticipant.mockResolvedValue(null);
        });

        it("cancels a draft interview", async () => {
            mockRepository.findById.mockResolvedValue({
                id,
                createdById: userId,
                status: InterviewStatus.DRAFT,
            });
            mockRepository.updateInterviewStatus.mockResolvedValue({
                id,
                status: InterviewStatus.CANCELLED,
            });

            await expect(service.cancelInterview(userId, id))
                .resolves.toMatchObject({ status: InterviewStatus.CANCELLED });
            expect(mockRepository.updateInterviewStatus).toHaveBeenCalledWith(
                id,
                InterviewStatus.CANCELLED,
            );
        });

        it("currently rejects cancelling a scheduled interview due to the status check", async () => {
            mockRepository.findById.mockResolvedValue({
                id,
                createdById: userId,
                status: InterviewStatus.SCHEDULED,
            });

            await expect(service.cancelInterview(userId, id))
                .rejects.toMatchObject({ code: "STATUS_NOT_INPROGRESS" });
            expect(mockRepository.updateInterviewStatus).not.toHaveBeenCalled();
        });

        it("rejects cancelling an interview by a non-owner", async () => {
            mockRepository.findById.mockResolvedValue({
                id,
                createdById: "other-user",
                status: InterviewStatus.DRAFT,
            });
            mockParticipantRepository.findParticipant.mockResolvedValue(null);

            await expect(service.cancelInterview(userId, id))
                .rejects.toMatchObject({ code: "UNAUTHORIZED" });
        });
    });
});
