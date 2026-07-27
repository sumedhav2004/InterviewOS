CREATE TABLE evaluations (
    id UUID PRIMARY KEY,

    submission_id UUID NOT NULL UNIQUE,

    status evaluation_status NOT NULL,

    score INTEGER NOT NULL CHECK (score >= 0),

    passed_tests INTEGER NOT NULL,

    total_tests INTEGER NOT NULL,

    execution_time_ms INTEGER,

    memory_bytes BIGINT,

    feedback TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_evaluation_submission
        FOREIGN KEY (submission_id)
        REFERENCES submissions(id)
        ON DELETE CASCADE
);