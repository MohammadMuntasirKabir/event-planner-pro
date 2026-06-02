/**
 * Prisma client configured for Neon Postgres.
 *
 * Uses PrismaNeonHttp adapter which connects via Neon's HTTPS endpoint —
 * no WebSocket or TCP port 5432 required. DDL operations (db push / migrate)
 * are not supported via HTTP; tables are created via Neon's SQL HTTP API.
 *
 * channel_binding=require is stripped from the connection string because
 * the Neon HTTP driver handles TLS via sslmode=require.
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

  // Strip channel_binding — the Neon HTTP driver doesn't support it;
  // sslmode=require already enforces TLS.
  const connectionString = rawUrl.replace(/&?channel_binding=[^&]*/, "");

  // PrismaNeonHttp(connectionString, options?)
  // Internally calls neon(connectionString) which uses HTTPS
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
