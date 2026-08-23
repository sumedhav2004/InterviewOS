import {beforeEach, describe, expect, it, vi} from "vitest"
import { InviteService } from "../../../src/services/invite.service"
import { CreateInviteData } from "../../../src/types/invite"
import { InviteStatus, prisma } from "@interview-os/database";


vi.mock("@interview-os/database", async () => {
    const actual = await vi.importActual("@interview-os/database");

    return {
        ...actual,
        prisma: {
            $transaction: vi.fn(),
        },
    };
});

describe("InviteService", () => {
    const mockInviteRepository = {
        getSentInvites: vi.fn(),
        getReceivedInvies: vi.fn(),
        createInvite: vi.fn(),
        findByInterviewAndReceiver: vi.fn(),
        updateInvite: vi.fn(),
        findById: vi.fn(),
        updateInviteStatus: vi.fn(),
    }

    const mockInterviewRepository = {
        findById: vi.fn()
    }

    const mockParticipantRepository = {
        findById: vi.fn(),
        findParticipant: vi.fn(),
        createParticipant: vi.fn()
    }

    const mockUserRepository = {
        findById: vi.fn()
    }
    let service: InviteService

    beforeEach(() => {
        vi.clearAllMocks();
        service = new InviteService(
            mockInviteRepository as any,
            mockInterviewRepository as any,
            mockUserRepository as any,
            mockParticipantRepository as any
        );
    })


    describe("createInvite", () => {

        it("should create an invite", async () =>{
            const senderId = "user-1"
            const receiverId = "user-2"
            const interviewId = "interview-1"
            const data:CreateInviteData = {
                role: "INTERVIEWER"
            }

            const createdInvite = {
                id: "invite-1",
                senderId,
                receiverId,
                interviewId,
                ...data
            }

            mockInterviewRepository.findById.mockResolvedValue({
                id: interviewId,
                status: "SCHEDULED",
                createdById: senderId
            })
            mockUserRepository.findById.mockResolvedValue({
                id: receiverId
            })
            mockParticipantRepository.findParticipant.mockResolvedValue(null)
            mockInviteRepository.findByInterviewAndReceiver.mockResolvedValue(null)
            mockInviteRepository.createInvite.mockResolvedValue(createdInvite)

            const result = await service.createInvite(senderId, receiverId, interviewId, data)


            expect(mockInterviewRepository.findById).toHaveBeenCalledWith(interviewId)
            expect(mockParticipantRepository.findParticipant).toHaveBeenCalledWith(receiverId, interviewId)
            expect(mockInviteRepository.findByInterviewAndReceiver).toHaveBeenCalledWith(interviewId, receiverId)
            expect(mockInviteRepository.createInvite).toHaveBeenCalledWith(senderId, receiverId, interviewId, data)

            expect(result).toMatchObject(createdInvite)
        })

        it("should produce error when interview is not found", async () => {
            const senderId = "user-1"
            const receiverId = "user-2"
            const interviewId = "interview-1"
            const data:CreateInviteData = {
                role: "INTERVIEWER"
            }

            mockInterviewRepository.findById.mockResolvedValue(null)

            await expect(service.createInvite(senderId, receiverId, interviewId, data)).rejects.toMatchObject({
                message: "Interview Not Found",
                statusCode: 404,
                code: 'INTERVIEW_NOT_FOUND'
            })
        })

        it("should produce error when sender is unauthorized", async () => {
            const senderId = "user-1"
            const receiverId = "user-2"
            const interviewId = "interview-1"
            const data:CreateInviteData = {
                role: "INTERVIEWER"
            }

            mockInterviewRepository.findById.mockResolvedValue({
                id: interviewId,
                createdById: "user-3",
                status: "SCHEDULED"
            })

            await expect(service.createInvite(senderId, receiverId, interviewId, data)).rejects.toMatchObject({
                message: "Unauthorized",
                statusCode: 403,
                code: 'UNAUTHORIZED'
            })
        })

        it("should produce error when interview doesnt have a SCHEDULED status", async () => {
            const senderId = "user-1"
            const receiverId = "user-2"
            const interviewId = "interview-1"
            const data:CreateInviteData = {
                role: "INTERVIEWER"
            }

            mockInterviewRepository.findById.mockResolvedValue({
                id: interviewId,
                createdById: "user-3",
                status: "DRAFT"
            })

            await expect(service.createInvite(senderId, receiverId, interviewId, data)).rejects.toMatchObject({
                message: "Invites can only be sent for scheduled interviews",
                statusCode: 400,
                code: "INVALID_INTERVIEW_STATUS"
            })
        })

        it("should produce error when receiver is not found", async () => {
            const senderId = "user-1"
            const receiverId = "user-2"
            const interviewId = "interview-1"
            const data:CreateInviteData = {
                role: "INTERVIEWER"
            }

            mockInterviewRepository.findById.mockResolvedValue({
                id: interviewId,
                createdById: senderId,
                status: "SCHEDULED"
            })

            mockUserRepository.findById.mockResolvedValue(null)

            await expect(service.createInvite(senderId, receiverId, interviewId, data)).rejects.toMatchObject({
                message: "Receiver Not Found",
                statusCode: 404,
                code: "RECEIVER_NOT_FOUND"
            })
        })

        it("should produce error when user is already a participant", async () => {
            const senderId = "user-1"
            const receiverId = "user-2"
            const interviewId = "interview-1"
            const data:CreateInviteData = {
                role: "INTERVIEWER"
            }

            mockInterviewRepository.findById.mockResolvedValue({
                id: interviewId,
                createdById: senderId,
                status: "SCHEDULED"
            })
            mockUserRepository.findById.mockResolvedValue({
                id: receiverId
            })
            mockParticipantRepository.findParticipant.mockResolvedValue({
                userId: receiverId
            })

            await expect(service.createInvite(senderId, receiverId, interviewId, data)).rejects.toMatchObject({
                message: "User is Already a Participant",
                statusCode: 409,
                code: "USER_ALREADY_PARTICIPANT"
            })
        })

        it("should produce error when invite already exists to the same user for the same interview", async () => {
            const senderId = "user-1"
            const receiverId = "user-2"
            const interviewId = "interview-1"
            const data:CreateInviteData = {
                role: "INTERVIEWER"
            }

            mockInterviewRepository.findById.mockResolvedValue({
                id: interviewId,
                createdById: senderId,
                status: "SCHEDULED"
            })
            mockUserRepository.findById.mockResolvedValue({
                id: receiverId
            })
            mockParticipantRepository.findParticipant.mockResolvedValue(null)
            mockInviteRepository.findByInterviewAndReceiver.mockResolvedValue({
                receiverId,
                interviewId
            })

            await expect(service.createInvite(senderId, receiverId, interviewId, data)).rejects.toMatchObject({
                message: "Invite Already Exists",
                statusCode: 409,
                code: "INVITE_ALREADY_EXISTS"
            })
        })
    })

    describe("acceptInvite", () => {
        it("should update the invite and create a participant", async () => {
            const inviteId = "invite-1";
            const receiverId = "user-2";
            const interviewId = "interview-1";

            const fakeTx = {};

            const invite = {
                id: inviteId,
                receiverId,
                interviewId,
                role: "CANDIDATE",
                status: InviteStatus.PENDING,
            };

            const updatedInvite = {
                ...invite,
                status: InviteStatus.ACCEPTED,
            };

            const createdParticipant = {
                id: "participant-1",
                userId: receiverId,
                interviewId,
                role: invite.role,
            };

            mockInviteRepository.findById.mockResolvedValue(invite);

            mockInviteRepository.updateInviteStatus.mockResolvedValue(
                updatedInvite
            );

            mockParticipantRepository.createParticipant.mockResolvedValue(
                createdParticipant
            );

            vi.mocked(prisma.$transaction).mockImplementation(
                async (callback: any) => {
                    return callback(fakeTx);
                }
            );

            const result = await service.acceptInvite(
                inviteId,
                receiverId
            );

            expect(mockInviteRepository.updateInviteStatus)
                .toHaveBeenCalledWith(
                    inviteId,
                    InviteStatus.ACCEPTED,
                    expect.any(Date),
                    fakeTx
                );

            expect(mockParticipantRepository.createParticipant)
                .toHaveBeenCalledWith(
                    receiverId,
                    interviewId,
                    {
                        role: invite.role
                    },
                    fakeTx
                );

            expect(result).toEqual({
                invite: updatedInvite,
                participant: createdParticipant
            });
        });

        it("should produce error when invite doesnt exist", async () => {
            const inviteId = "invite-1";
            const receiverId = "user-2";
            const interviewId = "interview-1";

            const fakeTx = {};

            mockInviteRepository.findById.mockResolvedValue(null);


            await expect(service.acceptInvite(inviteId, receiverId)).rejects.toMatchObject({
                message: "Invite Not Found",
                statusCode: 404,
                code: "INVITE_NOT_FOUND"
            })
        })

        it("should produce error when the accepter is not matching the intended receiver", async () => {
            const inviteId = "invite-1";
            const receiverId = "user-2";
            const interviewId = "interview-1";

            const fakeTx = {};
            const invite = {
                id: inviteId,
                receiverId:"user-3",
                interviewId
            }

            mockInviteRepository.findById.mockResolvedValue(invite);


            await expect(service.acceptInvite(inviteId, receiverId)).rejects.toMatchObject({
                message: "Unauthorized",
                statusCode: 403,
                code: "UNAUTHORIZED"
            })
        })

        it("should produce error when invite status is not pending", async () => {
            const inviteId = "invite-1";
            const receiverId = "user-2";
            const interviewId = "interview-1";
            const invite = {
                id: inviteId,
                receiverId,
                interviewId,
                status: "DECLINED"
            }

            const fakeTx = {};

            mockInviteRepository.findById.mockResolvedValue(invite);


            await expect(service.acceptInvite(inviteId, receiverId)).rejects.toMatchObject({
                message: "Invite Status Not Pending",
                statusCode: 400,
                code: "INVITE_NOT_PENDING"
            })
        })

        it("should fail when participant creation fails", async () => {
            const inviteId = "invite-1";
            const receiverId = "user-2";
            const interviewId = "interview-1";

            const fakeTx = {};

            const invite = {
                id: inviteId,
                receiverId,
                interviewId,
                role: "CANDIDATE",
                status: InviteStatus.PENDING
            };

            mockInviteRepository.findById.mockResolvedValue(invite);

            mockInviteRepository.updateInviteStatus.mockResolvedValue({
                ...invite,
                status: InviteStatus.ACCEPTED
            });

            mockParticipantRepository.createParticipant.mockRejectedValue(
                new Error("Participant creation failed")
            );

            vi.mocked(prisma.$transaction).mockImplementation(
                async (callback: any) => {
                    return callback(fakeTx);
                }
            );

            await expect(
                service.acceptInvite(inviteId, receiverId)
            ).rejects.toThrow("Participant creation failed");
        });
    })

    describe("declineInvite", () => {
        it("should update the invite status to DECLINED", async () => {
            const inviteId = "invite-1";
            const receiverId = "user-2";
            const interviewId = "interview-1";

            const invite = {
                id: inviteId,
                receiverId,
                interviewId,
                status: InviteStatus.PENDING
            };

            const declinedInvite = {
                ...invite,
                status: InviteStatus.DECLINED
            };

            mockInviteRepository.findById.mockResolvedValue(invite);

            mockInviteRepository.updateInviteStatus.mockResolvedValue(
                declinedInvite
            );

            const result = await service.declineInvite(
                inviteId,
                receiverId
            );

            expect(mockInviteRepository.findById)
                .toHaveBeenCalledWith(inviteId);

            expect(mockInviteRepository.updateInviteStatus)
                .toHaveBeenCalledWith(
                    inviteId,
                    InviteStatus.DECLINED,
                    new Date()
                );

            expect(result).toEqual(declinedInvite);
        });

        it("should produce error when invite not found", async () => {
            const inviteId = "invite-1";
            const receiverId = "user-2";
            const interviewId = "interview-1";

            mockInviteRepository.findById.mockResolvedValue(null)

            await expect(service.declineInvite(inviteId, receiverId)).rejects.toMatchObject({
                message: "Invite Not Found",
                statusCode: 404,
                code: "INVITE_NOT_FOUND"
            })

            expect(mockInviteRepository.updateInviteStatus).not.toHaveBeenCalled()
        })

        it("should produce error when the accepter is not matching the intended receiver", async () => {
            const inviteId = "invite-1";
            const receiverId = "user-2";
            const interviewId = "interview-1";

            const fakeTx = {};
            const invite = {
                id: inviteId,
                receiverId:"user-3",
                interviewId
            }

            mockInviteRepository.findById.mockResolvedValue(invite);


            await expect(service.acceptInvite(inviteId, receiverId)).rejects.toMatchObject({
                message: "Unauthorized",
                statusCode: 403,
                code: "UNAUTHORIZED"
            })
        })

        it("should produce error when invite status is not pending", async () => {
            const inviteId = "invite-1";
            const receiverId = "user-2";
            const interviewId = "interview-1";
            const invite = {
                id: inviteId,
                receiverId,
                interviewId,
                status: "DECLINED"
            }

            const fakeTx = {};

            mockInviteRepository.findById.mockResolvedValue(invite);


            await expect(service.acceptInvite(inviteId, receiverId)).rejects.toMatchObject({
                message: "Invite Status Not Pending",
                statusCode: 400,
                code: "INVITE_NOT_PENDING"
            })
        })
    });

    describe("cancelInvite", () => {
        it("should update the status to be CANCELLED", async() => {
            const inviteId = "invite-1";
            const senderId = "user-2";
            
            mockInviteRepository.findById.mockResolvedValue({
                id: inviteId,
                senderId,
                status: "PENDING"
            })

            mockInviteRepository.updateInviteStatus.mockResolvedValue({
                id: inviteId,
                senderId,
                status: "CANCELLED"
            })
            const result = await service.cancelInvite(inviteId, senderId)

            expect(mockInviteRepository.findById).toHaveBeenCalledWith(inviteId)
            expect(mockInviteRepository.updateInviteStatus).toHaveBeenCalledWith(inviteId, "CANCELLED")

            expect(result).toMatchObject({
                id: inviteId,
                senderId,
                status: "CANCELLED"
            })
        })

        it("should produce error when invite not found", async () => {
            const inviteId = "invite-1";
            const receiverId = "user-2";
            const interviewId = "interview-1";

            mockInviteRepository.findById.mockResolvedValue(null)

            await expect(service.declineInvite(inviteId, receiverId)).rejects.toMatchObject({
                message: "Invite Not Found",
                statusCode: 404,
                code: "INVITE_NOT_FOUND"
            })

            expect(mockInviteRepository.updateInviteStatus).not.toHaveBeenCalled()
        })

        it("should produce error when the accepter is not matching the intended receiver", async () => {
            const inviteId = "invite-1";
            const receiverId = "user-2";
            const interviewId = "interview-1";

            const fakeTx = {};
            const invite = {
                id: inviteId,
                receiverId:"user-3",
                interviewId
            }

            mockInviteRepository.findById.mockResolvedValue(invite);


            await expect(service.acceptInvite(inviteId, receiverId)).rejects.toMatchObject({
                message: "Unauthorized",
                statusCode: 403,
                code: "UNAUTHORIZED"
            })
        })

        it("should produce error when invite status is not pending", async () => {
            const inviteId = "invite-1";
            const receiverId = "user-2";
            const interviewId = "interview-1";
            const invite = {
                id: inviteId,
                receiverId,
                interviewId,
                status: "DECLINED"
            }

            const fakeTx = {};

            mockInviteRepository.findById.mockResolvedValue(invite);


            await expect(service.acceptInvite(inviteId, receiverId)).rejects.toMatchObject({
                message: "Invite Status Not Pending",
                statusCode: 400,
                code: "INVITE_NOT_PENDING"
            })
        })
    })
})