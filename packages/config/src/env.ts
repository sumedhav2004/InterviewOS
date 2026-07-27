import { config as loadEnv } from "dotenv";
import { z } from "zod";
import path from "node:path";

console.log("__dirname:", __dirname);
console.log("cwd:", process.cwd());
loadEnv({
  path: path.resolve(process.cwd(), "../../infrastructure/.env"),
});

const envSchema = z.object({
    NODE_ENV: z
        .enum(["development", "test", "production"])
        .default("development"),

    PORT: z.coerce.number().default(3001),
    DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
    CLERK_SECRET_KEY: z.string().min(1),
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
});

export const env = envSchema.parse(process.env);