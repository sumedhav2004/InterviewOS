CREATE TABLE participants (
    id UUID PRIMARY KEY,

    interview_id UUID NOT NULL,

    user_id UUID NOT NULL,

    role participant_role NOT NULL,

    status participant_status NOT NULL DEFAULT 'ACTIVE',

    joined_at TIMESTAMPTZ,

    left_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_participant_interview
        FOREIGN KEY (interview_id)
        REFERENCES interviews(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_participant_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT unique_participant
        UNIQUE (interview_id, user_id)
);

CREATE INDEX idx_participants_interview
ON participants(interview_id);

CREATE INDEX idx_participants_user
ON participants(user_id);