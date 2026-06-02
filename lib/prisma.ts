/**
 * Prisma client configured for Neon Postgres.
 *
 * Uses PrismaNeonHttp adapter which connects via Neon's HTTPS endpoint —
 * no WebSocket or TCP port 5432 required.
 *
 * channel_binding=require is stripped because the HTTP driver handles
 * TLS via sslmode=require.
 */

import { PrismaNeonHttp } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const rawUrl = process.env.DATABASE_URL;
  if (!rawUrl) {
    throw new Error("DATABASE_URL is not set.");
  }

  const connectionString = rawUrl.replace(/&?channel_binding=[^&]*/, "");
  const adapter = new PrismaNeonHttp(connectionString, {});
  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
