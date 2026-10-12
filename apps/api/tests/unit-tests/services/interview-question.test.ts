import { beforeEach, describe, expect, it, vi } from "vitest";
import { InterviewQuestionService } from "../../../src/services/interview-question.service";
import { InterviewStatus, ParticipantRole } from "@interview-os/database";

describe("InterviewQuestionService", () => {
  let service: InterviewQuestionService;
  let interviewQuestionRepository: any;
  let interviewRepository: any;
  let questionRepository: any;
  let participantRepository: any;

  const interview = {
    id: "interview-1",
    createdById: "owner-1",
    status: InterviewStatus.DRAFT,
  };

  const question = {
    id: "question-1",
    createdById: "owner-1",
  };

  const participant = {
    userId: "interviewer-1",
    interviewId: "interview-1",
    role: ParticipantRole.INTERVIEWER,
  };

  const interviewQuestion = {
    id: "interview-question-1",
    interviewId: "interview-1",
    questionId: "question-1",
    questionOrder: 1,
    points: 5,
  };

  beforeEach(() => {
    vi.restoreAllMocks();

    interviewQuestionRepository = {
      findById: vi.fn(),
      findByInterview: vi.fn(),
      findInterviewQuestion: vi.fn(),
      createInterviewQuestion: vi.fn(),
      updateInterviewQuestion: vi.fn(),
      setActiveInterviewQuestion: vi.fn(),
      clearActiveInterviewQuestion: vi.fn(),
      deleteInterviewQuestion: vi.fn(),
    };

    interviewRepository = {
      findById: vi.fn(),
      findActiveInterviewQuestionId: vi.fn(),
    };

    questionRepository = {
      findById: vi.fn(),
    };

    participantRepository = {
      findParticipant: vi.fn(),
    };

    service = new InterviewQuestionService(
      interviewQuestionRepository,
      interviewRepository,
      questionRepository,
      participantRepository,
    );
  });

  describe("findById", () => {
    it("delegates to the repository", async () => {
      interviewQuestionRepository.findById.mockResolvedValue(interviewQuestion);

      await expect(service.findById("interview-question-1")).resolves.toEqual(interviewQuestion);
      expect(interviewQuestionRepository.findById).toHaveBeenCalledWith("interview-question-1");
    });
  });

  describe("findByInterview", () => {
    it("returns questions for an existing interview", async () => {
      interviewRepository.findById.mockResolvedValue(interview);
      interviewQuestionRepository.findByInterview.mockResolvedValue([interviewQuestion]);

      await expect(service.findByInterview("interview-1")).resolves.toEqual([interviewQuestion]);
      expect(interviewQuestionRepository.findByInterview).toHaveBeenCalledWith("interview-1");
    });

    it("throws when the interview does not exist", async () => {
      interviewRepository.findById.mockResolvedValue(null);

      await expect(service.findByInterview("missing")).rejects.toMatchObject({
        statusCode: 404,
        code: "INTERVIEW_NOT_FOUND",
      });
      expect(interviewQuestionRepository.findByInterview).not.toHaveBeenCalled();
    });
  });

  describe("findInterviewQuestion", () => {
    it("returns the matching interview question", async () => {
      interviewRepository.findById.mockResolvedValue(interview);
      questionRepository.findById.mockResolvedValue(question);
      interviewQuestionRepository.findInterviewQuestion.mockResolvedValue(interviewQuestion);

      await expect(service.findInterviewQuestion("interview-1", "question-1")).resolves.toEqual(
        interviewQuestion,
      );
    });

    it("throws when the interview does not exist", async () => {
      interviewRepository.findById.mockResolvedValue(null);

      await expect(service.findInterviewQuestion("missing", "question-1")).rejects.toMatchObject({
        statusCode: 404,
        code: "INTERVIEW_NOT_FOUND",
      });
      expect(questionRepository.findById).not.toHaveBeenCalled();
    });

    it("throws when the question does not exist", async () => {
      interviewRepository.findById.mockResolvedValue(interview);
      questionRepository.findById.mockResolvedValue(null);

      await expect(service.findInterviewQuestion("interview-1", "missing")).rejects.toMatchObject({
        statusCode: 404,
        code: "QUESTION_NOT_FOUND",
      });
      expect(interviewQuestionRepository.findInterviewQuestion).not.toHaveBeenCalled();
    });
  });

  describe("createInterviewQuestion", () => {
    const data = { questionOrder: 1, points: 5 };

    beforeEach(() => {
      interviewRepository.findById.mockResolvedValue(interview);
      participantRepository.findParticipant.mockResolvedValue(participant);
      questionRepository.findById.mockResolvedValue(question);
      interviewQuestionRepository.findInterviewQuestion.mockResolvedValue(null);
      interviewQuestionRepository.findByInterview.mockResolvedValue([]);
      interviewQuestionRepository.createInterviewQuestion.mockResolvedValue(interviewQuestion);
    });

    it("creates an interview question when all validations pass", async () => {
      await expect(
        service.createInterviewQuestion("interview-1", "question-1", "interviewer-1", data),
      ).resolves.toEqual(interviewQuestion);

      expect(interviewQuestionRepository.createInterviewQuestion).toHaveBeenCalledWith(
        "interview-1",
        "question-1",
        data,
      );
    });

    it("throws when the interview does not exist", async () => {
      interviewRepository.findById.mockResolvedValue(null);

      await expect(
        service.createInterviewQuestion("missing", "question-1", "interviewer-1", data),
      ).rejects.toMatchObject({ statusCode: 404, code: "INTERVIEW_NOT_FOUND" });
      expect(participantRepository.findParticipant).not.toHaveBeenCalled();
    });

    it("rejects a requester who is not a participant", async () => {
      participantRepository.findParticipant.mockResolvedValue(null);
      const log = vi.spyOn(console, "log").mockImplementation(() => {});

      await expect(
        service.createInterviewQuestion("interview-1", "question-1", "stranger", data),
      ).rejects.toMatchObject({ statusCode: 403, code: "UNAUTHORIZED" });

      expect(questionRepository.findById).not.toHaveBeenCalled();
      log.mockRestore();
    });

    it("rejects a participant who is not an interviewer", async () => {
      participantRepository.findParticipant.mockResolvedValue({
        ...participant,
        role: ParticipantRole.CANDIDATE,
      });
      const log = vi.spyOn(console, "log").mockImplementation(() => {});

      await expect(
        service.createInterviewQuestion("interview-1", "question-1", "candidate-1", data),
      ).rejects.toMatchObject({ statusCode: 403, code: "UNAUTHORIZED" });

      log.mockRestore();
    });

    it("throws when the question does not exist", async () => {
      questionRepository.findById.mockResolvedValue(null);

      await expect(
        service.createInterviewQuestion("interview-1", "missing", "interviewer-1", data),
      ).rejects.toMatchObject({ statusCode: 404, code: "QUESTION_NOT_FOUND" });
    });

    it.each([InterviewStatus.COMPLETED, InterviewStatus.CANCELLED])(
      "rejects adding questions when interview status is %s",
      async (status) => {
        interviewRepository.findById.mockResolvedValue({ ...interview, status });

        await expect(
          service.createInterviewQuestion("interview-1", "question-1", "interviewer-1", data),
        ).rejects.toMatchObject({
          statusCode: 400,
          code: "QUESTION_CANT_BE_ADDED",
        });
      },
    );

    it("rejects a question that is already attached", async () => {
      interviewQuestionRepository.findInterviewQuestion.mockResolvedValue(interviewQuestion);

      await expect(
        service.createInterviewQuestion("interview-1", "question-1", "interviewer-1", data),
      ).rejects.toMatchObject({
        statusCode: 409,
        code: "QUESTION_ALREADY_ADDED",
      });
    });

    it("rejects an incorrect question order", async () => {
      await expect(
        service.createInterviewQuestion("interview-1", "question-1", "interviewer-1", {
          ...data,
          questionOrder: 2,
        }),
      ).rejects.toMatchObject({ statusCode: 400, code: "INVALID_ORDER" });
    });

    it("rejects points below one", async () => {
      await expect(
        service.createInterviewQuestion("interview-1", "question-1", "interviewer-1", {
          ...data,
          points: 0,
        }),
      ).rejects.toMatchObject({ statusCode: 400, code: "INVALID_POINTS" });
    });

    it("uses the current question count to calculate the expected order", async () => {
      interviewQuestionRepository.findByInterview.mockResolvedValue([
        { id: "iq-1" },
        { id: "iq-2" },
      ]);

      await expect(
        service.createInterviewQuestion("interview-1", "question-1", "interviewer-1", {
          ...data,
          questionOrder: 3,
        }),
      ).resolves.toEqual(interviewQuestion);

      expect(interviewQuestionRepository.createInterviewQuestion).toHaveBeenCalledWith(
        "interview-1",
        "question-1",
        {
          ...data,
          questionOrder: 3,
        },
      );
    });
  });

  describe("updateInterviewQuestion", () => {
    const data = { points: 10 };

    beforeEach(() => {
      interviewRepository.findById.mockResolvedValue(interview);
      participantRepository.findParticipant.mockResolvedValue(participant);
      interviewQuestionRepository.findById.mockResolvedValue(interviewQuestion);
      interviewQuestionRepository.updateInterviewQuestion.mockResolvedValue({
        ...interviewQuestion,
        ...data,
      });
    });

    it("updates a matching interview question", async () => {
      await expect(
        service.updateInterviewQuestion(
          "interview-question-1",
          "interview-1",
          "question-1",
          "interviewer-1",
          data,
        ),
      ).resolves.toEqual({ ...interviewQuestion, ...data });

      expect(interviewQuestionRepository.updateInterviewQuestion).toHaveBeenCalledWith(
        "interview-question-1",
        data,
      );
    });

    it("throws when the interview does not exist", async () => {
      interviewRepository.findById.mockResolvedValue(null);

      await expect(
        service.updateInterviewQuestion("iq", "missing", "question-1", "interviewer-1", data),
      ).rejects.toMatchObject({ statusCode: 404, code: "INTERVIEW_NOT_FOUND" });
    });

    it("rejects a requester who is not an interviewer", async () => {
      participantRepository.findParticipant.mockResolvedValue(null);

      await expect(
        service.updateInterviewQuestion("iq", "interview-1", "question-1", "stranger", data),
      ).rejects.toMatchObject({ statusCode: 403, code: "UNAUTHORIZED" });

      expect(interviewQuestionRepository.findById).not.toHaveBeenCalled();
    });

    it("throws when the interview question does not exist", async () => {
      interviewQuestionRepository.findById.mockResolvedValue(null);

      await expect(
        service.updateInterviewQuestion(
          "missing",
          "interview-1",
          "question-1",
          "interviewer-1",
          data,
        ),
      ).rejects.toMatchObject({
        statusCode: 404,
        code: "INTERVIEW_QUESTION_NOT_FOUND",
      });
    });

    it("throws when the interview question belongs to another interview", async () => {
      interviewQuestionRepository.findById.mockResolvedValue({
        ...interviewQuestion,
        interviewId: "other-interview",
      });

      await expect(
        service.updateInterviewQuestion(
          "interview-question-1",
          "interview-1",
          "question-1",
          "interviewer-1",
          data,
        ),
      ).rejects.toMatchObject({
        statusCode: 404,
        code: "INTERVIEW_QUESTION_NOT_FOUND",
      });
    });

    it("throws when the interview question references another question", async () => {
      interviewQuestionRepository.findById.mockResolvedValue({
        ...interviewQuestion,
        questionId: "other-question",
      });

      await expect(
        service.updateInterviewQuestion(
          "interview-question-1",
          "interview-1",
          "question-1",
          "interviewer-1",
          data,
        ),
      ).rejects.toMatchObject({
        statusCode: 404,
        code: "INTERVIEW_QUESTION_NOT_FOUND",
      });
    });

    it.each([InterviewStatus.COMPLETED, InterviewStatus.CANCELLED])(
      "rejects updates when interview status is %s",
      async (status) => {
        interviewRepository.findById.mockResolvedValue({ ...interview, status });

        await expect(
          service.updateInterviewQuestion(
            "interview-question-1",
            "interview-1",
            "question-1",
            "interviewer-1",
            data,
          ),
        ).rejects.toMatchObject({
          statusCode: 400,
          code: "QUESTION_CANNOT_BE_MODIFIED",
        });
      },
    );

    it("rejects empty update data", async () => {
      await expect(
        service.updateInterviewQuestion(
          "interview-question-1",
          "interview-1",
          "question-1",
          "interviewer-1",
          {},
        ),
      ).rejects.toMatchObject({ statusCode: 400, code: "NO_UPDATION_DATA" });
    });

    it("rejects points below one", async () => {
      await expect(
        service.updateInterviewQuestion(
          "interview-question-1",
          "interview-1",
          "question-1",
          "interviewer-1",
          { points: 0 },
        ),
      ).rejects.toMatchObject({ statusCode: 400, code: "INVALID_POINTS" });
    });
  });

  describe("setActiveInterviewQuestion", () => {
    beforeEach(() => {
      interviewRepository.findById.mockResolvedValue({
        ...interview,
        status: InterviewStatus.INPROGRESS,
      });
      interviewQuestionRepository.findById.mockResolvedValue(interviewQuestion);
      interviewQuestionRepository.setActiveInterviewQuestion.mockResolvedValue(interviewQuestion);
    });

    it("sets the active question for the interview owner", async () => {
      await expect(
        service.setActiveInterviewQuestion("interview-1", "interview-question-1", "owner-1"),
      ).resolves.toEqual(interviewQuestion);

      expect(interviewQuestionRepository.setActiveInterviewQuestion).toHaveBeenCalledWith(
        "interview-1",
        "interview-question-1",
      );
    });

    it("throws when the interview does not exist", async () => {
      interviewRepository.findById.mockResolvedValue(null);

      await expect(
        service.setActiveInterviewQuestion("missing", "iq", "owner-1"),
      ).rejects.toMatchObject({ statusCode: 404, code: "INTERVIEW_NOT_FOUND" });
    });

    it("rejects an interview that is not in progress", async () => {
      interviewRepository.findById.mockResolvedValue(interview);

      await expect(
        service.setActiveInterviewQuestion("interview-1", "iq", "owner-1"),
      ).rejects.toMatchObject({
        statusCode: 400,
        code: "INTERVIEW_NOT_IN_PROGRESS",
      });
    });

    it("rejects a requester who is not the interview owner", async () => {
      await expect(
        service.setActiveInterviewQuestion("interview-1", "interview-question-1", "stranger"),
      ).rejects.toMatchObject({ statusCode: 403, code: "UNAUTHORIZED" });

      expect(interviewQuestionRepository.findById).not.toHaveBeenCalled();
    });

    it("throws when the interview question does not exist", async () => {
      interviewQuestionRepository.findById.mockResolvedValue(null);

      await expect(
        service.setActiveInterviewQuestion("interview-1", "missing", "owner-1"),
      ).rejects.toMatchObject({
        statusCode: 404,
        code: "INTERVIEW_QUESTION_NOT_FOUND",
      });
    });

    it("rejects a question that belongs to another interview", async () => {
      interviewQuestionRepository.findById.mockResolvedValue({
        ...interviewQuestion,
        interviewId: "other-interview",
      });

      await expect(
        service.setActiveInterviewQuestion("interview-1", "interview-question-1", "owner-1"),
      ).rejects.toMatchObject({
        statusCode: 400,
        code: "QUESTION_NOT_IN_INTERVIEW",
      });
    });
  });

  describe("findActiveInterviewQuestion", () => {
    it("returns null when no active question ID is set", async () => {
      interviewRepository.findActiveInterviewQuestionId.mockResolvedValue(null);

      await expect(service.findActiveInterviewQuestion("interview-1")).resolves.toBeNull();

      expect(interviewQuestionRepository.findById).not.toHaveBeenCalled();
    });

    it("looks up the active question when an ID is set", async () => {
      interviewRepository.findActiveInterviewQuestionId.mockResolvedValue("interview-question-1");
      interviewQuestionRepository.findById.mockResolvedValue(interviewQuestion);

      await expect(service.findActiveInterviewQuestion("interview-1")).resolves.toEqual(
        interviewQuestion,
      );

      expect(interviewQuestionRepository.findById).toHaveBeenCalledWith("interview-question-1");
    });
  });

  describe("clearActiveInterviewQuestion", () => {
    beforeEach(() => {
      interviewRepository.findById.mockResolvedValue(interview);
      interviewQuestionRepository.clearActiveInterviewQuestion.mockResolvedValue(undefined);
    });

    it("clears the active question for the interview owner", async () => {
      await service.clearActiveInterviewQuestion("interview-1", "owner-1");

      expect(interviewQuestionRepository.clearActiveInterviewQuestion).toHaveBeenCalledWith(
        "interview-1",
      );
    });

    it("throws when the interview does not exist", async () => {
      interviewRepository.findById.mockResolvedValue(null);

      await expect(
        service.clearActiveInterviewQuestion("missing", "owner-1"),
      ).rejects.toMatchObject({ statusCode: 404, code: "INTERVIEW_NOT_FOUND" });
    });

    it("rejects a requester who is not the owner", async () => {
      await expect(
        service.clearActiveInterviewQuestion("interview-1", "stranger"),
      ).rejects.toMatchObject({ statusCode: 403, code: "UNAUTHORIZED" });

      expect(interviewQuestionRepository.clearActiveInterviewQuestion).not.toHaveBeenCalled();
    });
  });

  describe("deleteInterviewQuestion", () => {
    beforeEach(() => {
      interviewRepository.findById.mockResolvedValue(interview);
      interviewQuestionRepository.findById.mockResolvedValue(interviewQuestion);
      participantRepository.findParticipant.mockResolvedValue(participant);
      interviewQuestionRepository.deleteInterviewQuestion.mockResolvedValue(interviewQuestion);
    });

    it("deletes a matching question for an interviewer", async () => {
      await expect(
        service.deleteInterviewQuestion(
          "interview-question-1",
          "interviewer-1",
          "interview-1",
          "question-1",
        ),
      ).resolves.toEqual(interviewQuestion);

      expect(interviewQuestionRepository.deleteInterviewQuestion).toHaveBeenCalledWith(
        "interview-question-1",
      );
    });

    it("throws when the interview does not exist", async () => {
      interviewRepository.findById.mockResolvedValue(null);

      await expect(
        service.deleteInterviewQuestion("iq", "interviewer-1", "missing", "question-1"),
      ).rejects.toMatchObject({ statusCode: 404, code: "INTERVIEW_NOT_FOUND" });
    });

    it("throws when the interview question does not exist", async () => {
      interviewQuestionRepository.findById.mockResolvedValue(null);

      await expect(
        service.deleteInterviewQuestion("missing", "interviewer-1", "interview-1", "question-1"),
      ).rejects.toMatchObject({
        statusCode: 404,
        code: "INTERVIEW_QUESTION_NOT_FOUND",
      });
    });

    it("throws when the interview question belongs to another interview", async () => {
      interviewQuestionRepository.findById.mockResolvedValue({
        ...interviewQuestion,
        interviewId: "other-interview",
      });

      await expect(
        service.deleteInterviewQuestion(
          "interview-question-1",
          "interviewer-1",
          "interview-1",
          "question-1",
        ),
      ).rejects.toMatchObject({
        statusCode: 404,
        code: "INTERVIEW_QUESTION_NOT_FOUND",
      });
    });

    it("throws when the interview question references another question", async () => {
      interviewQuestionRepository.findById.mockResolvedValue({
        ...interviewQuestion,
        questionId: "other-question",
      });

      await expect(
        service.deleteInterviewQuestion(
          "interview-question-1",
          "interviewer-1",
          "interview-1",
          "question-1",
        ),
      ).rejects.toMatchObject({
        statusCode: 404,
        code: "INTERVIEW_QUESTION_NOT_FOUND",
      });
    });

    it("rejects a requester who is not an interviewer", async () => {
      participantRepository.findParticipant.mockResolvedValue(null);

      await expect(
        service.deleteInterviewQuestion(
          "interview-question-1",
          "stranger",
          "interview-1",
          "question-1",
        ),
      ).rejects.toMatchObject({ statusCode: 403, code: "UNAUTHORIZED" });

      expect(interviewQuestionRepository.deleteInterviewQuestion).not.toHaveBeenCalled();
    });

    it("rejects a participant who is not an interviewer", async () => {
      participantRepository.findParticipant.mockResolvedValue({
        ...participant,
        role: ParticipantRole.CANDIDATE,
      });

      await expect(
        service.deleteInterviewQuestion(
          "interview-question-1",
          "candidate-1",
          "interview-1",
          "question-1",
        ),
      ).rejects.toMatchObject({ statusCode: 403, code: "UNAUTHORIZED" });
    });

    it.each([InterviewStatus.COMPLETED, InterviewStatus.CANCELLED])(
      "rejects deletion when interview status is %s",
      async (status) => {
        interviewRepository.findById.mockResolvedValue({ ...interview, status });

        await expect(
          service.deleteInterviewQuestion(
            "interview-question-1",
            "interviewer-1",
            "interview-1",
            "question-1",
          ),
        ).rejects.toMatchObject({
          statusCode: 400,
          code: "QUESTION_CANNOT_BE_DELETED",
        });
      },
    );
  });
});
