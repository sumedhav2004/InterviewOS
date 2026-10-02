import { ProgrammingLanguage } from "./programming-language";

export type ParticipantRole =
    | "INTERVIEWER"
    | "CANDIDATE"
    | "OBSERVER";


export type CodeRunTestCaseResult = {
    id: string;
    codeRunId: string;
    testCaseId: string;
    status: "PENDING" | "RUNNING" | "SUCCESS" | "FAILED";
    passed: boolean;
    stdout: string | null;
    stderr: string | null;
    executionTimeMS: number | null;
};


export type SubmissionState =
  | "IDLE"
  | "SUBMITTING"
  | "COMPLETED"
  | "FAILED";

export type CreateSubmissionRequest = {
  interviewQuestionId: string;
  participantId: string;
  language: string;
  sourceCode: string;
};

export type SubmissionTestCaseResult = {
  id: string;
  submissionId: string;
  testCaseId: string;
  status: string;
  passed: boolean;
  stdout: string | null;
  stderr: string | null;
  executionTimeMS: number | null;
  memoryBytes?: string | null;
};

export type Submission = {
  id: string;
  interviewQuestionId: string;
  participantId: string;
  language: string;
  sourceCode: string;
  status: string;
};


export type Participant = {
    id: string;
    interviewId: string;
    userId: string;
    role: ParticipantRole;
    status: string;
    joinedAt: string | null;
    leftAt: string | null;
};


export type InterviewRealtimeEvent =
    | {
          type: "PARTICIPANT_JOINED";
          participantId: string;
          participant: Participant;
      }
    | {
          type: "PARTICIPANT_LEFT";
          participantId: string;
          participant: Participant;
      }
    | {
          type: "INTERVIEW_STARTED";
      }
    | {
          type: "INTERVIEW_ENDED";
      };


export type ClientRealtimeMessage =
    | {
          type: "AUTHENTICATE";
          token: string;
      }
    | {
          type: "JOIN_INTERVIEW";
          interviewId: string;
      }
    | {
          type: "LEAVE_INTERVIEW";
          interviewId: string;
      }
    | {
          type: "WEBRTC_OFFER";
          targetUserId: string;
          offer: RTCSessionDescriptionInit;
      }
    | {
          type: "WEBRTC_ANSWER";
          targetUserId: string;
          answer: RTCSessionDescriptionInit;
      }
    | {
          type: "WEBRTC_ICE_CANDIDATE";
          targetUserId: string;
          candidate: RTCIceCandidateInit;
      }
    | {
          type: "MEDIA_STATE";
          cameraEnabled: boolean;
          microphoneEnabled: boolean;
      }
    | {
          type: "SET_ACTIVE_QUESTION";
          interviewQuestionId: string | null;
      }
    | {
          type: "CODE_CHANGE";
          code: string;
      }
    | {
          type: "LANGUAGE_CHANGE";
          language: ProgrammingLanguage;
      };


export type ServerMessage =
    | {
          type: "AUTHENTICATED";
          userId: string;
      }
    | {
          type: "INTERVIEW_JOINED";
          interviewId: string;
          userId: string;
          participant: Participant;
          participants: Participant[];
      }

    /*
     * Code execution lifecycle
     */
    | {
          type: "CODE_RUN_STARTED";
          codeRunId: string;
      }
    | {
          type: "CODE_RUN_TEST_CASE_RESULT";
          codeRunId: string;
          result: CodeRunTestCaseResult;
      }
    | {
          type: "CODE_RUN_COMPLETED";
          codeRunId: string;
          status: "SUCCESS" | "FAILED";
      }

    /*
     * Code synchronization
     */
    | {
          type: "CODE_SNAPSHOT";
          code: string;
      }
    | {
          type: "CODE_CHANGE";
          userId: string;
          code: string;
      }
    | {
          type: "LANGUAGE_SNAPSHOT";
          language: ProgrammingLanguage;
      }
    | {
          type: "LANGUAGE_CHANGED";
          userId: string;
          language: ProgrammingLanguage;
      }

    /*
     * Active interview question
     */
    | {
          type: "ACTIVE_QUESTION_CHANGED";
          interviewQuestionId: string | null;
          changedByUserId: string;
      }
    | {
          type: "ACTIVE_QUESTION_STATE";
          interviewQuestion: {
              id: string;
              questionId: string;
              questionOrder: number;
              points: number;
              question: {
                  id: string;
                  title: string;
                  description: string;
                  difficulty: "EASY" | "MEDIUM" | "HARD";
              };
          } | null;
      }
      /*
 * Submission lifecycle
 */
        | {
            type: "SUBMISSION_TEST_CASE_RESULT";
            submissionId: string;
            result: {
                id: string;
                submissionId: string;
                testCaseId: string;
                status: "PENDING" | "RUNNING" | "SUCCESS" | "FAILED";
                passed: boolean;
                stdout: string | null;
                stderr: string | null;
                executionTimeMS: number | null;
            };
        }
        | {
            type: "SUBMISSION_COMPLETED";
            submissionId: string;
            evaluation: {
                id: string;
                submissionId: string;
                status: "PASSED" | "FAILED";
                score: number;
                passedTests: number;
                totalTests: number;
                executionTimeMS: number | null;
            };
        }

    /*
     * Participants
     */
    | {
          type: "PARTICIPANT_JOINED";
          participant: Participant;
      }
    | {
          type: "PARTICIPANT_LEFT";
          userId: string;
      }

    /*
     * WebRTC
     */
    | {
          type: "WEBRTC_OFFER";
          fromUserId: string;
          offer: RTCSessionDescriptionInit;
      }
    | {
          type: "WEBRTC_ANSWER";
          fromUserId: string;
          answer: RTCSessionDescriptionInit;
      }
    | {
          type: "WEBRTC_ICE_CANDIDATE";
          fromUserId: string;
          candidate: RTCIceCandidateInit;
      }

    /*
     * Media state
     */
    | {
          type: "MEDIA_STATE";
          userId: string;
          cameraEnabled: boolean;
          microphoneEnabled: boolean;
      }

    /*
     * Errors
     */
    | {
          type: "ERROR";
          message: string;
      };


export type ActiveQuestionChangedMessage = {
    type: "ACTIVE_QUESTION_CHANGED";
    interviewId: string;
    activeInterviewQuestion: {
        id: string;
        questionOrder: number;
        points: number;
        question: {
            id: string;
            title: string;
            description: string;
            difficulty: string;
            testCases: {
                id: string;
                input: unknown;
                expectedOutput: unknown;
            }[];
        };
    } | null;
};