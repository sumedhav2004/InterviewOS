import { executeGo } from "./go-executor";

async function main() {
    const result = await executeGo(`
package main

import "fmt"

func main() {
    fmt.Println("Hello from Go!"
}
    `);

    console.log("RESULT:", result);
}

main().catch(console.error);