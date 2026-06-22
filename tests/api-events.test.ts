import { NextRequest } from "next/server";
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Clerk auth
const mockAuth = vi.fn();
vi.mock("@clerk/nextjs/server", () => ({
  auth: mockAuth,
}));

// Mock rate limiter to always allow
vi.mock("@/lib/rate-limit", () => ({
  rateLimit: () => ({ allowed: true, remaining: 29, resetAt: Date.now() + 60000 }),
}));

// Mock the db module (used by API routes)
const mockDb = {
  event: {
    findFirst: vi.fn(),
    delete: vi.fn(),
    findUnique: vi.fn(),
  },
  eventRsvp: {
    delete: vi.fn(),
  },
  eventInvite: {
    findFirst: vi.fn(),
  },
};

vi.mock("@/lib/db", () => ({
  db: mockDb,
}));

// Mock prisma (used by invite route)
const mockPrisma = {
  event: {
    findFirst: vi.fn(),
  },
  eventInvite: {
    create: vi.fn(),
  },
};

vi.mock("@/lib/prisma", () => ({
  default: mockPrisma,
}));

vi.mock("@/lib/utils", () => ({
  generateToken: () => "mocktoken1234567890123456789012",
  normalizeEmail: (email: string) => email.trim().toLowerCase(),
}));

function makeRequest(body?: unknown, method = "DELETE") {
  return {
    method,
    json: body ? async () => body : async () => ({}),
    headers: new Map([["x-forwarded-for", "127.0.0.1"]]),
  } as unknown as NextRequest;
}

function makeParams(eventId: string, rsvpId?: string) {
  return Promise.resolve({ eventId, rsvpId: rsvpId ?? "" });
}

describe("DELETE /api/events/[eventId]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when user is not authenticated", async () => {
    mockAuth.mockResolvedValue({ userId: null });

    const { DELETE } = await import(
      "@/app/api/events/[eventId]/route"
    );

    const res = await DELETE(makeRequest(), {
      params: makeParams("evt-1"),
    });
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("Unauthorized");
  });

  it("returns 404 when event not found", async () => {
    mockAuth.mockResolvedValue({ userId: "user-1" });
    mockDb.event.findFirst.mockResolvedValue(null);

    const { DELETE } = await import(
      "@/app/api/events/[eventId]/route"
    );

    const res = await DELETE(makeRequest(), {
      params: makeParams("evt-nonexistent"),
    });
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe("Event not found");
  });

  it("returns 404 when user does not own the event", async () => {
    mockAuth.mockResolvedValue({ userId: "user-1" });
    mockDb.event.findFirst.mockResolvedValue(null);

    const { DELETE } = await import(
      "@/app/api/events/[eventId]/route"
    );

    const res = await DELETE(makeRequest(), {
      params: makeParams("evt-other-user"),
    });
    expect(res.status).toBe(404);
  });

  it("deletes event and returns success when user owns it", async () => {
    mockAuth.mockResolvedValue({ userId: "user-1" });
    mockDb.event.findFirst.mockResolvedValue({
      id: "evt-1",
      ownerUserId: "user-1",
    });
    mockDb.event.delete.mockResolvedValue({ id: "evt-1" });

    const { DELETE } = await import(
      "@/app/api/events/[eventId]/route"
    );

    const res = await DELETE(makeRequest(), {
      params: makeParams("evt-1"),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(mockDb.event.delete).toHaveBeenCalledWith({
      where: { id: "evt-1" },
    });
  });

  it("verifies ownership query uses correct where clause", async () => {
    mockAuth.mockResolvedValue({ userId: "user-1" });
    mockDb.event.findFirst.mockResolvedValue({
      id: "evt-1",
      ownerUserId: "user-1",
    });
    mockDb.event.delete.mockResolvedValue({ id: "evt-1" });

    const { DELETE } = await import(
      "@/app/api/events/[eventId]/route"
    );

    await DELETE(makeRequest(), {
      params: makeParams("evt-1"),
    });

    expect(mockDb.event.findFirst).toHaveBeenCalledWith({
      where: { id: "evt-1", ownerUserId: "user-1" },
    });
  });
});

describe("DELETE /api/events/[eventId]/rsvps/[rsvpId]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when user is not authenticated", async () => {
    mockAuth.mockResolvedValue({ userId: null });

    const { DELETE } = await import(
      "@/app/api/events/[eventId]/rsvps/[rsvpId]/route"
    );

    const res = await DELETE(makeRequest(), {
      params: makeParams("evt-1", "rsvp-1"),
    });
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("Unauthorized");
  });

  it("returns 404 when event not found or not owned", async () => {
    mockAuth.mockResolvedValue({ userId: "user-1" });
    mockDb.event.findFirst.mockResolvedValue(null);

    const { DELETE } = await import(
      "@/app/api/events/[eventId]/rsvps/[rsvpId]/route"
    );

    const res = await DELETE(makeRequest(), {
      params: makeParams("evt-1", "rsvp-1"),
    });
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe("Event not found");
  });

  it("deletes RSVP and returns success when user owns event", async () => {
    mockAuth.mockResolvedValue({ userId: "user-1" });
    mockDb.event.findFirst.mockResolvedValue({
      id: "evt-1",
      ownerUserId: "user-1",
    });
    mockDb.eventRsvp.delete.mockResolvedValue({ id: "rsvp-1" });

    const { DELETE } = await import(
      "@/app/api/events/[eventId]/rsvps/[rsvpId]/route"
    );

    const res = await DELETE(makeRequest(), {
      params: makeParams("evt-1", "rsvp-1"),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(mockDb.eventRsvp.delete).toHaveBeenCalledWith({
      where: { id: "rsvp-1" },
    });
  });

  it("verifies ownership query uses correct where clause", async () => {
    mockAuth.mockResolvedValue({ userId: "user-1" });
    mockDb.event.findFirst.mockResolvedValue({
      id: "evt-1",
      ownerUserId: "user-1",
    });
    mockDb.eventRsvp.delete.mockResolvedValue({ id: "rsvp-1" });

    const { DELETE } = await import(
      "@/app/api/events/[eventId]/rsvps/[rsvpId]/route"
    );

    await DELETE(makeRequest(), {
      params: makeParams("evt-1", "rsvp-1"),
    });

    expect(mockDb.event.findFirst).toHaveBeenCalledWith({
      where: { id: "evt-1", ownerUserId: "user-1" },
    });
  });
});

describe("POST /api/events/[eventId]/invite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when user is not authenticated", async () => {
    mockAuth.mockResolvedValue({ userId: null });

    const { POST } = await import(
      "@/app/api/events/[eventId]/invite/route"
    );

    const res = await POST(makeRequest({}, "POST"), {
      params: makeParams("evt-1"),
    });
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("Unauthorized");
  });

  it("returns 404 when event not found", async () => {
    mockAuth.mockResolvedValue({ userId: "user-1" });
    mockPrisma.event.findFirst.mockResolvedValue(null);

    const { POST } = await import(
      "@/app/api/events/[eventId]/invite/route"
    );

    const res = await POST(makeRequest({}, "POST"), {
      params: makeParams("evt-nonexistent"),
    });
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe("Event not found");
  });

  it("returns existing token if invite already exists", async () => {
    mockAuth.mockResolvedValue({ userId: "user-1" });
    mockPrisma.event.findFirst.mockResolvedValue({
      id: "evt-1",
      ownerUserId: "user-1",
      invite: { id: "inv-1", token: "existing-token-abc" },
    });

    const { POST } = await import(
      "@/app/api/events/[eventId]/invite/route"
    );

    const res = await POST(makeRequest({}, "POST"), {
      params: makeParams("evt-1"),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.token).toBe("existing-token-abc");
    // Should NOT create a new invite
    expect(mockPrisma.eventInvite.create).not.toHaveBeenCalled();
  });

  it("creates new invite when none exists", async () => {
    mockAuth.mockResolvedValue({ userId: "user-1" });
    mockPrisma.event.findFirst.mockResolvedValue({
      id: "evt-1",
      ownerUserId: "user-1",
      invite: null,
    });
    mockPrisma.eventInvite.create.mockResolvedValue({
      id: "inv-new",
      token: "mocktoken1234567890123456789012",
    });

    const { POST } = await import(
      "@/app/api/events/[eventId]/invite/route"
    );

    const res = await POST(makeRequest({}, "POST"), {
      params: makeParams("evt-1"),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.token).toBe("mocktoken1234567890123456789012");
    expect(mockPrisma.eventInvite.create).toHaveBeenCalledWith({
      data: { eventId: "evt-1", token: "mocktoken1234567890123456789012" },
    });
  });

  it("returns 404 when user does not own the event", async () => {
    mockAuth.mockResolvedValue({ userId: "user-1" });
    mockPrisma.event.findFirst.mockResolvedValue(null);

    const { POST } = await import(
      "@/app/api/events/[eventId]/invite/route"
    );

    const res = await POST(makeRequest({}, "POST"), {
      params: makeParams("evt-other"),
    });
    expect(res.status).toBe(404);
  });
});
