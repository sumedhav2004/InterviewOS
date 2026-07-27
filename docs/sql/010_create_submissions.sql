CREATE TABLE submissions (
    id UUID PRIMARY KEY,

    participant_id UUID NOT NULL,

    interview_question_id UUID NOT NULL,

    language programming_language NOT NULL,

    source_code TEXT NOT NULL,

    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_submission_participant
        FOREIGN KEY (participant_id)
        REFERENCES participants(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_submission_question
        FOREIGN KEY (interview_question_id)
        REFERENCES interview_questions(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_submissions_participant
ON submissions(participant_id);

CREATE INDEX idx_submissions_question
ON submissions(interview_question_id);