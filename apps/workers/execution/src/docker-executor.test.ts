import { describe, expect, it } from "vitest";
import { executePython } from "./docker-executor";

describe("executePython", () => {
    it("should execute valid Python code", async () => {
        const result = await executePython(
            'print("Hello from sandbox")\nprint(2 + 3)'
        );

        expect(result.stdout).toBe("Hello from sandbox\n5\n");
        expect(result.stderr).toBe("");
        expect(result.exitCode).toBe(0);
        expect(result.timedOut).toBe(false);
        expect(result.outputLimitExceeded).toBe(false);
    });

    it("should timeout infinite loops", async () => {
        const result = await executePython(
            "while True:\n    pass"
        );

        expect(result.timedOut).toBe(true);
        expect(result.outputLimitExceeded).toBe(false);
    }, 10000);

    it("should stop execution when output exceeds the limit", async () => {
        const result = await executePython(
            'while True:\n    print("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA")'
        );

        expect(result.timedOut).toBe(false);
        expect(result.outputLimitExceeded).toBe(true);
    });

    it("should not persist files after execution", async () => {
    const result = await executePython(`
with open("/tmp/test.txt", "w") as f:
    f.write("secret")

print(open("/tmp/test.txt").read())
`);

    expect(result.stdout).toBe("secret\n");
    expect(result.exitCode).toBe(0);

    const secondResult = await executePython(`
import os

print(os.path.exists("/tmp/test.txt"))
`);

    expect(secondResult.stdout).toBe("False\n");
    expect(secondResult.exitCode).toBe(0);
});
    it("should not allow network access", async () => {
    const result = await executePython(`
import urllib.request

try:
    urllib.request.urlopen("https://example.com", timeout=2)
    print("NETWORK_ACCESS_WORKED")
except Exception as e:
    print(type(e).__name__)
`);

    expect(result.stdout).toBe("URLError\n");
    expect(result.exitCode).toBe(0);
});

});