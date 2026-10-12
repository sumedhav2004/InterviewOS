import { beforeEach, describe, expect, it, vi } from "vitest";
import { CreateParticipantData } from "../../../src/types/participant";
import { InterviewParticipantService } from "../../../src/services/interviewParticipant.service";

describe("participantService", () => {
  const mockParticipantRepository = {
    createParticipant: vi.fn(),
    updateParticipant: vi.fn(),
    getParticipantsForInterview: vi.fn(),
    findParticipantsForInterview: vi.fn(),
    findParticipant: vi.fn(),
  };

  const mockInterviewRepository = {
    findById: vi.fn(),
  };

  const mockUserRepository = {
    findById: vi.fn(),
  };

  let service: InterviewParticipantService;

  beforeEach(() => {
    vi.clearAllMocks();

    service = new InterviewParticipantService(
      mockParticipantRepository as any,
      mockInterviewRepository as any,
      mockUserRepository as any,
    );
  });

  describe("createParticipant", () => {
    it("should create a new participant", async () => {
      const interviewId = "interview-1";
      const targetId = "user-1";
      const requesterId = "user-2";

      const data: CreateParticipantData = {
        role: "INTERVIEWER",
      };

      const createdParticipant = {
        id: "participant-1",
        role: "INTERVIEWER",
        userId: targetId,
        interviewId,
      };

      mockInterviewRepository.findById.mockResolvedValue({
        id: interviewId,
        createdById: requesterId,
      });

      mockUserRepository.findById.mockResolvedValue({
        id: targetId,
      });

      mockParticipantRepository.findParticipant.mockResolvedValue(null);
      mockParticipantRepository.createParticipant.mockResolvedValue(createdParticipant);

      const result = await service.createParticipant(requesterId, targetId, interviewId, data);

      expect(mockInterviewRepository.findById).toHaveBeenCalledWith(interviewId);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(targetId);
      expect(mockParticipantRepository.findParticipant).toHaveBeenCalledWith(targetId, interviewId);
      expect(mockParticipantRepository.createParticipant).toHaveBeenCalledWith(
        expect.anything(),
        targetId,
        interviewId,
        data,
      );
      expect(result).toEqual(createdParticipant);
    });

    it("should produce error if interview not found", async () => {
      const interviewId = "interview-1";
      const targetId = "user-2";
      const requesterId = "user-1";

      mockInterviewRepository.findById.mockResolvedValue(null);

      await expect(
        service.createParticipant(requesterId, targetId, interviewId, {
          role: "INTERVIEWER",
        }),
      ).rejects.toMatchObject({
        message: "Interview Not Found",
        statusCode: 404,
        code: "INTERVIEW_NOT_FOUND",
      });

      expect(mockParticipantRepository.createParticipant).not.toHaveBeenCalled();
    });

    it("should produce error if interview not created by the requester", async () => {
      const interviewId = "interview-1";
      const targetId = "user-2";
      const requesterId = "user-1";

      mockInterviewRepository.findById.mockResolvedValue({
        id: interviewId,
        createdById: "user-2",
      });

      await expect(
        service.createParticipant(requesterId, targetId, interviewId, {
          role: "INTERVIEWER",
        }),
      ).rejects.toMatchObject({
        message: "Unauthorized",
        statusCode: 403,
        code: "UNAUTHORIZED",
      });

      expect(mockParticipantRepository.createParticipant).not.toHaveBeenCalled();
    });

    it("should produce error if target user is not found", async () => {
      const interviewId = "interview-1";
      const targetId = "user-2";
      const requesterId = "user-1";

      mockInterviewRepository.findById.mockResolvedValue({
        id: interviewId,
        createdById: requesterId,
      });
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(
        service.createParticipant(requesterId, targetId, interviewId, {
          role: "INTERVIEWER",
        }),
      ).rejects.toMatchObject({
        message: "User Not Found",
        statusCode: 404,
        code: "USER_NOT_FOUND",
      });

      expect(mockParticipantRepository.createParticipant).not.toHaveBeenCalled();
    });

    it("should reject a user who is already a participant", async () => {
      const interviewId = "interview-1";
      const targetId = "user-2";
      const requesterId = "user-1";

      mockInterviewRepository.findById.mockResolvedValue({
        id: interviewId,
        createdById: requesterId,
      });
      mockUserRepository.findById.mockResolvedValue({
        id: targetId,
      });
      mockParticipantRepository.findParticipant.mockResolvedValue({
        interviewId,
        userId: targetId,
      });

      await expect(
        service.createParticipant(requesterId, targetId, interviewId, {
          role: "INTERVIEWER",
        }),
      ).rejects.toMatchObject({
        message: "User is already a participant",
        statusCode: 409,
        code: "PARTICIPANT_ALREADY_EXISTS",
      });

      expect(mockParticipantRepository.createParticipant).not.toHaveBeenCalled();
    });
  });

  describe("authorizeParticipant", () => {
    it("should return the participant when the requester is a participant", async () => {
      const interviewId = "interview-1";
      const requesterId = "user-1";

      const participant = {
        id: "participant-1",
        userId: requesterId,
        interviewId,
        role: "INTERVIEWER",
      };

      mockInterviewRepository.findById.mockResolvedValue({
        id: interviewId,
        createdById: "owner-1",
      });
      mockParticipantRepository.findParticipant.mockResolvedValue(participant);

      const result = await service.authorizeParticipant(requesterId, interviewId);

      expect(mockInterviewRepository.findById).toHaveBeenCalledWith(interviewId);
      expect(mockParticipantRepository.findParticipant).toHaveBeenCalledWith(
        requesterId,
        interviewId,
      );
      expect(result).toEqual(participant);
    });

    it("should throw INTERVIEW_NOT_FOUND when the interview does not exist", async () => {
      mockInterviewRepository.findById.mockResolvedValue(null);

      await expect(
        service.authorizeParticipant("user-1", "missing-interview"),
      ).rejects.toMatchObject({
        message: "Interview Not Found",
        statusCode: 404,
        code: "INTERVIEW_NOT_FOUND",
      });

      expect(mockParticipantRepository.findParticipant).not.toHaveBeenCalled();
    });

    it("should throw UNAUTHORIZED when a non-owner is not a participant", async () => {
      mockInterviewRepository.findById.mockResolvedValue({
        id: "interview-1",
        createdById: "owner-1",
      });
      mockParticipantRepository.findParticipant.mockResolvedValue(null);

      await expect(service.authorizeParticipant("stranger", "interview-1")).rejects.toMatchObject({
        message: "Unauthorized",
        statusCode: 403,
        code: "UNAUTHORIZED",
      });
    });

    it("should allow the interview owner when they are not a participant", async () => {
      mockInterviewRepository.findById.mockResolvedValue({
        id: "interview-1",
        createdById: "owner-1",
      });
      mockParticipantRepository.findParticipant.mockResolvedValue(null);

      await expect(service.authorizeParticipant("owner-1", "interview-1")).resolves.toBeNull();
    });

    it("should return the participant for a non-owner who is a participant", async () => {
      const participant = {
        id: "participant-1",
        userId: "user-2",
        interviewId: "interview-1",
        role: "CANDIDATE",
      };

      mockInterviewRepository.findById.mockResolvedValue({
        id: "interview-1",
        createdById: "owner-1",
      });
      mockParticipantRepository.findParticipant.mockResolvedValue(participant);

      await expect(service.authorizeParticipant("user-2", "interview-1")).resolves.toEqual(
        participant,
      );
    });
  });

  describe("updateParticipant", () => {
    it("should update the participant", async () => {
      const interviewId = "interview-1";
      const requesterId = "user-1";
      const targetId = "user-2";

      const data: CreateParticipantData = {
        role: "INTERVIEWER",
      };

      const updatedParticipant = {
        id: "participant-1",
        role: "INTERVIEWER",
        userId: targetId,
        interviewId,
      };

      mockInterviewRepository.findById.mockResolvedValue({
        id: interviewId,
        createdById: requesterId,
      });
      mockParticipantRepository.findParticipant.mockResolvedValue({
        id: "participant-1",
        role: "OBSERVER",
        userId: targetId,
        interviewId,
      });
      mockParticipantRepository.updateParticipant.mockResolvedValue(updatedParticipant);

      const result = await service.updateParticipant(requesterId, targetId, interviewId, data);

      expect(mockInterviewRepository.findById).toHaveBeenCalledWith(interviewId);
      expect(mockParticipantRepository.findParticipant).toHaveBeenCalledWith(targetId, interviewId);
      expect(result).toMatchObject(updatedParticipant);
    });

    it("should produce error when interview doesn't exist", async () => {
      const interviewId = "interview-1";

      mockInterviewRepository.findById.mockResolvedValue(null);

      await expect(
        service.updateParticipant("user-1", "user-2", interviewId, {
          role: "INTERVIEWER",
        }),
      ).rejects.toMatchObject({
        message: "Interview Not Found",
        statusCode: 404,
        code: "INTERVIEW_NOT_FOUND",
      });
    });

    it("should produce error when interview is not owned by the requester", async () => {
      const interviewId = "interview-1";

      mockInterviewRepository.findById.mockResolvedValue({
        id: interviewId,
        createdById: "user-2",
      });

      await expect(
        service.updateParticipant("user-1", "user-2", interviewId, {
          role: "INTERVIEWER",
        }),
      ).rejects.toMatchObject({
        message: "Unauthorized",
        statusCode: 403,
        code: "UNAUTHORIZED",
      });
    });

    it("should produce error when participant is not found", async () => {
      const interviewId = "interview-1";

      mockInterviewRepository.findById.mockResolvedValue({
        id: interviewId,
        createdById: "user-1",
      });
      mockParticipantRepository.findParticipant.mockResolvedValue(null);

      await expect(
        service.updateParticipant("user-1", "user-2", interviewId, {
          role: "INTERVIEWER",
        }),
      ).rejects.toMatchObject({
        message: "Participant Not Found",
        statusCode: 404,
        code: "PARTICIPANT_NOT_FOUND",
      });
    });
  });

  describe("getParticipantsForInterview", () => {
    it("should give all the participants in an interview", async () => {
      const interviewId = "interview-1";
      const userId = "user-1";

      mockInterviewRepository.findById.mockResolvedValue({
        id: interviewId,
        createdById: userId,
      });

      const participants = [
        {
          id: "participant-1",
          userId,
          interviewId,
        },
        {
          id: "participant-2",
          userId: "user-2",
          interviewId,
        },
      ];

      mockParticipantRepository.findParticipant.mockResolvedValue(participants[0]);
      mockParticipantRepository.findParticipantsForInterview.mockResolvedValue(participants);

      const result = await service.getParticipantsForInterview(interviewId, userId);

      expect(mockInterviewRepository.findById).toHaveBeenCalledWith(interviewId);
      expect(mockParticipantRepository.findParticipant).toHaveBeenCalledWith(userId, interviewId);
      expect(result).toEqual(participants);
    });
  });
});
