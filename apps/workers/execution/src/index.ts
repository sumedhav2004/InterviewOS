import { executePython } from "./docker-executor";

async function main() {
    const result = await executePython(`
import urllib.request

try:
    urllib.request.urlopen("https://example.com", timeout=2)
    print("NETWORK ACCESS WORKED")
except Exception as e:
    print(type(e).__name__)
`);

    console.log(result);
}

main().catch(console.error);