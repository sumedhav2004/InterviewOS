CREATE TABLE invites (
    id UUID PRIMARY KEY,

    interview_id UUID NOT NULL,

    sender_id UUID NOT NULL,

    recipient_id UUID NOT NULL,

    status invite_status NOT NULL DEFAULT 'PENDING',

    expires_at TIMESTAMPTZ,

    responded_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_invite_interview
        FOREIGN KEY (interview_id)
        REFERENCES interviews(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_invite_sender
        FOREIGN KEY (sender_id)
        REFERENCES users(id),

    CONSTRAINT fk_invite_recipient
        FOREIGN KEY (recipient_id)
        REFERENCES users(id),

    CONSTRAINT sender_not_recipient
        CHECK (sender_id <> recipient_id)
);

CREATE INDEX idx_invites_interview
ON invites(interview_id);

CREATE INDEX idx_invites_sender
ON invites(sender_id);

CREATE INDEX idx_invites_recipient
ON invites(recipient_id);

CREATE INDEX idx_invites_status
ON invites(status);