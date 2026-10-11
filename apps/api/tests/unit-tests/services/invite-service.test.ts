
import { beforeEach, describe, expect, it, vi } from "vitest";
import { InterviewStatus, InviteStatus } from "@interview-os/database";

const mocks = vi.hoisted(() => ({
    interviewFindById: vi.fn(),
    inviteFindById: vi.fn(),
    findByInterviewAndReceiver: vi.fn(),
    createInvite: vi.fn(),
    getReceivedInvites: vi.fn(),
    getSentInvites: vi.fn(),
    updateInviteStatus: vi.fn(),
    userFindById: vi.fn(),
    findParticipant: vi.fn(),
    createParticipant: vi.fn(),
    transaction: vi.fn(),
}));

vi.mock("@interview-os/database", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@interview-os/database")>();
    return {
        ...actual,
        prisma: {
            ...actual.prisma,
            $transaction: mocks.transaction,
        },
    };
});

vi.mock("../../../src/repositories/invites.repository", () => ({
    InvitesRepository: class {
        findById = mocks.inviteFindById;
        findByInterviewAndReceiver = mocks.findByInterviewAndReceiver;
        createInvite = mocks.createInvite;
        getReceivedInvites = mocks.getReceivedInvites;
        getSentInvites = mocks.getSentInvites;
        updateInviteStatus = mocks.updateInviteStatus;
    },
}));

vi.mock("../../../src/repositories/interview.repository", () => ({
    InterviewRepository: class {
        findById = mocks.interviewFindById;
    },
}));

vi.mock("../../../src/repositories/user.repository", () => ({
    UserRepository: class {
        findById = mocks.userFindById;
    },
}));

vi.mock("../../../src/repositories/participant.repository", () => ({
    ParticipantRepository: class {
        findParticipant = mocks.findParticipant;
        createParticipant = mocks.createParticipant;
    },
}));

import { InviteService } from "../../../src/services/invite.service";

describe("InviteService", () => {
    let service: InviteService;

    const senderId = "sender-1";
    const receiverId = "receiver-1";
    const interviewId = "interview-1";
    const inviteId = "invite-1";

    const interview = {
        id: interviewId,
        createdById: senderId,
        status: InterviewStatus.SCHEDULED,
    };

    const invite = {
        id: inviteId,
        senderId,
        receiverId,
        interviewId,
        role: "CANDIDATE",
        status: InviteStatus.PENDING,
    };

    beforeEach(() => {
        vi.clearAllMocks();
        service = new InviteService();

        mocks.transaction.mockImplementation(
            async (callback: (tx: object) => unknown) =>
                callback({ transaction: true }),
        );
    });

    describe("createInvite", () => {
        const data = { role: "CANDIDATE" };

        beforeEach(() => {
            mocks.interviewFindById.mockResolvedValue(interview);
            mocks.userFindById.mockResolvedValue({ id: receiverId });
            mocks.findParticipant.mockResolvedValue(null);
            mocks.findByInterviewAndReceiver.mockResolvedValue(null);
            mocks.createInvite.mockResolvedValue(invite);
        });

        it("creates an invite when all validations pass", async () => {
            await expect(
                service.createInvite(senderId, receiverId, interviewId, data as any),
            ).resolves.toEqual(invite);

            expect(mocks.interviewFindById).toHaveBeenCalledWith(interviewId);
            expect(mocks.userFindById).toHaveBeenCalledWith(receiverId);
            expect(mocks.findParticipant).toHaveBeenCalledWith(receiverId, interviewId);
            expect(mocks.findByInterviewAndReceiver)
                .toHaveBeenCalledWith(interviewId, receiverId);
            expect(mocks.createInvite)
                .toHaveBeenCalledWith(senderId, receiverId, interviewId, data);
        });

        it("throws when the interview does not exist", async () => {
            mocks.interviewFindById.mockResolvedValue(null);

            await expect(
                service.createInvite(senderId, receiverId, interviewId, data as any),
            ).rejects.toMatchObject({
                statusCode: 404,
                code: "INTERVIEW_NOT_FOUND",
            });

            expect(mocks.userFindById).not.toHaveBeenCalled();
        });

        it("rejects invites for interviews that are not scheduled", async () => {
            mocks.interviewFindById.mockResolvedValue({
                ...interview,
                status: InterviewStatus.DRAFT,
            });

            await expect(
                service.createInvite(senderId, receiverId, interviewId, data as any),
            ).rejects.toMatchObject({
                statusCode: 400,
                code: "INVALID_INTERVIEW_STATUS",
            });

            expect(mocks.createInvite).not.toHaveBeenCalled();
        });

        it("rejects a sender who does not own the interview", async () => {
            mocks.interviewFindById.mockResolvedValue({
                ...interview,
                createdById: "other-user",
            });

            await expect(
                service.createInvite(senderId, receiverId, interviewId, data as any),
            ).rejects.toMatchObject({ code: "UNAUTHORIZED" });

            expect(mocks.userFindById).not.toHaveBeenCalled();
        });

        it("throws when the receiver does not exist", async () => {
            mocks.userFindById.mockResolvedValue(null);

            await expect(
                service.createInvite(senderId, receiverId, interviewId, data as any),
            ).rejects.toMatchObject({
                statusCode: 404,
                code: "RECEIVER_NOT_FOUND",
            });
        });

        it("rejects a receiver who is already a participant", async () => {
            mocks.findParticipant.mockResolvedValue({ userId: receiverId });

            await expect(
                service.createInvite(senderId, receiverId, interviewId, data as any),
            ).rejects.toMatchObject({
                statusCode: 409,
                code: "USER_ALREADY_PARTICIPANT",
            });

            expect(mocks.createInvite).not.toHaveBeenCalled();
        });

        it("rejects a duplicate invite", async () => {
            mocks.findByInterviewAndReceiver.mockResolvedValue(invite);

            await expect(
                service.createInvite(senderId, receiverId, interviewId, data as any),
            ).rejects.toMatchObject({
                statusCode: 409,
                code: "INVITE_ALREADY_EXISTS",
            });

            expect(mocks.createInvite).not.toHaveBeenCalled();
        });

        it("propagates repository errors", async () => {
            mocks.interviewFindById.mockRejectedValue(new Error("Database error"));

            await expect(
                service.createInvite(senderId, receiverId, interviewId, data as any),
            ).rejects.toThrow("Database error");
        });
    });

    describe("getReceivedInvites", () => {
        it("returns invites received by the user", async () => {
            const received = [invite];
            mocks.getReceivedInvites.mockResolvedValue(received);

            await expect(service.getReceivedInvites(receiverId))
                .resolves.toEqual(received);
            expect(mocks.getReceivedInvites).toHaveBeenCalledWith(receiverId);
        });

        it("propagates repository errors", async () => {
            mocks.getReceivedInvites.mockRejectedValue(new Error("Query failed"));

            await expect(service.getReceivedInvites(receiverId))
                .rejects.toThrow("Query failed");
        });
    });

    describe("acceptInvite", () => {
        beforeEach(() => {
            mocks.inviteFindById.mockResolvedValue(invite);
            mocks.updateInviteStatus.mockResolvedValue({
                ...invite,
                status: InviteStatus.ACCEPTED,
            });
            mocks.createParticipant.mockResolvedValue({
                userId: receiverId,
                interviewId,
                role: invite.role,
            });
        });

        it("accepts a pending invite and creates a participant in a transaction", async () => {
            const result = await service.acceptInvite(inviteId, receiverId);

            expect(result).toEqual({
                invite: expect.objectContaining({ status: InviteStatus.ACCEPTED }),
                participant: expect.objectContaining({ userId: receiverId }),
            });

            expect(mocks.transaction).toHaveBeenCalledOnce();
            expect(mocks.updateInviteStatus).toHaveBeenCalledWith(
                inviteId,
                InviteStatus.ACCEPTED,
                expect.any(Date),
                { transaction: true },
            );
            expect(mocks.createParticipant).toHaveBeenCalledWith(
                { transaction: true },
                receiverId,
                interviewId,
                { role: invite.role },
            );
        });

        it("throws when the invite does not exist", async () => {
            mocks.inviteFindById.mockResolvedValue(null);

            await expect(service.acceptInvite(inviteId, receiverId))
                .rejects.toMatchObject({
                    statusCode: 404,
                    code: "INVITE_NOT_FOUND",
                });

            expect(mocks.transaction).not.toHaveBeenCalled();
        });

        it("rejects a receiver who does not own the invite", async () => {
            await expect(service.acceptInvite(inviteId, "other-user"))
                .rejects.toMatchObject({ code: "UNAUTHORIZED" });

            expect(mocks.transaction).not.toHaveBeenCalled();
        });

        it("rejects an invite that is no longer pending", async () => {
            mocks.inviteFindById.mockResolvedValue({
                ...invite,
                status: InviteStatus.DECLINED,
            });

            await expect(service.acceptInvite(inviteId, receiverId))
                .rejects.toMatchObject({
                    statusCode: 400,
                    code: "INVITE_NOT_PENDING",
                });

            expect(mocks.transaction).not.toHaveBeenCalled();
        });

        it("propagates errors from the transaction", async () => {
            mocks.transaction.mockRejectedValue(new Error("Transaction failed"));

            await expect(service.acceptInvite(inviteId, receiverId))
                .rejects.toThrow("Transaction failed");
        });
    });

    describe("declineInvite", () => {
        beforeEach(() => {
            mocks.inviteFindById.mockResolvedValue(invite);
            mocks.updateInviteStatus.mockResolvedValue({
                ...invite,
                status: InviteStatus.DECLINED,
            });
        });

        it("declines a pending invite", async () => {
            await expect(service.declineInvite(inviteId, receiverId))
                .resolves.toMatchObject({ status: InviteStatus.DECLINED });

            expect(mocks.updateInviteStatus).toHaveBeenCalledWith(
                inviteId,
                InviteStatus.DECLINED,
                expect.any(Date),
            );
        });

        it("throws when the invite does not exist", async () => {
            mocks.inviteFindById.mockResolvedValue(null);

            await expect(service.declineInvite(inviteId, receiverId))
                .rejects.toMatchObject({ code: "INVITE_NOT_FOUND" });
            expect(mocks.updateInviteStatus).not.toHaveBeenCalled();
        });

        it("rejects a user who is not the receiver", async () => {
            await expect(service.declineInvite(inviteId, "other-user"))
                .rejects.toMatchObject({ code: "UNAUTHORIZED" });
            expect(mocks.updateInviteStatus).not.toHaveBeenCalled();
        });

        it("rejects an invite that is not pending", async () => {
            mocks.inviteFindById.mockResolvedValue({
                ...invite,
                status: InviteStatus.ACCEPTED,
            });

            await expect(service.declineInvite(inviteId, receiverId))
                .rejects.toMatchObject({ code: "INVITE_NOT_PENDING" });
        });
    });

    describe("cancelInvite", () => {
        beforeEach(() => {
            mocks.inviteFindById.mockResolvedValue(invite);
            mocks.updateInviteStatus.mockResolvedValue({
                ...invite,
                status: InviteStatus.CANCELLED,
            });
        });

        it("cancels a pending invite sent by the requester", async () => {
            await expect(service.cancelInvite(inviteId, senderId))
                .resolves.toMatchObject({ status: InviteStatus.CANCELLED });

            expect(mocks.updateInviteStatus).toHaveBeenCalledWith(
                inviteId,
                InviteStatus.CANCELLED,
            );
        });

        it("throws when the invite does not exist", async () => {
            mocks.inviteFindById.mockResolvedValue(null);

            await expect(service.cancelInvite(inviteId, senderId))
                .rejects.toMatchObject({ code: "INVITE_NOT_FOUND" });
            expect(mocks.updateInviteStatus).not.toHaveBeenCalled();
        });

        it("rejects a user who is not the sender", async () => {
            await expect(service.cancelInvite(inviteId, "other-user"))
                .rejects.toMatchObject({ code: "UNAUTHORIZED" });
            expect(mocks.updateInviteStatus).not.toHaveBeenCalled();
        });

        it("rejects an invite that is not pending", async () => {
            mocks.inviteFindById.mockResolvedValue({
                ...invite,
                status: InviteStatus.ACCEPTED,
            });

            await expect(service.cancelInvite(inviteId, senderId))
                .rejects.toMatchObject({ code: "INVITE_NOT_PENDING" });
        });
    });

    describe("getSentInvites", () => {
        it("returns invites sent by the user", async () => {
            const sent = [invite];
            mocks.getSentInvites.mockResolvedValue(sent);

            await expect(service.getSentInvites(senderId)).resolves.toEqual(sent);
            expect(mocks.getSentInvites).toHaveBeenCalledWith(senderId);
        });

        it("propagates repository errors", async () => {
            mocks.getSentInvites.mockRejectedValue(new Error("Query failed"));

            await expect(service.getSentInvites(senderId))
                .rejects.toThrow("Query failed");
        });
    });
});
