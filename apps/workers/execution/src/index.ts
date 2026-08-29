import { executeJob } from "./executor";

async function main() {
    const result = await executeJob({
        id: "job-1",
        language: "PYTHON",
        sourceCode: 'print("Hello from execution job")',
        status: 'QUEUED'
    });

    console.log(result);
}

main().catch(console.error);