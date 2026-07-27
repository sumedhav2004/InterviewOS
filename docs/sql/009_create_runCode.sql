CREATE TABLE code_runs (
    id UUID PRIMARY KEY,

    participant_id UUID NOT NULL,

    interview_question_id UUID NOT NULL,

    language programming_language NOT NULL,

    source_code TEXT NOT NULL,

    status execution_status NOT NULL DEFAULT 'PENDING',

    stdout TEXT,

    stderr TEXT,

    execution_time_ms INTEGER,

    memory_bytes BIGINT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_run_participant
        FOREIGN KEY (participant_id)
        REFERENCES participants(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_run_interview_question
        FOREIGN KEY (interview_question_id)
        REFERENCES interview_questions(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_runs_participant
ON code_runs(participant_id);

CREATE INDEX idx_runs_question
ON code_runs(interview_question_id);