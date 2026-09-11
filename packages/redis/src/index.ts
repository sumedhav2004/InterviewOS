import { createClient } from "redis";
import { config } from "@interview-os/config";

export const redis = createClient({
    url: config.redis.redisURL
});

redis.on("error", (error) => {
    console.error("Redis Client Error:", error);
});

export async function connectRedis() {
    await redis.connect();
}

export * from "./queue"
export * from "./pubsub"