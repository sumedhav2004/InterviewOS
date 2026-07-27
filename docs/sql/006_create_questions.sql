CREATE TABLE questions (
    id UUID PRIMARY KEY,

    title TEXT NOT NULL,

    description TEXT NOT NULL,

    difficulty question_difficulty NOT NULL,

    created_by UUID NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_question_author
        FOREIGN KEY (created_by)
        REFERENCES users(id)
);

CREATE INDEX idx_questions_author
ON questions(created_by);