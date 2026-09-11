import { executeC } from "./c-executor";

async function main() {
    const result = await executeC(`
#include <stdio.h>

int main() {
    printf("Hello from C!\\n")
    return 0;
}
    `);

    console.log("RESULT:", result);
}

main().catch(console.error);