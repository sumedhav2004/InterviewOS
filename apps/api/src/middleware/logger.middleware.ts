import pinoHttp from "pino-http";
import { logger } from "../../../../packages/logger/src"

export const loggerMiddleware = pinoHttp({
  logger,

  customProps(req) {
      return {
        requestId: req.headers["x-request-id"],
      }
  },
});