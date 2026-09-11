import { executeRust } from "./rust-executor";

async function main() {
    const result = await executeRust(`
fn main() {
    println!("Hello from Rust!")
    println!("This should fail");
}
    `);

    console.log("RESULT:", result);
}

main().catch(console.error);