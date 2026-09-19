import { createServer } from "http";
import { config } from "@interview-os/config";
import { logger } from "@interview-os/logger";
import { connectRedis } from "@interview-os/redis";

import app from "./app";
import { ExecutionResultsService } from "./services/execution-result.service";
import { RealtimeWebSocketServer } from "./realtime/websocket/websocket-server";

async function main() {
    logger.info("Starting the server...");

    const port = config.server.port;

    await connectRedis();

    const executionResultsService = new ExecutionResultsService();
    await executionResultsService.start();

    const httpServer = createServer(app);

    new RealtimeWebSocketServer(httpServer);

    httpServer.listen(port, () => {
        logger.info(`Server is running on port ${port}`);
    });
}

main().catch((error) => {
    logger.error(error);
    process.exit(1);
});