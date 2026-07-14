
import { config } from "@interview-os/config"
import { logger } from "@interview-os/logger"
import app from "./app";

logger.info("Starting the server...");
const port = config.server.port;

app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
})