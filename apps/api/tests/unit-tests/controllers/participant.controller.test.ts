
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ParticipantController } from "../../../src/controllers/participant.controller";

const {
    mockCreateParticipant,
    mockUpdateParticipant,
    mockGetParticipantsForInterview,
} = vi.hoisted(() => ({
    mockCreateParticipant: vi.fn(),
    mockUpdateParticipant: vi.fn(),
    mockGetParticipantsForInterview: vi.fn(),
}));

vi.mock("../../../src/services/interviewParticipant.service", () => ({
    InterviewParticipantService: class {
        createParticipant = mockCreateParticipant;
        updateParticipant = mockUpdateParticipant;
        getParticipantsForInterview = mockGetParticipantsForInterview;
    },
}));

describe("ParticipantController", () => {
    let controller: ParticipantController;
    let req: any;
    let res: any;

    beforeEach(() => {
        vi.clearAllMocks();

        controller = new ParticipantController();

        req = {
            params: {},
            body: {},
            user: { id: "user-1" },
        };

        res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn().mockReturnThis(),
        };
    });

    describe("createParticipant", () => {
        it("should create a participant and return 201", async () => {
            const data = { role: "INTERVIEWER" };
            const participant = {
                id: "participant-1",
                targetId: "target-1",
                interviewId: "interview-1",
            };

            req.params.interviewId = "interview-1";
            req.body = {
                targetId: "target-1",
                ...data,
            };
            mockCreateParticipant.mockResolvedValue(participant);

            await controller.createParticipant(req, res);

            expect(mockCreateParticipant).toHaveBeenCalledWith(
                "user-1",
                "target-1",
                "interview-1",
                data,
            );
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(participant);
        });

        it("should return 400 when interviewId is not a string", async () => {
            req.params.interviewId = ["interview-1"];
            req.body = { targetId: "target-1" };

            await controller.createParticipant(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: "Invalid route parameter",
            });
            expect(mockCreateParticipant).not.toHaveBeenCalled();
        });

        it("should propagate service errors", async () => {
            req.params.interviewId = "interview-1";
            req.body = { targetId: "target-1", role: "INTERVIEWER" };
            mockCreateParticipant.mockRejectedValue(
                new Error("Participant creation failed"),
            );

            await expect(
                controller.createParticipant(req, res),
            ).rejects.toThrow("Participant creation failed");
        });
    });

    describe("updateParticipant", () => {
        it("should update a participant and return 200", async () => {
            const data = { role: "CANDIDATE" };
            const participant = {
                id: "participant-1",
                targetId: "target-1",
                interviewId: "interview-1",
                role: "CANDIDATE",
            };

            req.params.interviewId = "interview-1";
            req.body = {
                targetId: "target-1",
                ...data,
            };
            mockUpdateParticipant.mockResolvedValue(participant);

            await controller.updateParticipant(req, res);

            expect(mockUpdateParticipant).toHaveBeenCalledWith(
                "user-1",
                "target-1",
                "interview-1",
                data,
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(participant);
        });

        it("should return 400 when interviewId is not a string", async () => {
            req.params.interviewId = ["interview-1"];
            req.body = { targetId: "target-1" };

            await controller.updateParticipant(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: "Invalid route parameter",
            });
            expect(mockUpdateParticipant).not.toHaveBeenCalled();
        });

        it("should propagate service errors", async () => {
            req.params.interviewId = "interview-1";
            req.body = { targetId: "target-1", role: "CANDIDATE" };
            mockUpdateParticipant.mockRejectedValue(
                new Error("Participant update failed"),
            );

            await expect(
                controller.updateParticipant(req, res),
            ).rejects.toThrow("Participant update failed");
        });
    });

    describe("getParticipantsForInterview", () => {
        it("should return participants with status 200", async () => {
            const participants = [
                { id: "participant-1" },
                { id: "participant-2" },
            ];

            req.params.interviewId = "interview-1";
            mockGetParticipantsForInterview.mockResolvedValue(participants);

            await controller.getParticipantsForInterview(req, res);

            expect(mockGetParticipantsForInterview).toHaveBeenCalledWith(
                "interview-1",
                "user-1",
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(participants);
        });

        it("should return 400 when interviewId is not a string", async () => {
            req.params.interviewId = ["interview-1"];

            await controller.getParticipantsForInterview(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: "Invalid route parameter",
            });
            expect(mockGetParticipantsForInterview).not.toHaveBeenCalled();
        });

        it("should propagate service errors", async () => {
            req.params.interviewId = "interview-1";
            mockGetParticipantsForInterview.mockRejectedValue(
                new Error("Participant lookup failed"),
            );

            await expect(
                controller.getParticipantsForInterview(req, res),
            ).rejects.toThrow("Participant lookup failed");
        });
    });
});
