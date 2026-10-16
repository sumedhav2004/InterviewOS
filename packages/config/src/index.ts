import { databaseConfig } from "./database.js";
import { redisConfig } from "./redis.js";
import { serverConfig } from "./server.js";

export const config = {
  server: serverConfig,
  database: databaseConfig,
  redis: redisConfig,
};
