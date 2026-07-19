import { describe, it, expect, vi, beforeEach } from "vitest";

// We test server actions by mocking their dependencies (auth, prisma, etc.)
// and verifying the logic flows correctly.

// Mock Clerk auth and clerkClient
const mockAuth = vi.fn();
const mockClerkClient = vi.fn();
// Mock NextAuth
vi.mock("@/auth", () => ({
  auth: mockAuth,
  clerkClient: mockClerkClient,
}));

// Track prisma calls
const mockPrismaUser = {
  findUnique: vi.fn(),
  create: vi.fn(),
};

const mockPrismaEvent = {
  create: vi.fn(),
  findMany: vi.fn(),
  findFirst: vi.fn(),
  findUnique: vi.fn(),
  delete: vi.fn(),
  deleteMany: vi.fn(),
};

const mockPrismaEventInvite = {
  create: vi.fn(),
};

const mockPrismaEventRsvp = {
  findUnique: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
};

const mockRevalidatePath = vi.fn();
vi.mock("next/cache", () => ({
  revalidatePath: mockRevalidatePath,
}));

const mockRedirect = vi.fn();
vi.mock("next/navigation", () => ({
  redirect: mockRedirect,
}));

vi.mock("@/lib/prisma", () => ({
  default: {
    user: mockPrismaUser,
    event: mockPrismaEvent,
    eventInvite: mockPrismaEventInvite,
    eventRsvp: mockPrismaEventRsvp,
    $queryRaw: vi.fn(),
  },
}));

vi.mock("@/lib/utils", () => ({
  generateToken: () => "generatedtoken123456789012345678",
  normalizeEmail: (email: string) => email.trim().toLowerCase(),
}));

function makeFormData(entries: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(entries)) {
    fd.append(key, value);
  }
  return fd;
}

describe("createEvent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockPrismaUser.findUnique.mockResolvedValue({ id: "user-1", email: "test@test.com" });
  });

  it("throws error when title is empty", async () => {
    const { createEvent } = await import("@/lib/actions/events");
    const fd = makeFormData({ title: "", description: "test" });
    await expect(createEvent(fd)).rejects.toThrow("Title is required");
  });

  it("throws error when title is only whitespace", async () => {
    const { createEvent } = await import("@/lib/actions/events");
    const fd = makeFormData({ title: "   " });
    await expect(createEvent(fd)).rejects.toThrow("Title is required");
  });

  it("creates event with required fields", async () => {
    const { createEvent } = await import("@/lib/actions/events");
    mockPrismaEvent.create.mockResolvedValue({ id: "evt-new-1" });

    const fd = makeFormData({
      title: "Team Dinner",
    });

    try {
      await createEvent(fd);
    } catch {
      // redirect() throws in Next.js
    }

    expect(mockPrismaEvent.create).toHaveBeenCalledWith({
      data: {
        ownerUserId: "user-1",
        title: "Team Dinner",
        description: null,
        location: null,
        eventDate: null,
      },
    });
    expect(mockRevalidatePath).toHaveBeenCalledWith("/dashboard");
    expect(mockRedirect).toHaveBeenCalledWith("/events/evt-new-1");
  });

  it("creates event with all fields", async () => {
    const { createEvent } = await import("@/lib/actions/events");
    mockPrismaEvent.create.mockResolvedValue({ id: "evt-new-2" });

    const fd = makeFormData({
      title: "Birthday Party",
      description: "Come celebrate!",
      location: "My House",
      eventDate: "2026-07-04T18:00",
    });

    try {
      await createEvent(fd);
    } catch {}

    expect(mockPrismaEvent.create).toHaveBeenCalledWith({
      data: {
        ownerUserId: "user-1",
        title: "Birthday Party",
        description: "Come celebrate!",
        location: "My House",
        eventDate: new Date("2026-07-04T18:00"),
      },
    });
  });

  it("trims whitespace from title", async () => {
    const { createEvent } = await import("@/lib/actions/events");
    mockPrismaEvent.create.mockResolvedValue({ id: "evt-new-3" });

    const fd = makeFormData({
      title: "  My Event  ",
    });

    try {
      await createEvent(fd);
    } catch {}

    expect(mockPrismaEvent.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ title: "My Event" }),
      })
    );
  });

  it("redirects to signin when not authenticated", async () => {
    mockAuth.mockResolvedValue({ user: null });

    const { createEvent } = await import("@/lib/actions/events");
    const fd = makeFormData({ title: "Test" });

    try {
      await createEvent(fd);
    } catch {}

    expect(mockRedirect).toHaveBeenCalledWith("/auth/signin");
  });
});

describe("getMyEvents", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns empty array when not authenticated", async () => {
    mockAuth.mockResolvedValue({ user: null });
    const { getMyEvents } = await import("@/lib/actions/events");
    const result = await getMyEvents();
    expect(result).toEqual([]);
  });

  it("returns events with RSVP counts", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockPrismaEvent.findMany.mockResolvedValue([
      {
        id: "evt-1",
        title: "Event One",
        description: "Desc",
        location: "Loc",
        eventDate: new Date("2026-06-15"),
        createdAt: new Date("2026-06-01"),
        invite: { token: "tok-1", id: "inv-1" },
        rsvps: [
          { status: "going" },
          { status: "going" },
          { status: "maybe" },
          { status: "not_going" },
        ],
      },
    ]);

    const { getMyEvents } = await import("@/lib/actions/events");
    const result = await getMyEvents();

    expect(result).toHaveLength(1);
    expect(result[0].rsvpCounts).toEqual({
      going: 2,
      maybe: 1,
      not_going: 1,
      total: 4,
    });
  });

  it("returns events ordered by createdAt desc", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockPrismaEvent.findMany.mockResolvedValue([]);

    const { getMyEvents } = await import("@/lib/actions/events");
    await getMyEvents();

    expect(mockPrismaEvent.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { createdAt: "desc" },
      })
    );
  });

  it("returns empty RSVP counts when no RSVPs", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockPrismaEvent.findMany.mockResolvedValue([
      {
        id: "evt-1",
        title: "No RSVPs",
        rsvps: [],
        invite: null,
      },
    ]);

    const { getMyEvents } = await import("@/lib/actions/events");
    const result = await getMyEvents();

    expect(result[0].rsvpCounts).toEqual({
      going: 0,
      maybe: 0,
      not_going: 0,
      total: 0,
    });
  });
});

describe("getEventById", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null when not authenticated", async () => {
    mockAuth.mockResolvedValue({ user: null });
    const { getEventById } = await import("@/lib/actions/events");
    const result = await getEventById("evt-1");
    expect(result).toBeNull();
  });

  it("returns event with RSVPs and invite", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    const mockEvent = {
      id: "evt-1",
      title: "Test Event",
      rsvps: [{ id: "rsvp-1", name: "John", status: "going" }],
      invite: { token: "tok-1" },
    };
    mockPrismaEvent.findFirst.mockResolvedValue(mockEvent);

    const { getEventById } = await import("@/lib/actions/events");
    const result = await getEventById("evt-1");
    expect(result).toEqual(mockEvent);
  });

  it("returns null when event not found", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockPrismaEvent.findFirst.mockResolvedValue(null);

    const { getEventById } = await import("@/lib/actions/events");
    const result = await getEventById("evt-nonexistent");
    expect(result).toBeNull();
  });

  it("queries with both id and ownerUserId", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockPrismaEvent.findFirst.mockResolvedValue(null);

    const { getEventById } = await import("@/lib/actions/events");
    await getEventById("evt-1");

    expect(mockPrismaEvent.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "evt-1", ownerUserId: "user-1" },
      })
    );
  });
});

describe("deleteEvent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockPrismaUser.findUnique.mockResolvedValue({ id: "user-1", email: "test@test.com" });
  });

  it("deletes event using deleteMany with owner check", async () => {
    const { deleteEvent } = await import("@/lib/actions/events");

    try {
      await deleteEvent("evt-1");
    } catch {}

    expect(mockPrismaEvent.deleteMany).toHaveBeenCalledWith({
      where: { id: "evt-1", ownerUserId: "user-1" },
    });
    expect(mockRevalidatePath).toHaveBeenCalledWith("/dashboard");
    expect(mockRedirect).toHaveBeenCalledWith("/dashboard");
  });

  it("redirects to signin when not authenticated", async () => {
    mockAuth.mockResolvedValue({ user: null });

    const { deleteEvent } = await import("@/lib/actions/events");

    try {
      await deleteEvent("evt-1");
    } catch {}

    expect(mockRedirect).toHaveBeenCalledWith("/auth/signin");
  });
});

describe("createInvite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockPrismaUser.findUnique.mockResolvedValue({ id: "user-1", email: "test@test.com" });
  });

  it("throws when event not found", async () => {
    mockPrismaEvent.findFirst.mockResolvedValue(null);

    const { createInvite } = await import("@/lib/actions/events");
    await expect(createInvite("evt-nonexistent")).rejects.toThrow("Event not found");
  });

  it("returns early if invite already exists", async () => {
    mockPrismaEvent.findFirst.mockResolvedValue({
      id: "evt-1",
      invite: { id: "inv-1", token: "existing-token" },
    });

    const { createInvite } = await import("@/lib/actions/events");
    await createInvite("evt-1");

    expect(mockPrismaEventInvite.create).not.toHaveBeenCalled();
    expect(mockRevalidatePath).toHaveBeenCalledWith("/events/evt-1");
  });

  it("creates invite with generated token when none exists", async () => {
    mockPrismaEvent.findFirst.mockResolvedValue({
      id: "evt-1",
      invite: null,
    });
    mockPrismaEventInvite.create.mockResolvedValue({
      id: "inv-new",
      token: "generatedtoken123456789012345678",
    });

    const { createInvite } = await import("@/lib/actions/events");
    await createInvite("evt-1");

    expect(mockPrismaEventInvite.create).toHaveBeenCalledWith({
      data: {
        eventId: "evt-1",
        token: "generatedtoken123456789012345678",
      },
    });
    expect(mockRevalidatePath).toHaveBeenCalledWith("/events/evt-1");
  });
});

describe("submitRsvp", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockPrismaEvent.findUnique.mockResolvedValue({
      id: "evt-1",
      invite: { id: "inv-1", token: "valid-token" },
    });
    mockPrismaEventRsvp.findUnique.mockResolvedValue(null);
  });

  it("throws when eventId is missing", async () => {
    const { submitRsvp } = await import("@/lib/actions/events");
    const fd = makeFormData({
      name: "John",
      email: "john@example.com",
      status: "going",
    });
    await expect(submitRsvp(fd)).rejects.toThrow("Event ID is required");
  });

  it("throws when name is missing", async () => {
    const { submitRsvp } = await import("@/lib/actions/events");
    const fd = makeFormData({
      eventId: "evt-1",
      email: "john@example.com",
      status: "going",
    });
    await expect(submitRsvp(fd)).rejects.toThrow("Name is required");
  });

  it("throws when email is missing", async () => {
    const { submitRsvp } = await import("@/lib/actions/events");
    const fd = makeFormData({
      eventId: "evt-1",
      name: "John",
      status: "going",
    });
    await expect(submitRsvp(fd)).rejects.toThrow("Email is required");
  });

  it("throws when status is missing", async () => {
    const { submitRsvp } = await import("@/lib/actions/events");
    const fd = makeFormData({
      eventId: "evt-1",
      name: "John",
      email: "john@example.com",
    });
    await expect(submitRsvp(fd)).rejects.toThrow("RSVP status is required");
  });

  it("throws when event not found", async () => {
    mockPrismaEvent.findUnique.mockResolvedValue(null);
    const { submitRsvp } = await import("@/lib/actions/events");
    const fd = makeFormData({
      eventId: "evt-nonexistent",
      name: "John",
      email: "john@example.com",
      status: "going",
    });
    await expect(submitRsvp(fd)).rejects.toThrow("Event not found");
  });

  it("throws when invite token is invalid", async () => {
    const { submitRsvp } = await import("@/lib/actions/events");
    const fd = makeFormData({
      eventId: "evt-1",
      name: "John",
      email: "john@example.com",
      status: "going",
      inviteToken: "wrong-token",
    });
    await expect(submitRsvp(fd)).rejects.toThrow("Invalid invite link");
  });

  it("creates new RSVP when no existing one", async () => {
    mockPrismaEventRsvp.findUnique.mockResolvedValue(null);
    mockPrismaEventRsvp.create.mockResolvedValue({ id: "rsvp-new" });

    const { submitRsvp } = await import("@/lib/actions/events");
    const fd = makeFormData({
      eventId: "evt-1",
      name: "John Doe",
      email: "john@example.com",
      status: "going",
      inviteToken: "valid-token",
    });

    try {
      await submitRsvp(fd);
    } catch {}

    expect(mockPrismaEventRsvp.create).toHaveBeenCalledWith({
      data: {
        eventId: "evt-1",
        inviteId: "inv-1",
        name: "John Doe",
        email: "john@example.com",
        emailNormalized: "john@example.com",
        status: "going",
      },
    });
  });

  it("updates existing RSVP when email already responded", async () => {
    mockPrismaEventRsvp.findUnique.mockResolvedValue({ id: "rsvp-existing" });
    mockPrismaEventRsvp.update.mockResolvedValue({ id: "rsvp-existing" });

    const { submitRsvp } = await import("@/lib/actions/events");
    const fd = makeFormData({
      eventId: "evt-1",
      name: "John Updated",
      email: "john@example.com",
      status: "maybe",
      inviteToken: "valid-token",
    });

    try {
      await submitRsvp(fd);
    } catch {}

    expect(mockPrismaEventRsvp.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "rsvp-existing" },
        data: expect.objectContaining({
          name: "John Updated",
          status: "maybe",
        }),
      })
    );
  });

  it("normalizes email before storing", async () => {
    mockPrismaEventRsvp.findUnique.mockResolvedValue(null);
    mockPrismaEventRsvp.create.mockResolvedValue({ id: "rsvp-new" });

    const { submitRsvp } = await import("@/lib/actions/events");
    const fd = makeFormData({
      eventId: "evt-1",
      name: "John",
      email: "  John@Example.COM  ",
      status: "going",
    });

    try {
      await submitRsvp(fd);
    } catch {}

    expect(mockPrismaEventRsvp.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          emailNormalized: "john@example.com",
          email: "John@Example.COM",
        }),
      })
    );
  });

  it("works without invite token (public RSVP)", async () => {
    mockPrismaEventRsvp.findUnique.mockResolvedValue(null);
    mockPrismaEventRsvp.create.mockResolvedValue({ id: "rsvp-new" });

    const { submitRsvp } = await import("@/lib/actions/events");
    const fd = makeFormData({
      eventId: "evt-1",
      name: "Jane",
      email: "jane@example.com",
      status: "going",
    });

    try {
      await submitRsvp(fd);
    } catch {}

    expect(mockPrismaEventRsvp.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          inviteId: null,
        }),
      })
    );
  });
});

describe("deleteRsvp", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("throws when not authenticated", async () => {
    mockAuth.mockResolvedValue({ user: null });
    const { deleteRsvp } = await import("@/lib/actions/events");
    await expect(deleteRsvp("evt-1", "rsvp-1")).rejects.toThrow("Unauthorized");
  });

  it("throws when event not found or not owned", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockPrismaEvent.findFirst.mockResolvedValue(null);

    const { deleteRsvp } = await import("@/lib/actions/events");
    await expect(deleteRsvp("evt-1", "rsvp-1")).rejects.toThrow("Event not found");
  });

  it("deletes RSVP when user owns event", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockPrismaEvent.findFirst.mockResolvedValue({ id: "evt-1", ownerUserId: "user-1" });
    mockPrismaEventRsvp.delete.mockResolvedValue({ id: "rsvp-1" });

    const { deleteRsvp } = await import("@/lib/actions/events");
    await deleteRsvp("evt-1", "rsvp-1");

    expect(mockPrismaEventRsvp.delete).toHaveBeenCalledWith({
      where: { id: "rsvp-1" },
    });
    expect(mockRevalidatePath).toHaveBeenCalledWith("/events/evt-1");
  });
});

describe("getOrCreateUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates local user from session when not exists", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-new", email: "newuser@example.com", name: "New User" } });
    mockPrismaUser.findUnique.mockResolvedValue(null);
    mockPrismaUser.create.mockResolvedValue({
      id: "user-new",
      email: "newuser@example.com",
      name: "New User",
    });

    const { createEvent } = await import("@/lib/actions/events");
    mockPrismaEvent.create.mockResolvedValue({ id: "evt-1" });

    try {
      await createEvent(makeFormData({ title: "Test" }));
    } catch {}

    expect(mockPrismaUser.create).toHaveBeenCalledWith({
      data: {
        id: "user-new",
        email: "newuser@example.com",
        name: "New User",
      },
    });
  });

  it("uses existing user when already in DB", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-existing" } });
    mockPrismaUser.findUnique.mockResolvedValue({
      id: "user-existing",
      email: "existing@test.com",
    });

    const { createEvent } = await import("@/lib/actions/events");
    mockPrismaEvent.create.mockResolvedValue({ id: "evt-1" });

    try {
      await createEvent(makeFormData({ title: "Test" }));
    } catch {}

    expect(mockPrismaUser.create).not.toHaveBeenCalled();
  });

  it("handles user with no name from session", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-noname", email: "noname@example.com" } });
    mockPrismaUser.findUnique.mockResolvedValue(null);
    mockPrismaUser.create.mockResolvedValue({
      id: "user-noname",
      email: "noname@example.com",
      name: null,
    });

    const { createEvent } = await import("@/lib/actions/events");
    mockPrismaEvent.create.mockResolvedValue({ id: "evt-1" });

    try {
      await createEvent(makeFormData({ title: "Test" }));
    } catch {}

    expect(mockPrismaUser.create).toHaveBeenCalledWith({
      data: {
        id: "user-noname",
        email: "noname@example.com",
        name: null,
      },
    });
  });
});
