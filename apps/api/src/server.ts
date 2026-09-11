import { config } from "@interview-os/config";
import { logger } from "@interview-os/logger";
import { connectRedis, redis } from "@interview-os/redis";
import app from "./app";
import { ExecutionResultsService } from "./services/execution-result.service";

async function main() {
    logger.info("Starting the server...");

    const port = config.server.port;

    await connectRedis();

    const executionResultsService = new ExecutionResultsService();
    await executionResultsService.start();

    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
}

main().catch((error) => {
    logger.error(error);
    process.exit(1);
});