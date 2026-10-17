import * as pkg from "../generated/client/index.js";

const { PrismaClient } = pkg;

export const prisma = new PrismaClient();
