import { connectRedis, publish, redis, RedisQueue } from "@interview-os/redis";
import { ExecutionCompletedEvent, ExecutionJob } from "./types";
import { executeJob } from "./executor";

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

let shuttingDown = false;

process.on("SIGINT", () => {
  shuttingDown = true;
});

process.on("SIGTERM", () => {
  shuttingDown = true;
});

async function main() {
  await connectRedis();

  const queue = new RedisQueue<ExecutionJob>();

  while (!shuttingDown) {
    const job = await queue.claim();

    if (!job) {
      await sleep(1000);
      continue;
    }

    try {
      const result = await executeJob(job);

      const event: ExecutionCompletedEvent = {
        type: "EXECUTION_COMPLETED",
        target: job.target,
        testCaseId: job.testCaseId,
        status:
          result.exitCode === 0 && !result.timedOut && !result.outputLimitExceeded
            ? "SUCCESS"
            : "FAILED",
        stdout: result.stdout,
        stderr: result.stderr,
        executionTimeMS: result.executionTimeMS,
        exitCode: result.exitCode,
        timedOut: result.timedOut,
        outputLimitExceeded: result.outputLimitExceeded,
      };
      await publish("execution:results", JSON.stringify(event));

      await queue.ack(job);
    } catch (error) {
      console.error("Execution failed:", error);
    }
  }

  await redis.quit();
}

main().catch(console.error);
