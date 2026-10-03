import { ParticipantRole } from "@interview-os/database";


export type Participant = {
    id: string;
    interviewId: string;
    userId: string;
    role: ParticipantRole;
    status: string;
    joinedAt: string | null;
    leftAt: string | null;
};

export type ParticipantMediaState = {
    cameraEnabled: boolean;
    microphoneEnabled: boolean;
};