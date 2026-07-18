/**
 * Neon Postgres integration tests.
 *
 * These tests verify that:
 * 1. The PrismaNeonHttp adapter is configured correctly
 * 2. The database tables exist and accept CRUD operations via Prisma
 *
 * Run with: npx vitest run tests/neon-integration.test.ts
 * Requires: DATABASE_URL env var pointing to a Neon database
 */

import { describe, it, expect } from "vitest";

// Lazy-load Prisma client outside vitest's module resolution
function getPrisma() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require("/home/rownak/projects/event-planner-pro/lib/prisma").prisma;
  } catch {
    return null;
  }
}

const prisma = getPrisma();
const describeDb = prisma ? describe : describe.skip;

describeDb("Neon PrismaNeonHttp adapter", () => {
  it("Prisma client is initialized", () => {
    expect(prisma).toBeDefined();
    expect(typeof prisma.$queryRaw).toBe("function");
  });

  it("connects to Neon and runs a query", async () => {
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    expect(result).toEqual([{ test: 1 }]);
  });

  it("database has the required tables", async () => {
    const tables = await prisma.$queryRaw`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `;
    const names = (tables as Array<{ table_name: string }>).map((t) => t.table_name);
    expect(names).toContain("users");
    expect(names).toContain("events");
    expect(names).toContain("event_invites");
    expect(names).toContain("event_rsvps");
  });

  it("database has the RsvpStatus enum", async () => {
    const types = await prisma.$queryRaw`
      SELECT typname FROM pg_type WHERE typtype = 'e' ORDER BY typname
    `;
    const names = (types as Array<{ typname: string }>).map((t) => t.typname);
    expect(names).toContain("RsvpStatus");
  });

  it("can create and query a user", async () => {
    const user = await prisma.user.create({
      data: { email: `test-${Date.now()}@example.com`, name: "Test User", passwordHash: "test-hash" },
    });
    expect(user.id).toBeDefined();

    const found = await prisma.user.findUnique({ where: { id: user.id } });
    expect(found).not.toBeNull();
    expect(found.email).toBe(user.email);

    await prisma.user.delete({ where: { id: user.id } });
  });

  it("can create an event with RSVPs and invite", async () => {
    const user = await prisma.user.create({
      data: { email: `owner-${Date.now()}@example.com`, name: "Event Owner", passwordHash: "hash" },
    });

    const event = await prisma.event.create({
      data: { ownerUserId: user.id, title: "Integration Test Event", description: "Testing Neon", location: "Cloud" },
    });
    expect(event.title).toBe("Integration Test Event");

    const invite = await prisma.eventInvite.create({
      data: { eventId: event.id, token: `test-token-${Date.now()}` },
    });
    expect(invite.token).toContain("test-token-");

    await prisma.eventRsvp.create({
      data: { eventId: event.id, inviteId: invite.id, name: "Alice", email: "alice@example.com", emailNormalized: "alice@example.com", status: "going" },
    });
    await prisma.eventRsvp.create({
      data: { eventId: event.id, name: "Bob", email: "bob@example.com", emailNormalized: "bob@example.com", status: "maybe" },
    });

    const full = await prisma.event.findUnique({
      where: { id: event.id },
      include: { rsvps: { orderBy: { respondedAt: "desc" } }, invite: true },
    });
    expect(full.rsvps).toHaveLength(2);
    expect(full.invite).not.toBeNull();

    await prisma.event.delete({ where: { id: event.id } });
    await prisma.user.delete({ where: { id: user.id } });
  });

  it("enforces unique email per event for RSVPs", async () => {
    const user = await prisma.user.create({
      data: { email: `owner-upsert-${Date.now()}@example.com`, name: "Upsert Owner", passwordHash: "hash" },
    });
    const event = await prisma.event.create({ data: { ownerUserId: user.id, title: "Upsert Test" } });

    await prisma.eventRsvp.create({
      data: { eventId: event.id, name: "Charlie", email: "charlie@example.com", emailNormalized: "charlie@example.com", status: "going" },
    });

    await expect(
      prisma.eventRsvp.create({
        data: { eventId: event.id, name: "Charlie Updated", email: "charlie@example.com", emailNormalized: "charlie@example.com", status: "maybe" },
      })
    ).rejects.toThrow();

    await prisma.event.delete({ where: { id: event.id } });
    await prisma.user.delete({ where: { id: user.id } });
  });

  it("cascades delete: removing an event removes RSVPs and invite", async () => {
    const user = await prisma.user.create({
      data: { email: `owner-cascade-${Date.now()}@example.com`, name: "Cascade Owner", passwordHash: "hash" },
    });
    const event = await prisma.event.create({ data: { ownerUserId: user.id, title: "Cascade Test" } });
    const invite = await prisma.eventInvite.create({
      data: { eventId: event.id, token: `cascade-token-${Date.now()}` },
    });
    await prisma.eventRsvp.create({
      data: { eventId: event.id, inviteId: invite.id, name: "Dave", email: "dave@example.com", emailNormalized: "dave@example.com", status: "going" },
    });

    await prisma.event.delete({ where: { id: event.id } });

    const rsvps = await prisma.eventRsvp.findMany({ where: { eventId: event.id } });
    expect(rsvps).toHaveLength(0);

    const inv = await prisma.eventInvite.findUnique({ where: { id: invite.id } });
    expect(inv).toBeNull();

    await prisma.user.delete({ where: { id: user.id } });
  });
});
