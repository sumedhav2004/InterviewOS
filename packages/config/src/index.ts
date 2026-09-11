import { databaseConfig } from "./database";
import { redisConfig } from "./redis";
import { serverConfig } from "./server";

export const config = {
    server: serverConfig,
    database: databaseConfig,
    redis: redisConfig
}