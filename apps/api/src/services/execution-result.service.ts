import { subscribe } from "@interview-os/redis";
import { CodeRunService } from "./code-run.service";
import { ExecutionCompletedEvent } from "../types/codeRun";
import { SubmissionService } from "./submission.service";
import { InterviewRoom } from "../realtime/websocket/interview-room";

const EXECUTION_RESULTS_CHANNEL = "execution:results";

export class ExecutionResultsService {
    private readonly codeRunService: CodeRunService
    private readonly submissionService: SubmissionService;
    constructor(
        private readonly interviewRoom: InterviewRoom,
    ){
        this.codeRunService =
            new CodeRunService(
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                interviewRoom,
            );
        this.submissionService = new SubmissionService(
            undefined, // submissionRepository
            undefined, // interviewQuestionRepository
            undefined, // participantRepository
            undefined, // testCaseRepository
            undefined, // queue
            undefined, // submissionTestCaseResultRepository
            undefined, // evaluationRepository
            undefined, // interviewRepository
            interviewRoom, // interviewRoom
        );
    }

    async start(): Promise<void> {
        await subscribe(
            EXECUTION_RESULTS_CHANNEL,
            async (message) => {
                const event =
                    JSON.parse(message) as ExecutionCompletedEvent;

                if (event.target.type === "CODE_RUN") {
                    await this.codeRunService.handleExecutionCompleted(event);
                    return;
                }

                if (event.target.type === "SUBMISSION") {
                    await this.submissionService.handleExecutionCompleted(event);
                    return;
                }
            }
        );
    }
}