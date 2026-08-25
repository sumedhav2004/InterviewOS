export type createInterviewData = {
    title: string,
    description : string,
    scheduledAt: Date,
    durationMinutes: number,
}

export type updateInterviewData = {
    title?: string,
    description?: string,
    scheduledAt?: Date,
    durationMinutes?: number,
}
