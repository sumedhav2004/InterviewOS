import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { ExecutionResult } from "./types";

const TIMEOUT_MS = 5000;
const MAX_OUTPUT_BYTES = 1024 * 1024;

function runDocker(args: string[]): Promise<void> {
    return new Promise((resolve) => {
        const process = spawn("docker", args);

        process.on("close", () => {
            resolve();
        });

        process.on("error", () => {
            resolve();
        });
    });
}

export function executePython(
    sourceCode: string
): Promise<ExecutionResult> {
    return new Promise((resolve) => {
        const start = Date.now();
        const containerName = `interviewos-exec-${randomUUID()}`;

        let stdout = "";
        let stderr = "";
        let finished = false;
        let outputBytes = 0;
        let outputLimitExceeded = false;
        let timedOut = false;

        const child = spawn("docker", [
            "run",
            "--name",
            containerName,
            "--rm",
            "--memory",
            "128m",
            "--cpus",
            "0.5",
            "--pids-limit",
            "64",
            "--network",
            "none",
            "python:3.12-slim",
            "python",
            "-c",
            sourceCode,
        ]);

        let cleanupStarted = false;

        const cleanup = async () => {
            if (cleanupStarted) return;
            cleanupStarted = true;
            await runDocker(["rm", "-f", containerName]);
        };

        const finish = async (result: ExecutionResult) => {
            if (finished) return;

            finished = true;
            clearTimeout(timeout);

            await cleanup();

            resolve(result);
        };

        child.stdout.on("data", (data: Buffer) => {
            outputBytes += data.length;

            if (outputBytes > MAX_OUTPUT_BYTES) {
                outputLimitExceeded = true;

                void cleanup();

                return;
            }

            stdout += data.toString();
        });

        child.stderr.on("data", (data: Buffer) => {
            outputBytes += data.length;

            if (outputBytes > MAX_OUTPUT_BYTES) {
                outputLimitExceeded = true;

                void cleanup();

                return;
            }

            stderr += data.toString();
        });

        const timeout = setTimeout(() => {
            if (finished) return;

            timedOut = true;

            void cleanup();
        }, TIMEOUT_MS);

        child.on("error", (error) => {
            void finish({
                stdout,
                stderr: stderr || error.message,
                exitCode: null,
                timedOut,
                outputLimitExceeded,
                executionTimeMs: Date.now() - start,
            });
        });

        child.on("close", (code) => {
            void finish({
                stdout,
                stderr,
                exitCode: code,
                timedOut,
                outputLimitExceeded,
                executionTimeMs: Date.now() - start,
            });
        });
    });
}