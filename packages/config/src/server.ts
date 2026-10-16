import { env } from "./env";

export const serverConfig = {
  port: env.PORT,
  environment: env.NODE_ENV,
  backend_url: env.NEXT_PUBLIC_BACKEND_URL
};
