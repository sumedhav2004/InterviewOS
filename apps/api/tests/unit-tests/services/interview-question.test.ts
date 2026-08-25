import {beforeAll, beforeEach, describe, expect, it, vi} from "vitest"
import { InterviewQuestionService } from "../../../src/services/interview-question.service"
import { CreateInterviewQuestionData, UpdateInterviewQuestionData } from "../../../src/types/interviewQuestion"
import { InterviewStatus, ParticipantRole } from "@interview-os/database"

describe("InterviewQuestion", () => {
    const mockInterviewQuestionRepository = {
        findById: vi.fn(),
        findInterviewQuestion: vi.fn(),
        createInterviewQuestion: vi.fn(),
        updateInterviewQuestion: vi.fn(),
        deleteInterviewQuestion: vi.fn(),
        findByInterview: vi.fn()
    }

    const mockInterviewRepository = { 
        findById: vi.fn()
    }

    const mockQuestionRepository = {
        findById: vi.fn()
    }

    const mockParticipantRepository = {
        findParticipant: vi.fn(),
        findById: vi.fn()
    }

    let service : InterviewQuestionService
    beforeEach(() => {
        vi.clearAllMocks()
        service = new InterviewQuestionService(
            mockInterviewQuestionRepository as any,
            mockInterviewRepository as any,
            mockQuestionRepository as any,
            mockParticipantRepository as any
        )
    })

    describe("findById", () => {
        it("should return the InterviewQuestion based on id", async() => {
            const interviewQuestionId = "interview-question-1"

            mockInterviewQuestionRepository.findById.mockResolvedValue({
                id: interviewQuestionId,
            })
            const result = await service.findById(interviewQuestionId)

            expect(mockInterviewQuestionRepository.findById).toHaveBeenCalledWith(interviewQuestionId)
            expect(result).toMatchObject({
                id: interviewQuestionId
            })
        })
    })

    describe("findByInterview", () =>{
        it("return all InterviewQuestions by the interview", async() => {
            const interviewId = "interview-1"
            mockInterviewRepository.findById.mockResolvedValue({
                id: interviewId
            })

            mockInterviewQuestionRepository.findByInterview.mockResolvedValue([
                {
                    interviewId,
                    id: "interview-question-1"
                },{
                    interviewId,
                    id: "interview-question-2"
                }
            ])

            const result = await service.findByInterview(interviewId)

            expect(mockInterviewRepository.findById).toHaveBeenCalledWith(interviewId)
            expect(mockInterviewQuestionRepository.findByInterview).toHaveBeenCalledWith(interviewId)

            expect(result).toEqual([
                {
                    interviewId,
                    id: "interview-question-1"
                },{
                    interviewId,
                    id: "interview-question-2"
                }
            ])
        })
        it("should throw error if interview not found", async() => {
            const interviewId = "interview-1"
            mockInterviewRepository.findById.mockResolvedValue(null)

            await expect(service.findByInterview(interviewId)).rejects.toMatchObject({
                message: "Interview Not Found",
                statusCode: 404,
                code: "INTERVIEW_NOT_FOUND"
            })
            
        })
    })

    describe("findInterviewQuestion", () =>{
        it("should find the interviewQuestion based on interview and question", async() => {
            const interviewId = "interview-1"
            const questionId = "question-1"

            mockInterviewRepository.findById.mockResolvedValue({
                id: interviewId
            })
            mockQuestionRepository.findById.mockResolvedValue({
                id: questionId
            })
            mockInterviewQuestionRepository.findInterviewQuestion.mockResolvedValue({
                id: "interview-question-1",
                interviewId,
                questionId
            })

            const result = await service.findInterviewQuestion(interviewId, questionId)

            expect(mockInterviewRepository.findById).toHaveBeenCalledWith(interviewId)
            expect(mockQuestionRepository.findById).toHaveBeenCalledWith(questionId)
            expect(result).toMatchObject({
                questionId,
                interviewId,
                id: "interview-question-1"
            })
        })
        it("should throw error if interview not found", async() => {
            const interviewId = "interview-1"
            const questionId = "question-1"
            mockInterviewRepository.findById.mockResolvedValue(null)

            await expect(service.findInterviewQuestion(interviewId, questionId)).rejects.toMatchObject({
                message: "Interview Not Found",
                statusCode: 404,
                code: "INTERVIEW_NOT_FOUND"
            })
            
        })
        it("should throw error if question not found", async() => {
            const interviewId = "interview-1"
            const questionId = "question-1"
            mockInterviewRepository.findById.mockResolvedValue({
                id: interviewId
            })
            mockQuestionRepository.findById.mockResolvedValue(null)

            await expect(service.findInterviewQuestion(interviewId, questionId)).rejects.toMatchObject({
                message: "Question Not Found",
                statusCode: 404,
                code: "QUESTION_NOT_FOUND"
            })
            
        })
    })

    describe("createInterviewQuestion", () => {
        it("should create an interview question", async() => {
            const interviewId = "interview-1"
            const questionId = "question-1"
            const requesterId = "user-1"
            const data: CreateInterviewQuestionData = {
                questionOrder: 1,
                points: 10
            }

            mockInterviewRepository.findById.mockResolvedValue({
                id: interviewId,
                status: "DRAFT"
            })
            mockParticipantRepository.findParticipant.mockResolvedValue({
                id: "participant-1",
                userId: requesterId,
                interviewId,
                role: "INTERVIEWER"
            })
            mockQuestionRepository.findById.mockResolvedValue({
                id: questionId
            })
            mockInterviewQuestionRepository.findInterviewQuestion.mockResolvedValue(null)
            mockInterviewQuestionRepository.findByInterview.mockResolvedValue([])
            mockInterviewQuestionRepository.createInterviewQuestion.mockResolvedValue({
                id: "interview-question-1",
                interviewId,
                questionId,
                ...data
            })

            const result = await service.createInterviewQuestion(interviewId,questionId,requesterId,data)

            expect(mockInterviewRepository.findById).toHaveBeenCalledWith(interviewId)
            expect(mockParticipantRepository.findParticipant).toHaveBeenCalledWith(interviewId, requesterId)
            expect(mockQuestionRepository.findById).toHaveBeenCalledWith(questionId)
            expect(mockInterviewQuestionRepository.findInterviewQuestion).toHaveBeenCalledWith(interviewId, questionId)
            expect(mockInterviewQuestionRepository.findByInterview).toHaveBeenCalledWith(interviewId)
            expect(mockInterviewQuestionRepository.createInterviewQuestion).toHaveBeenCalledWith(interviewId,questionId,data)
            expect(result).toMatchObject({
                id: "interview-question-1",
                interviewId,
                questionId,
                ...data
            })
        })
        it("should produce error when interview doesnt exist", async() => {
            const interviewId = "interview-1"
            const questionId = "question-1"
            const requesterId = "user-1"
            const data: CreateInterviewQuestionData = {
                questionOrder: 1,
                points: 10
            }

            mockInterviewRepository.findById.mockResolvedValue(null)

            await expect(service.createInterviewQuestion(interviewId,questionId,requesterId,data)).rejects.toMatchObject({
                message: "Interview Not Found",
                statusCode: 404,
                code: "INTERVIEW_NOT_FOUND"
            })
        })
        it("should produce error when question doesnt exist", async() => {
            const interviewId = "interview-1"
            const questionId = "question-1"
            const requesterId = "user-1"
            const data: CreateInterviewQuestionData = {
                questionOrder: 1,
                points: 10
            }

            mockInterviewRepository.findById.mockResolvedValue({
                id: interviewId
            })
            mockParticipantRepository.findParticipant.mockResolvedValue({
                id: "participant-1",
                interviewId,
                userId: requesterId,
                role: ParticipantRole.INTERVIEWER
            })
            mockQuestionRepository.findById.mockResolvedValue(null)

            await expect(service.createInterviewQuestion(interviewId,questionId,requesterId,data)).rejects.toMatchObject({
                message: "Question Not Found",
                statusCode: 404,
                code: "QUESTION_NOT_FOUND"
            })
        })
        it("should produce error when question doesnt exist", async() => {
            const interviewId = "interview-1"
            const questionId = "question-1"
            const requesterId = "user-1"
            const data: CreateInterviewQuestionData = {
                questionOrder: 1,
                points: 10
            }

            mockInterviewRepository.findById.mockResolvedValue({
                id: interviewId
            })
            mockParticipantRepository.findParticipant.mockResolvedValue({
                id: "participant-1",
                interviewId,
                userId: requesterId,
                role: ParticipantRole.CANDIDATE
            })

            await expect(service.createInterviewQuestion(interviewId,questionId,requesterId,data)).rejects.toMatchObject({
                message: "Unauthorized",
                statusCode: 403,
                code: "UNAUTHORIZED"
            })
        })
        it("should produce error when interview status is not right", async() => {
            const interviewId = "interview-1"
            const questionId = "question-1"
            const requesterId = "user-1"
            const data: CreateInterviewQuestionData = {
                questionOrder: 1,
                points: 10
            }

            mockInterviewRepository.findById.mockResolvedValue({
                id: interviewId,
                status: InterviewStatus.COMPLETED
            })
            mockParticipantRepository.findParticipant.mockResolvedValue({
                id: "participant-1",
                interviewId,
                userId: requesterId,
                role: ParticipantRole.INTERVIEWER
            })
            mockQuestionRepository.findById.mockResolvedValue({
                id: questionId
            })

            await expect(service.createInterviewQuestion(interviewId,questionId,requesterId,data)).rejects.toMatchObject({
                message: "Question Cannot be Added in the current state",
                statusCode: 400,
                code: "QUESTION_CANT_BE_ADDED"
            })
        })
        it("should produce error when interview status is not right", async() => {
            const interviewId = "interview-1"
            const questionId = "question-1"
            const requesterId = "user-1"
            const data: CreateInterviewQuestionData = {
                questionOrder: 1,
                points: 10
            }

            mockInterviewRepository.findById.mockResolvedValue({
                id: interviewId,
                status: InterviewStatus.INPROGRESS
            })
            mockParticipantRepository.findParticipant.mockResolvedValue({
                id: "participant-1",
                interviewId,
                userId: requesterId,
                role: ParticipantRole.INTERVIEWER
            })
            mockQuestionRepository.findById.mockResolvedValue({
                id: questionId
            })
            mockInterviewQuestionRepository.findInterviewQuestion.mockResolvedValue({
                id: "interview-question-1",
                interviewId,
                questionId
            })

            await expect(service.createInterviewQuestion(interviewId,questionId,requesterId,data)).rejects.toMatchObject({
                message: "Question Already Added",
                statusCode: 409,
                code: "QUESTION_ALREADY_ADDED"
            })
        })

        it("should produce error when question order is not right", async() => {
            const interviewId = "interview-1"
            const questionId = "question-1"
            const requesterId = "user-1"
            const data: CreateInterviewQuestionData = {
                questionOrder: 3,
                points: 10
            }

            mockInterviewRepository.findById.mockResolvedValue({
                id: interviewId,
                status: InterviewStatus.INPROGRESS
            })
            mockParticipantRepository.findParticipant.mockResolvedValue({
                id: "participant-1",
                interviewId,
                userId: requesterId,
                role: ParticipantRole.INTERVIEWER
            })
            mockQuestionRepository.findById.mockResolvedValue({
                id: questionId
            })
            mockInterviewQuestionRepository.findInterviewQuestion.mockResolvedValue(null)

            await expect(service.createInterviewQuestion(interviewId,questionId,requesterId,data)).rejects.toMatchObject({
                message: "Invalid Order",
                statusCode: 400,
                code: "INVALID_ORDER"
            })
        })
        it("should produce error when question points is not right", async() => {
            const interviewId = "interview-1"
            const questionId = "question-1"
            const requesterId = "user-1"
            const data: CreateInterviewQuestionData = {
                questionOrder: 1,
                points: 0
            }

            mockInterviewRepository.findById.mockResolvedValue({
                id: interviewId,
                status: InterviewStatus.INPROGRESS
            })
            mockParticipantRepository.findParticipant.mockResolvedValue({
                id: "participant-1",
                interviewId,
                userId: requesterId,
                role: ParticipantRole.INTERVIEWER
            })
            mockQuestionRepository.findById.mockResolvedValue({
                id: questionId
            })
            mockInterviewQuestionRepository.findInterviewQuestion.mockResolvedValue(null)

            await expect(service.createInterviewQuestion(interviewId,questionId,requesterId,data)).rejects.toMatchObject({
                message: "Invalid Points",
                statusCode: 400,
                code: "INVALID_POINTS"
            })
        })
    })

    describe("updateInterviewQuestion", () => {
        it("should update an interview question", async() => {
            const interviewId = "interview-1"
            const questionId = "question-1"
            const requesterId = "user-1"
            const interviewQuestionId = "interview-question-1"
            const data: UpdateInterviewQuestionData = {
                points: 10
            }

            mockInterviewRepository.findById.mockResolvedValue({
                id: interviewId,
                status: "DRAFT"
            })
            mockParticipantRepository.findParticipant.mockResolvedValue({
                id: "participant-1",
                userId: requesterId,
                interviewId,
                role: "INTERVIEWER"
            })
            mockInterviewQuestionRepository.findById.mockResolvedValue({
                id:interviewQuestionId,
                interviewId,
                questionId,
                points: 20
            })
            mockInterviewQuestionRepository.updateInterviewQuestion.mockResolvedValue({
                id: interviewQuestionId,
                interviewId,
                questionId,
                ...data
            })

            const result = await service.updateInterviewQuestion(interviewQuestionId,interviewId,questionId,requesterId,data)

            expect(mockInterviewRepository.findById).toHaveBeenCalledWith(interviewId)
            expect(mockParticipantRepository.findParticipant).toHaveBeenCalledWith(interviewId, requesterId)
            expect(mockInterviewQuestionRepository.findById).toHaveBeenCalledWith(interviewQuestionId)
            expect(mockInterviewQuestionRepository.updateInterviewQuestion).toHaveBeenCalledWith(interviewQuestionId,data)
            expect(result).toMatchObject({
                id: interviewQuestionId,
                interviewId,
                questionId,
                ...data
            })
        })
        it("should produce error when interview doesnt exist", async() => {
            const interviewQuestionId = "interview-question-1"
            const interviewId = "interview-1"
            const questionId = "question-1"
            const requesterId = "user-1"
            const data: UpdateInterviewQuestionData = {
                points: 10
            }

            mockInterviewRepository.findById.mockResolvedValue(null)

            await expect(service.updateInterviewQuestion(interviewQuestionId,interviewId,questionId,requesterId,data)).rejects.toMatchObject({
                message: "Interview Not Found",
                statusCode: 404,
                code: "INTERVIEW_NOT_FOUND"
            })
        })
        // it("should produce error when question doesnt exist", async() => {
        //     const interviewQuestionId = "interview-question-1"
        //     const interviewId = "interview-1"
        //     const questionId = "question-1"
        //     const requesterId = "user-1"
        //     const data: UpdateInterviewQuestionData = {
        //         points: 10
        //     }

        //     mockInterviewRepository.findById.mockResolvedValue({
        //         id: interviewId
        //     })
        //     mockParticipantRepository.findParticipant.mockResolvedValue({
        //         id: "participant-1",
        //         interviewId,
        //         userId: requesterId,
        //         role: ParticipantRole.INTERVIEWER
        //     })

        //     await expect(service.updateInterviewQuestion(interviewQuestionId,interviewId,questionId,requesterId,data)).rejects.toMatchObject({
        //         message: "Question Not Found",
        //         statusCode: 404,
        //         code: "QUESTION_NOT_FOUND"
        //     })
        // })
        it("should produce error when question doesnt exist", async() => {
            const id = "interview-question-1"
            const interviewId = "interview-1"
            const questionId = "question-1"
            const requesterId = "user-1"
            const data: UpdateInterviewQuestionData = {
                points: 10
            }

            mockInterviewRepository.findById.mockResolvedValue({
                id: interviewId
            })
            mockParticipantRepository.findParticipant.mockResolvedValue({
                id: "participant-1",
                interviewId,
                userId: requesterId,
                role: ParticipantRole.CANDIDATE
            })

            await expect(service.updateInterviewQuestion(id,interviewId,questionId,requesterId,data)).rejects.toMatchObject({
                message: "Unauthorized",
                statusCode: 403,
                code: "UNAUTHORIZED"
            })
        })
        it("should produce error when interview status is not right", async() => {
            const id = "interview-question-1"
            const interviewId = "interview-1"
            const questionId = "question-1"
            const requesterId = "user-1"
            const data: UpdateInterviewQuestionData = {
                points: 10
            }

            mockInterviewRepository.findById.mockResolvedValue({
                id: interviewId,
                status: InterviewStatus.COMPLETED
            })
            mockParticipantRepository.findParticipant.mockResolvedValue({
                id: "participant-1",
                interviewId,
                userId: requesterId,
                role: ParticipantRole.INTERVIEWER
            })
            mockQuestionRepository.findById.mockResolvedValue({
                id: questionId
            })

            await expect(service.updateInterviewQuestion(id,interviewId,questionId,requesterId,data)).rejects.toMatchObject({
                message: "Questions cannot be modified in the current interview state",
                statusCode: 400,
                code: "QUESTION_CANNOT_BE_MODIFIED"
            })
        })

        it("should produce error when question points is not right", async() => {
            const id = "interview-question-1"
            const interviewId = "interview-1"
            const questionId = "question-1"
            const requesterId = "user-1"
            const data: UpdateInterviewQuestionData = {
                points: 0
            }

            mockInterviewRepository.findById.mockResolvedValue({
                id: interviewId,
                status: InterviewStatus.INPROGRESS
            })
            mockParticipantRepository.findParticipant.mockResolvedValue({
                id: "participant-1",
                interviewId,
                userId: requesterId,
                role: ParticipantRole.INTERVIEWER
            })
            mockQuestionRepository.findById.mockResolvedValue({
                id: questionId
            })
            mockInterviewQuestionRepository.findInterviewQuestion.mockResolvedValue(null)

            await expect(service.updateInterviewQuestion(id,interviewId,questionId,requesterId,data)).rejects.toMatchObject({
                message: "Invalid Points",
                statusCode: 400,
                code: "INVALID_POINTS"
            })
        })
    })

    describe("deleteInterviewQuestion", () => {
        it("should delete the interviewQuestion", async() => {
            const id = "interview-question-1"
            const requesterId = "user-1"
            const interviewId = "interview-1"
            const questionId = "question-1"

            mockInterviewRepository.findById.mockResolvedValue({
                id: interviewId,
                status: InterviewStatus.SCHEDULED
            })
            mockInterviewQuestionRepository.findById.mockResolvedValue({
                id,
                interviewId,
                questionId
            })
            mockParticipantRepository.findParticipant.mockResolvedValue({
                id: requesterId,
                interviewId,
                role: ParticipantRole.INTERVIEWER
            })
            mockInterviewQuestionRepository.deleteInterviewQuestion.mockResolvedValue(null)

            await service.deleteInterviewQuestion(id,requesterId,interviewId,questionId)

            expect(mockInterviewRepository.findById).toHaveBeenCalledWith(interviewId)
            expect(mockInterviewQuestionRepository.findById).toHaveBeenCalledWith(id)
            expect(mockParticipantRepository.findParticipant).toHaveBeenCalledWith(interviewId, requesterId)
            expect(mockInterviewQuestionRepository.deleteInterviewQuestion).toHaveBeenCalledWith(id)

        })
    })
})