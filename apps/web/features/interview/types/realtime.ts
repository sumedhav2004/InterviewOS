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
    };