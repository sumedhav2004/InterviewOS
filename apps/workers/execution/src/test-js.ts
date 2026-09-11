import { executeJS } from "./javascript-executor";

async function main() {
    const result = await executeJS(`
        console.log("Hello from JavaScript!");
    `);

    console.log(result);
}

main().catch(console.error);