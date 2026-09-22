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
      type: "CODE_CHANGE";
      code: string;
    };

export type ServerMessage =
  | { type: "AUTHENTICATED"; userId: string }
  | {
      type: "INTERVIEW_JOINED";
      interviewId: string;
      userId: string;
      participants: string[];
    }
  | {
      type: "CODE_CHANGE";
      userId: string;
      code: string;
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