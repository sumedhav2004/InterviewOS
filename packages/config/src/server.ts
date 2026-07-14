import { env } from "./env";

export const serverConfig = {
        port: env.PORT,
        environment: env.NODE_ENV
}