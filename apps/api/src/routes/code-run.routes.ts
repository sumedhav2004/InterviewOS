
import { Router } from "express";
import { CodeRunController } from "../controllers/code-run.controller";
import { InterviewRoom } from "../realtime/websocket/interview-room";

export function createCodeRunRouter(interviewRoom: InterviewRoom) {
    const router = Router();

    const codeRunController = new CodeRunController(interviewRoom);

    router.post(
        "/",
        codeRunController.createCodeRun.bind(codeRunController),
    );

    router.patch(
        "/:id",
        codeRunController.updateCodeRun.bind(codeRunController),
    );

    router.get(
        "/:id",
        codeRunController.getCodeRunResults.bind(codeRunController),
    );

    router.post(
        "/:id/execute",
        codeRunController.executeCodeRun.bind(codeRunController),
    );

    return router;
}