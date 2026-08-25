import { ParticipantRole } from "@interview-os/database"


export type CreateInviteData = {
    role: ParticipantRole
    expiresAt?: Date
}

export type UpdateInviteData = {
    role?: ParticipantRole
    expiresAt?: Date
}