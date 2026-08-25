import { QuestionDifficulty } from "@interview-os/database"

export type createQuestionData = {
    title: string
    description: string
    difficulty: QuestionDifficulty
}

export type updateQuestionData = {
    title?: string
    description?: string
    difficulty?: QuestionDifficulty
}