CREATE TABLE interviews (
    id UUID PRIMARY KEY,

    owner_id UUID NOT NULL,

    title TEXT NOT NULL,

    description TEXT,

    status interview_status NOT NULL,

    scheduled_at TIMESTAMPTZ,

    duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_interview_owner
        FOREIGN KEY (owner_id)
        REFERENCES users(id)
);

CREATE INDEX idx_interviews_owner
ON interviews(owner_id);