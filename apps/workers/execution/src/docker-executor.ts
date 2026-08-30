import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { ExecutionResult } from "./types";

const TIMEOUT_MS = 5000;
const MAX_OUTPUT_BYTES = 1024 * 1024;

export function executePython(
    sourceCode: string,
    input?: string
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
        let cleanupStarted = false;

        const cleanup = () => {
            if (cleanupStarted) return;

            cleanupStarted = true;

            // Explicitly remove the actual container.
            //
            // --rm is also present on docker run, so this is
            // an additional safety net for abnormal termination.
            const cleanupProcess = spawn("docker", [
                "rm",
                "-f",
                containerName,
            ]);

            cleanupProcess.on("error", () => {
                // Cleanup is best-effort here.
                //
                // --rm on the original container provides
                // another cleanup mechanism.
            });
        };

        const finish = (result: ExecutionResult) => {
            if (finished) return;

            finished = true;

            clearTimeout(timeout);

            cleanup();

            resolve(result);
        };

        const child = spawn(
            "docker",
            [
                "run",

                "--interactive",

                "--name",
                containerName,

                // Automatically remove the container when it exits.
                "--rm",

                // Resource limits.
                "--memory",
                "128m",

                "--cpus",
                "0.5",

                "--pids-limit",
                "64",

                // No network access.
                "--network",
                "none",

                // Do not persist container stdout/stderr
                // as Docker logs.
                "--log-driver",
                "none",

                // Python sandbox image.
                "python:3.12-slim",

                "python",
                "-c",
                sourceCode,
            ],
            {
                stdio: ["pipe", "pipe", "pipe"],
            }
        );

        const timeout = setTimeout(() => {
            if (finished) return;

            timedOut = true;

            finish({
                stdout,
                stderr,
                exitCode: null,
                timedOut: true,
                outputLimitExceeded,
                executionTimeMs: Date.now() - start,
            });
        }, TIMEOUT_MS);

        child.stdout.on("data", (data: Buffer) => {
            outputBytes += data.length;

            if (outputBytes > MAX_OUTPUT_BYTES) {
                outputLimitExceeded = true;

                finish({
                    stdout,
                    stderr,
                    exitCode: null,
                    timedOut: false,
                    outputLimitExceeded: true,
                    executionTimeMs: Date.now() - start,
                });

                return;
            }

            stdout += data.toString();
        });

        child.stderr.on("data", (data: Buffer) => {
            outputBytes += data.length;

            if (outputBytes > MAX_OUTPUT_BYTES) {
                outputLimitExceeded = true;

                finish({
                    stdout,
                    stderr,
                    exitCode: null,
                    timedOut: false,
                    outputLimitExceeded: true,
                    executionTimeMs: Date.now() - start,
                });

                return;
            }

            stderr += data.toString();
        });

        child.on("error", (error) => {
            finish({
                stdout,
                stderr: stderr || error.message,
                exitCode: null,
                timedOut,
                outputLimitExceeded,
                executionTimeMs: Date.now() - start,
            });
        });

        child.on("close", (code) => {
            finish({
                stdout,
                stderr,
                exitCode: code,
                timedOut,
                outputLimitExceeded,
                executionTimeMs: Date.now() - start,
            });
        });

        if (input !== undefined) {
            child.stdin.write(input);
        }

        child.stdin.end();
    });
}