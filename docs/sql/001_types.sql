CREATE TYPE interview_status AS ENUM (
    'DRAFT',
    'SCHEDULED',
    'LIVE',
    'COMPLETED',
    'CANCELLED'
);

CREATE TYPE participant_role AS ENUM (
    'CANDIDATE',
    'INTERVIEWER',
    'OBSERVER'
);

CREATE TYPE participant_status AS ENUM (
    'ACTIVE',
    'LEFT'
);

CREATE TYPE invite_status AS ENUM (
    'PENDING',
    'ACCEPTED',
    'DECLINED',
    'EXPIRED',
    'CANCELLED'
);

CREATE TYPE question_difficulty AS ENUM (
    'EASY',
    'MEDIUM',
    'HARD'
);

CREATE TYPE test_case_visibility AS ENUM (
    'PUBLIC',
    'HIDDEN'
);

CREATE TYPE execution_status AS ENUM (
    'PENDING',
    'RUNNING',
    'SUCCESS',
    'FAILED'
);

CREATE TYPE programming_language AS ENUM (
    'CPP',
    'JAVA',
    'PYTHON',
    'JAVASCRIPT',
    'TYPESCRIPT',
    'GO',
    'RUST'
);

CREATE TYPE evaluation_status AS ENUM (
    'PASSED',
    'FAILED'
);