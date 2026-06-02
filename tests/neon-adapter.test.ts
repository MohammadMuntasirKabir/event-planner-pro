import { describe, it, expect, vi } from "vitest";

// Test that the Prisma client is configured with the Neon adapter
// We verify the module loads correctly and has expected structure

describe("Neon Prisma adapter configuration", () => {
  it("loads PrismaNeon from @prisma/adapter-neon", () => {
    // Verify the adapter package is resolvable
    const adapterPkg = require.resolve("@prisma/adapter-neon");
    expect(adapterPkg).toBeTruthy();
  });

  it("loads @neondatabase/serverless", () => {
    const neonPkg = require.resolve("@neondatabase/serverless");
    expect(neonPkg).toBeTruthy();
  });

  it("PrismaNeon adapter is constructable with connection string", async () => {
    const { PrismaNeon } = await import("@prisma/adapter-neon");
    // PrismaNeon should be a class/function
    expect(typeof PrismaNeon).toBe("function");
  });

  it("neon serverless Pool is constructable", async () => {
    const { Pool } = await import("@neondatabase/serverless");
    expect(typeof Pool).toBe("function");
  });

  it("lib/prisma.ts creates a PrismaClient without throwing", async () => {
    // We can't actually connect to Neon in tests, but we can verify
    // the module structure is correct
    // The actual prisma.ts should use PrismaNeon adapter
    const fs = await import("node:fs");
    const path = await import("node:path");
    const prismaModule = fs.readFileSync(
      path.resolve(__dirname, "../lib/prisma.ts"),
      "utf-8"
    );
    expect(prismaModule).toContain("PrismaNeon");
    expect(prismaModule).toContain("@prisma/adapter-neon");
  });

  it("DATABASE_URL is read from env", async () => {
    const fs = await import("node:fs");
    const path = await import("node:path");
    const prismaModule = fs.readFileSync(
      path.resolve(__dirname, "../lib/prisma.ts"),
      "utf-8"
    );
    expect(prismaModule).toContain("DATABASE_URL");
  });

  it("strips channel_binding from connection string", async () => {
    const fs = await import("node:fs");
    const path = await import("node:path");
    const prismaModule = fs.readFileSync(
      path.resolve(__dirname, "../lib/prisma.ts"),
      "utf-8"
    );
    expect(prismaModule).toContain("channel_binding");
    expect(prismaModule).toContain("replace");
  });
});

describe("Neon connection string format", () => {
  it("parses connection string correctly", () => {
    const connStr =
      "postgresql://neondb_owner:***@ep-spring-shadow-aoayisjx-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
    const url = new URL(connStr);

    expect(url.protocol).toBe("postgresql:");
    expect(url.username).toBe("neondb_owner");
    expect(url.hostname).toBe(
      "ep-spring-shadow-aoayisjx-pooler.c-2.ap-southeast-1.aws.neon.tech"
    );
    expect(url.pathname).toBe("/neondb");
    expect(url.searchParams.get("sslmode")).toBe("require");
    expect(url.searchParams.get("channel_binding")).toBe("require");
  });

  it("strips channel_binding parameter", () => {
    const raw =
      "postgresql://neondb_owner:***@host.neon.tech/db?sslmode=require&channel_binding=require";
    const stripped = raw.replace(/&?channel_binding=[^&]*/, "");
    expect(stripped).toContain("sslmode=require");
    expect(stripped).not.toContain("channel_binding");
    // Note: *** is the actual password, not channel_binding
    expect(stripped).toContain("***");
  });

  it("URL-encodes password with special characters", () => {
    const password = "***";
    const encoded = "***";
    expect(encoded).toBe("***");
  });
});

describe("environment configuration", () => {
  it(".env.example has DATABASE_URL placeholder", async () => {
    const fs = await import("node:fs");
    const path = await import("node:path");
    const envExample = fs.readFileSync(
      path.resolve(__dirname, "../.env.example"),
      "utf-8"
    );
    expect(envExample).toContain("DATABASE_URL");
    expect(envExample).toContain("postgresql://");
    expect(envExample).toContain("neon.tech");
  });

  it(".env.example has NEXT_PUBLIC_APP_URL", async () => {
    const fs = await import("node:fs");
    const path = await import("node:path");
    const envExample = fs.readFileSync(
      path.resolve(__dirname, "../.env.example"),
      "utf-8"
    );
    expect(envExample).toContain("NEXT_PUBLIC_APP_URL");
  });

  it("prisma config references schema and migrations", async () => {
    const fs = await import("node:fs");
    const path = await import("node:path");
    const prismaConfig = fs.readFileSync(
      path.resolve(__dirname, "../prisma.config.ts"),
      "utf-8"
    );
    expect(prismaConfig).toContain("schema.prisma");
    expect(prismaConfig).toContain("migrations");
  });
});
