import { executeCpp } from "./cpp-executor";

async function main() {
    const result = await executeCpp(`
#include <iostream>

int main() {
    std::cout << "Hello from C++!" << std::endl
    return 0;
}
    `);

    console.log("RESULT:", result);
}

main().catch(console.error);