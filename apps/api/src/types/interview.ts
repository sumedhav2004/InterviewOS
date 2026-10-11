import { ParticipantRole, ProgrammingLanguage } from "@interview-os/database"

export type createInterviewData = {
    title: string,
    description : string,
    scheduledAt?: Date,
    durationMinutes: number,
    createdAs: ParticipantRole
}

export type updateInterviewData = {
    title?: string,
    description?: string,
    scheduledAt?: Date,
    durationMinutes?: number,
    language?: ProgrammingLanguage
}
