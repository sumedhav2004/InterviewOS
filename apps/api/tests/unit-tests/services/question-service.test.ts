import {beforeEach, describe, expect, it, vi} from "vitest"
import { QuestionService } from "../../../src/services/question.service"
import { QuestionDifficulty } from "@interview-os/database"

describe("QuestionService", () => {
    const mockQuestionRepository = {
        findById: vi.fn(),
        findMyQuestions: vi.fn(),
        createQuestion: vi.fn(),
        deleteQuestion: vi.fn(),
        updateQuestion: vi.fn()
    }
    const mockUserRepository = {
        findById: vi.fn()
    }

    let service : QuestionService
    beforeEach(() => {
        vi.clearAllMocks()
        service = new QuestionService(
            mockQuestionRepository as any,
            mockUserRepository as any
        )
    })

    describe("findById", () => {
        it("should return the question", async () => {
            const questionId = "question-1"

            mockQuestionRepository.findById.mockResolvedValue({
                id: questionId
            })

            const result = await service.findById(questionId)

            expect(mockQuestionRepository.findById).toHaveBeenCalledWith(questionId)
            expect(result).toMatchObject({
                id: questionId
            })
        })
    })

    describe("findMyQuestions", () => {
        it("should return all questions added by a user", async () => {
            const userId = "user-1"

            mockUserRepository.findById.mockResolvedValue({
                id: userId
            })

            mockQuestionRepository.findMyQuestions.mockResolvedValue([
                {
                    id: "question-1"
                },{
                    id: "question-2"
                }
            ])

            const result = await service.findMyQuestions(userId)

            expect(mockUserRepository.findById).toHaveBeenCalledWith(userId)
            expect(mockQuestionRepository.findMyQuestions).toHaveBeenCalledWith(userId)
            expect(result).toEqual([
                {
                    id: "question-1"
                },{
                    id: "question-2"
                }
            ])
        })

        it("should throw when user is not found", async () => {
            const userId = "user-1";

            mockUserRepository.findById.mockResolvedValue(null);

            await expect(
                service.findMyQuestions(userId)
            ).rejects.toMatchObject({
                message: "User Not Found",
                statusCode: 404,
                code: "USER_NOT_FOUND"
            });

            expect(mockQuestionRepository.findMyQuestions)
                .not.toHaveBeenCalled();
        });
    })

    describe("createQuestion", () => {
        it("should create a question", async () => {
            const userId = "user-1"
            const data = {
                title: "question1",
                description: "first question",
                difficulty: QuestionDifficulty.EASY
            }

            mockQuestionRepository.createQuestion.mockResolvedValue({
                id: "question-1",
                ...data
            })

            const result = await service.createQuestion(userId, data)

            expect(mockQuestionRepository.createQuestion).toHaveBeenCalledWith(userId, data)
            expect(result).toMatchObject({
                id: "question-1",
                ...data
            })
        })
    })

    describe("deleteQuestion", () => {
        it("should delete a question", async() => {
            const questionId = "question-1"
            const userId = "user-1"

            mockQuestionRepository.findById.mockResolvedValue({
                id: questionId,
                createdById: userId
            })
            mockQuestionRepository.deleteQuestion.mockResolvedValue(null)

            await service.deleteQuestion(questionId, userId)

            expect(mockQuestionRepository.findById).toHaveBeenCalledWith(questionId)
            expect(mockQuestionRepository.deleteQuestion).toHaveBeenCalledWith(questionId)
        })

        it("should produce error when question doesnt exist", async()=>{
            const questionId = "question-1"
            const userId = "user-1"

            mockQuestionRepository.findById.mockResolvedValue(null)

            await expect(service.deleteQuestion(questionId, userId)).rejects.toMatchObject({
                message: "Question Not Found",
                statusCode: 404,
                code: "QUESTION_NOT_FOUND"
            })
        })

        it("should produce error when question isnt created by user", async()=>{
            const questionId = "question-1"
            const userId = "user-1"

            mockQuestionRepository.findById.mockResolvedValue({
                id: questionId,
                createdById: "user-2"
            })

            await expect(service.deleteQuestion(questionId, userId)).rejects.toMatchObject({
                message: "Unauthorized",
                statusCode: 403,
                code: "UNAUTHORIZED"
            })
        })
    })

    describe("updateQuestion", () =>{
        it("should update the question", async() => {
            const questionId = "question-1"
            const userId = "user-1"
            const data = {
                title: "question1"
            }

            mockQuestionRepository.findById.mockResolvedValue({
                id: questionId,
                createdById: userId,
                title: "question2",
                description: "second question"
            })
            mockQuestionRepository.updateQuestion.mockResolvedValue({
                id: questionId,
                createdById: userId,
                description: "second question",
                ...data
            })

            const result = await service.updateQuestion(questionId,userId, data)

            expect(mockQuestionRepository.findById).toHaveBeenCalledWith(questionId)
            expect(mockQuestionRepository.updateQuestion).toHaveBeenCalledWith(questionId, data)

            expect(result).toMatchObject({
                id: questionId,
                createdById: userId,
                description:"second question",
                ...data
            })
        })

        it("should produce error when question doesnt exist", async()=>{
            const questionId = "question-1"
            const userId = "user-1"

            mockQuestionRepository.findById.mockResolvedValue(null)

            await expect(service.deleteQuestion(questionId, userId)).rejects.toMatchObject({
                message: "Question Not Found",
                statusCode: 404,
                code: "QUESTION_NOT_FOUND"
            })
        })

        it("should produce error when question isnt created by user", async()=>{
            const questionId = "question-1"
            const userId = "user-1"

            mockQuestionRepository.findById.mockResolvedValue({
                id: questionId,
                createdById: "user-2"
            })

            await expect(service.deleteQuestion(questionId, userId)).rejects.toMatchObject({
                message: "Unauthorized",
                statusCode: 403,
                code: "UNAUTHORIZED"
            })
        })
    })
})