import { connectRedis, publish, redis, RedisQueue } from "@interview-os/redis";
import { ExecutionCompletedEvent, ExecutionJob } from "./types";
import { executeJob } from "./executor";

async function sleep(ms: number): Promise<void>{
    return new Promise(resolve => setTimeout(resolve,ms))
}

let shuttingDown = false;

process.on("SIGINT", () => {
    console.log("SIGINT received. Shutting down...");
    shuttingDown = true;
});

process.on("SIGTERM", () => {
    console.log("SIGTERM received. Shutting down...");
    shuttingDown = true;
});

async function main() {
    await connectRedis();

    const queue = new RedisQueue<ExecutionJob>();

    while (!shuttingDown) {
        const job = await queue.claim();

        if (!job) {
            console.log("No Job polling again....");
            await sleep(1000);
            continue;
        }

        console.log("CLAIMED:", job.id);

        try {
            const result = await executeJob(job);

            console.log("RESULT:", result);
            const event: ExecutionCompletedEvent = {
                type: "EXECUTION_COMPLETED",
                codeRunId: job.id,
                status: result.exitCode === 0 && !result.timedOut && !result.outputLimitExceeded
                    ? "SUCCESS"
                    : "FAILED",
                stdout: result.stdout,
                stderr: result.stderr,
                executionTimeMS: result.executionTimeMS,
            };
            await publish(
                "execution:results",
                JSON.stringify(event)
            );

            await queue.ack(job);

            console.log("ACKED:", job.id);
        } catch (error) {
            console.error("Execution failed:", error);
        }
    }

    console.log("Worker stopped.");
    await redis.quit();
}

main().catch(console.error);


// await connectRedis();

    // const queue = new RedisQueue<ExecutionJob>();

    // await queue.recovery();

    // console.log("Recovery complete");

    // process.exit(0);