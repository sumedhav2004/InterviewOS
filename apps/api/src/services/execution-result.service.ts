import { subscribe } from "@interview-os/redis";
import { CodeRunService } from "./code-run.service";
import { ExecutionCompletedEvent } from "../types/codeRun";
import { SubmissionService } from "./submission.service";

const EXECUTION_RESULTS_CHANNEL = "execution:results";

export class ExecutionResultsService {
    constructor(
        private readonly codeRunService = new CodeRunService(),
        private readonly submissionService = new SubmissionService()
    ) {}

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