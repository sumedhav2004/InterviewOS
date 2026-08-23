import {beforeEach, describe, expect, it, vi} from "vitest"

import { CreateParticipantData } from "../../../src/types/participant"
import { InterviewParticipantService } from "../../../src/services/interviewParticipant.service";

describe("participantService", () => {

    const mockParticipantRepository = {
        createParticipant: vi.fn(),
        updateParticipant: vi.fn(),
        getParticipantsForInterview: vi.fn(),
        findParticipantsForInterview: vi.fn(),
        findParticipant: vi.fn()
    }
    const mockInterviewRepository = {
        findById: vi.fn(),
    };

    const mockUserRepository = {
        findById: vi.fn(),
    };
    let service: InterviewParticipantService

    beforeEach(() => {
        vi.clearAllMocks();
        service = new InterviewParticipantService(
            mockParticipantRepository as any,
            mockInterviewRepository as any,
            mockUserRepository as any
        );
    });

    describe("createParticipant", () => {

        it("should create a new participant", async () => {
            const interviewId = "interview-1";
            const targetId = "user-1";
            const requesterId = "user-2";

            const data: CreateParticipantData = {
                role: "INTERVIEWER"
            };

            const createdParticipant = {
                id: "participant-1",
                role: "INTERVIEWER",
                userId: targetId,
                interviewId
            };

            mockInterviewRepository.findById.mockResolvedValue({
                id: interviewId,
                createdById: requesterId
            });

            mockUserRepository.findById.mockResolvedValue({
                id: targetId
            });

            mockParticipantRepository.findParticipant.mockResolvedValue(null);

            mockParticipantRepository.createParticipant
                .mockResolvedValue(createdParticipant);

            const result = await service.createParticipant(
                requesterId,
                targetId,
                interviewId,
                data
            );

            expect(mockInterviewRepository.findById)
                .toHaveBeenCalledWith(interviewId);

            expect(mockUserRepository.findById)
                .toHaveBeenCalledWith(targetId);

            expect(mockParticipantRepository.findParticipant)
                .toHaveBeenCalledWith(interviewId, targetId);

            expect(mockParticipantRepository.createParticipant)
                .toHaveBeenCalledWith(targetId, interviewId, data);

            expect(result).toEqual(createdParticipant);
        });


        it("should produce error if interview not found", async () => {
            const interviewId = "interview-1";
            const targetId = "user-2";
            const requesterId = "user-1";

            mockInterviewRepository.findById.mockResolvedValue(null);

            await expect(
                service.createParticipant(
                    requesterId,
                    targetId,
                    interviewId,
                    {
                        role: "INTERVIEWER"
                    }
                )
            ).rejects.toMatchObject({
                message: "Interview Not Found",
                statusCode: 404,
                code: "INTERVIEW_NOT_FOUND"
            });

            expect(
                mockParticipantRepository.createParticipant
            ).not.toHaveBeenCalled();
        });

        it("should produce error if interview not created by the requester", async () => {
            const interviewId = "interview-1";
            const targetId = "user-2";
            const requesterId = "user-1";

            mockInterviewRepository.findById.mockResolvedValue({
                interviewId,
                createdById: "user-2"
            });

            await expect(
                service.createParticipant(
                    requesterId,
                    targetId,
                    interviewId,
                    {
                        role: "INTERVIEWER"
                    }
                )
            ).rejects.toMatchObject({
                message: "Unauthorized",
                statusCode: 403,
                code: "UNAUTHORIZED"
            });

            expect(
                mockParticipantRepository.createParticipant
            ).not.toHaveBeenCalled();
        });

        it("should produce error if interview not found", async () => {
            const interviewId = "interview-1";
            const targetId = "user-2";
            const requesterId = "user-1";

            mockInterviewRepository.findById.mockResolvedValue({
                interviewId,
                createdById: requesterId
            })
            mockUserRepository.findById.mockResolvedValue(null);

            await expect(
                service.createParticipant(
                    requesterId,
                    targetId,
                    interviewId,
                    {
                        role: "INTERVIEWER"
                    }
                )
            ).rejects.toMatchObject({
                message: "User Not Found",
                statusCode: 404,
                code: "USER_NOT_FOUND"
            });

            expect(
                mockParticipantRepository.createParticipant
            ).not.toHaveBeenCalled();
        });

        it("should produce error if interview not found", async () => {
            const interviewId = "interview-1";
            const targetId = "user-2";
            const requesterId = "user-1";

            mockInterviewRepository.findById.mockResolvedValue({
                interviewId,
                createdById: requesterId
            })
            mockUserRepository.findById.mockResolvedValue({
                id: requesterId
            });
            mockParticipantRepository.findParticipant.mockResolvedValue({
                interviewId,
                userId: targetId
            })

            await expect(
                service.createParticipant(
                    requesterId,
                    targetId,
                    interviewId,
                    {
                        role: "INTERVIEWER"
                    }
                )
            ).rejects.toMatchObject({
                message: "User is already a participant",
                statusCode: 409,
                code: "PARTICIPANT_ALREADY_EXISTS"
            });

            expect(
                mockParticipantRepository.createParticipant
            ).not.toHaveBeenCalled();
        });
    })

    describe("updateParticipant", () => {
        it("should update the participant", async () => {
            const interviewId = "interview-1"
            const requesterId = "user-1"
            const targetId = "user-2"
            
            const data: CreateParticipantData = {
                role: "INTERVIEWER"
            };

            const updatedParticipant = {
                id: "participant-1",
                role: "INTERVIEWER",
                userId: targetId,
                interviewId
            };

            mockInterviewRepository.findById.mockResolvedValue({
                id: interviewId,
                createdById: requesterId
            })

            mockParticipantRepository.findParticipant.mockResolvedValue({
                id: "participant-1",
                role: "OBSERVER",
                userId: targetId,
                interviewId,
            })
            mockParticipantRepository.updateParticipant.mockResolvedValue(updatedParticipant)

            const result = await service.updateParticipant(requesterId, targetId, interviewId, data)

            expect(mockInterviewRepository.findById).toHaveBeenCalledWith(interviewId)
            expect(mockParticipantRepository.findParticipant).toHaveBeenCalledWith(interviewId, targetId)
            expect(result).toMatchObject(updatedParticipant)
        })

        it("should produce error when interview doesnt exist", async() =>{
            const interviewId = "interview-1"
            const requesterId = "user-1"
            const targetId = "user-2"
            
            const data: CreateParticipantData = {
                role: "INTERVIEWER"
            };

            const updatedParticipant = {
                id: "participant-1",
                role: "INTERVIEWER",
                userId: targetId,
                interviewId
            };

            mockInterviewRepository.findById.mockResolvedValue(null)
            await expect(service.updateParticipant(requesterId, targetId, interviewId, data)).rejects.toMatchObject({
                message: "Interview Not Found",
                statusCode: 404,
                code: "INTERVIEW_NOT_FOUND"
            })
        })

        it("should produce error when interview is not owned by the requester", async() =>{
            const interviewId = "interview-1"
            const requesterId = "user-1"
            const targetId = "user-2"
            
            const data: CreateParticipantData = {
                role: "INTERVIEWER"
            };

            const updatedParticipant = {
                id: "participant-1",
                role: "INTERVIEWER",
                userId: targetId,
                interviewId
            };

            mockInterviewRepository.findById.mockResolvedValue({
                id: interviewId,
                createdById: "user-2"
            })
            await expect(service.updateParticipant(requesterId, targetId, interviewId, data)).rejects.toMatchObject({
                message: "Unauthorized",
                statusCode: 403,
                code: "UNAUTHORIZED"
            })
        })

        it("should produce error when participant is not found", async() =>{
            const interviewId = "interview-1"
            const requesterId = "user-1"
            const targetId = "user-2"
            
            const data: CreateParticipantData = {
                role: "INTERVIEWER"
            };

            const updatedParticipant = {
                id: "participant-1",
                role: "INTERVIEWER",
                userId: targetId,
                interviewId
            };

            mockInterviewRepository.findById.mockResolvedValue({
                id: interviewId,
                createdById: "user-1"
            })
            mockParticipantRepository.findParticipant.mockResolvedValue(null)
            await expect(service.updateParticipant(requesterId, targetId, interviewId, data)).rejects.toMatchObject({
                message: "Participant Not Found",
                statusCode: 404,
                code: "PARTICIPANT_NOT_FOUND"
            })
        })
    })

    describe("getParticipantsForInterview", () => {
        it("should give all the participants in an interview", async () => {
            const interviewId = "interview-1"
            const userId = "user-1"

            mockInterviewRepository.findById.mockResolvedValue({
                id: interviewId,
                createdById: userId
            })

            const participants = [
                {
                    id: "participant-1",
                    userId,
                    interviewId
                },{
                    id: "participant-2",
                    userId: "user-2",
                    interviewId
                }
            ]

            mockParticipantRepository.findParticipant.mockResolvedValue(participants[0])
            mockParticipantRepository.findParticipantsForInterview.mockResolvedValue(participants)

            const result = await service.getParticipantsForInterview(interviewId, userId)

            expect(mockInterviewRepository.findById).toHaveBeenCalledWith(interviewId)
            expect(mockParticipantRepository.findParticipant).toHaveBeenCalledWith(userId,interviewId)
            expect(result).toEqual(participants)
        })
    })
})