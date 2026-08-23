import { ParticipantRole } from "@interview-os/database";

export type CreateParticipantData = {
    role: ParticipantRole,
}

export type UpdateParticipantData = {
    role?: ParticipantRole,

}