CREATE TABLE interview_questions (
    id UUID PRIMARY KEY,

    interview_id UUID NOT NULL,

    question_id UUID NOT NULL,

    question_order INTEGER NOT NULL,

    points INTEGER NOT NULL DEFAULT 0,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_iq_interview
        FOREIGN KEY (interview_id)
        REFERENCES interviews(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_iq_question
        FOREIGN KEY (question_id)
        REFERENCES questions(id)
        ON DELETE CASCADE,

    CONSTRAINT unique_interview_question
        UNIQUE (interview_id, question_id),

    CONSTRAINT unique_question_order
        UNIQUE (interview_id, question_order)
);

CREATE INDEX idx_iq_interview
ON interview_questions(interview_id);

CREATE INDEX idx_iq_question
ON interview_questions(question_id);