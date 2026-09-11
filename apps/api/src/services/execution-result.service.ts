import { subscribe } from "@interview-os/redis";
import { CodeRunService } from "./code-run.service";
import { ExecutionCompletedEvent } from "../types/codeRun";

const EXECUTION_RESULTS_CHANNEL = "execution:results";

export class ExecutionResultsService {
    constructor(
        private readonly codeRunService = new CodeRunService()
    ) {}

    async start(): Promise<void> {
        await subscribe(
            EXECUTION_RESULTS_CHANNEL,
            async (message) => {
                const event =
                    JSON.parse(message) as ExecutionCompletedEvent;

                await this.codeRunService.handleExecutionCompleted(event);
            }
        );
    }
}