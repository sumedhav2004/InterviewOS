import pinoHttp from "pino-http";
import { logger } from "@interview-os/logger";

export const loggerMiddleware = pinoHttp({
  logger,

  customProps(req) {
    return {
      requestId: req.headers["x-request-id"],
    };
  },
});
