import { ProgrammingLanguage } from "./programming-language";

export type ParticipantRole =
    | "INTERVIEWER"
    | "CANDIDATE"
    | "OBSERVER";

export type InterviewRealtimeEvent =
  | {
      type: "PARTICIPANT_JOINED";
      participantId: string;
      userId: string;
    }
  | {
      type: "PARTICIPANT_LEFT";
      participantId: string;
      userId: string;
    }
  | {
      type: "INTERVIEW_STARTED";
    }
  | {
      type: "INTERVIEW_ENDED";
    };

export type ClientRealtimeMessage =
  | { type: "AUTHENTICATE"; token: string }
  | { type: "JOIN_INTERVIEW"; interviewId: string }
  | { type: "LEAVE_INTERVIEW"; interviewId: string }
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
    }

export type ServerMessage =
  | { type: "AUTHENTICATED"; userId: string }
  | {
        type: "INTERVIEW_JOINED";
        interviewId: string;
        userId: string;
        role: ParticipantRole;
        participants: string[];
    }
  | {
        type: "CODE_SNAPSHOT";
        code: string;
    }
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
  | { type: "PARTICIPANT_JOINED"; userId: string }
  | { type: "PARTICIPANT_LEFT"; userId: string }
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
  | {
      type: "MEDIA_STATE";
      userId: string;
      cameraEnabled: boolean;
      microphoneEnabled: boolean;
    }
  | { type: "ERROR"; message: string };

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