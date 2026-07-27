CREATE TABLE test_cases (
    id UUID PRIMARY KEY,

    question_id UUID NOT NULL,

    input JSONB NOT NULL,

    expected_output JSONB NOT NULL,

    visibility test_case_visibility NOT NULL DEFAULT 'HIDDEN',

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_test_case_question
        FOREIGN KEY (question_id)
        REFERENCES questions(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_test_cases_question
ON test_cases(question_id);