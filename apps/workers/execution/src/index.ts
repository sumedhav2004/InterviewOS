import { executeJob } from "./executor";

async function main() {
    const result = await executeJob({
        id: "job-1",

        participantId: "participant-1",
        interviewQuestionId: "question-1",

        language: "PYTHON",

        sourceCode: `
x = int(input())
print(x * x)
`,

        input: "5\n",

        status: "QUEUED",
    });

    console.log(result);
}

main().catch(console.error);