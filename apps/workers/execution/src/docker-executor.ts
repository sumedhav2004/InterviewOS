import { spawn } from "node:child_process";
import { ExecutionResult } from "./types";

const TIMEOUT_MS = 5000;
const MAX_OUTPUT_BYTES = 1024 * 1024;

export function executePython(
    sourceCode: string
): Promise<ExecutionResult> {
    return new Promise((resolve) => {
        const start = Date.now();

        const child = spawn("docker", [
            "run",
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

        let stdout = "";
        let stderr = "";
        let finished = false;
        let outputBytes = 0;
        let outputLimitExceeded = false;
        let timedOut = false;

        const finish = (result: ExecutionResult) => {
            if (finished) return;

            finished = true;
            clearTimeout(timeout);

            resolve(result);
        };

        child.stdout.on("data", (data: Buffer) => {
            outputBytes += data.length;

            if (outputBytes > MAX_OUTPUT_BYTES) {
                outputLimitExceeded = true;

                child.kill("SIGKILL");

                return;
            }

            stdout += data.toString();
        });

        child.stderr.on("data", (data: Buffer) => {
            outputBytes += data.length;

            if (outputBytes > MAX_OUTPUT_BYTES) {
                outputLimitExceeded = true;

                child.kill("SIGKILL");

                return;
            }

            stderr += data.toString();
        });

        const timeout = setTimeout(() => {
            if (finished) return;

            timedOut = true;

            child.kill("SIGKILL");
        }, TIMEOUT_MS);

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

        child.on("close", (code, signal) => {

            finish({
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