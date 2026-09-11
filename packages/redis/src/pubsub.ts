import { redis } from "./index";

export async function publish(
    channel: string,
    message: string
): Promise<void> {
    await redis.publish(channel, message);
    console.log("PUBLISHED: ", message)
}

export async function subscribe(
    channel: string,
    callback: (message: string) => void
): Promise<void> {
    const subscriber = redis.duplicate();

    await subscriber.connect();

    await subscriber.subscribe(channel, (message) => {
        callback(message);
    });
}