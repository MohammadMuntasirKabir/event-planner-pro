import { describe, it, expect, vi, beforeEach } from "vitest";

// Use vi.hoisted so mock variables are initialized BEFORE vi.mock factories run
// (vitest hoists vi.mock to the very top of the file)
const {
  mockUser,
  mockEvent,
  mockEventInvite,
  mockEventRsvp,
  mockGetSession,
  mockRevalidatePath,
  mockRedirect,
} = vi.hoisted(() => ({
  mockUser: {
    findUnique: vi.fn(),
    create: vi.fn(),
  },
  mockEvent: {
    create: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    delete: vi.fn(),
    deleteMany: vi.fn(),
  },
  mockEventInvite: {
    create: vi.fn(),
  },
  mockEventRsvp: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  mockGetSession: vi.fn(),
  mockRevalidatePath: vi.fn(),
  mockRedirect: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  default: {
    user: mockUser,
    event: mockEvent,
    eventInvite: mockEventInvite,
    eventRsvp: mockEventRsvp,
    $disconnect: vi.fn(),
  },
}));

vi.mock("next/cache", () => ({
  revalidatePath: (...args: any[]) => mockRevalidatePath(...args),
}));

vi.mock("next/navigation", () => ({
  redirect: (...args: any[]) => mockRedirect(...args),
}));

vi.mock("@/lib/auth/server", () => ({
  getSession: () => mockGetSession(),
}));

import {
  createEvent,
  getMyEvents,
  getEventById,
  deleteEvent,
  createInvite,
  submitRsvp,
  getPublicEvent,
  deleteRsvp,
} from "@/lib/actions/events";

function makeFormData(entries: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(entries)) {
    fd.set(key, value);
  }
  return fd;
}

describe("createEvent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects when no session", async () => {
    mockGetSession.mockResolvedValueOnce(null);
    // redirect() from next/navigation throws to halt execution — mock must throw too
    const redirectError = new Error("NEXT_REDIRECT");
    mockRedirect.mockImplementationOnce(() => { throw redirectError; });
    const fd = makeFormData({ title: "Test Event" });
    await expect(createEvent(fd)).rejects.toThrow("NEXT_REDIRECT");
    expect(mockEvent.create).not.toHaveBeenCalled();
  });

  it("throws when title is empty", async () => {
    mockGetSession.mockResolvedValueOnce({ id: "user-1" });
    const fd = makeFormData({ title: "  " });
    await expect(createEvent(fd)).rejects.toThrow("Title is required");
  });

  it("creates event with session user as owner", async () => {
    mockGetSession.mockResolvedValueOnce({ id: "user-123" });
    mockEvent.create.mockResolvedValueOnce({
      id: "event-abc",
      title: "My Party",
    });
    const _redirectErr = new Error("NEXT_REDIRECT");
    mockRedirect.mockImplementationOnce(() => { throw _redirectErr; });

    const fd = makeFormData({
      title: "My Party",
      description: "Fun times",
      location: "Downtown",
      eventDate: "2026-06-15T18:00",
    });

    await expect(createEvent(fd)).rejects.toThrow("NEXT_REDIRECT");

    expect(mockEvent.create).toHaveBeenCalledWith({
      data: {
        ownerUserId: "user-123",
        title: "My Party",
        description: "Fun times",
        location: "Downtown",
        eventDate: new Date("2026-06-15T18:00"),
      },
    });
  });

  it("handles null optional fields", async () => {
    mockGetSession.mockResolvedValueOnce({ id: "user-1" });
    mockEvent.create.mockResolvedValueOnce({ id: "event-1" });
    const _redirectErr = new Error("NEXT_REDIRECT");
    mockRedirect.mockImplementationOnce(() => { throw _redirectErr; });

    const fd = makeFormData({ title: "Test" });
    await expect(createEvent(fd)).rejects.toThrow("NEXT_REDIRECT");

    expect(mockEvent.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        description: null,
        location: null,
        eventDate: null,
      }),
    });
  });
});

describe("getMyEvents", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns empty array when no session", async () => {
    mockGetSession.mockResolvedValueOnce(null);
    const result = await getMyEvents();
    expect(result).toEqual([]);
    expect(mockEvent.findMany).not.toHaveBeenCalled();
  });

  it("returns events with RSVP counts", async () => {
    mockGetSession.mockResolvedValueOnce({ id: "user-1" });
    mockEvent.findMany.mockResolvedValueOnce([
      {
        id: "event-1",
        title: "Party",
        rsvps: [
          { status: "going" },
          { status: "going" },
          { status: "maybe" },
          { status: "not_going" },
        ],
        invite: null,
      },
    ]);

    const result = await getMyEvents();

    expect(result).toHaveLength(1);
    expect(result[0].rsvpCounts).toEqual({
      going: 2,
      maybe: 1,
      not_going: 1,
      total: 4,
    });
  });

  it("queries only current user's events", async () => {
    mockGetSession.mockResolvedValueOnce({ id: "user-42" });
    mockEvent.findMany.mockResolvedValueOnce([]);

    await getMyEvents();

    expect(mockEvent.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { ownerUserId: "user-42" },
      })
    );
  });
});

describe("getEventById", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null when no session", async () => {
    mockGetSession.mockResolvedValueOnce(null);
    const result = await getEventById("event-1");
    expect(result).toBeNull();
  });

  it("returns event owned by session user", async () => {
    mockGetSession.mockResolvedValueOnce({ id: "user-1" });
    mockEvent.findFirst.mockResolvedValueOnce({
      id: "event-1",
      title: "My Event",
      rsvps: [],
    });

    const result = await getEventById("event-1");
    expect(result).not.toBeNull();
    expect(mockEvent.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "event-1", ownerUserId: "user-1" },
      })
    );
  });
});

describe("deleteEvent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects when no session", async () => {
    mockGetSession.mockResolvedValueOnce(null);
    const redirectError = new Error("NEXT_REDIRECT");
    mockRedirect.mockImplementationOnce(() => { throw redirectError; });
    await expect(deleteEvent("event-1")).rejects.toThrow("NEXT_REDIRECT");
    expect(mockEvent.deleteMany).not.toHaveBeenCalled();
  });

  it("deletes only owned events", async () => {
    mockGetSession.mockResolvedValueOnce({ id: "user-1" });
    mockEvent.deleteMany.mockResolvedValueOnce({ count: 1 });
    const _redirectErr = new Error("NEXT_REDIRECT");
    mockRedirect.mockImplementationOnce(() => { throw _redirectErr; });

    await expect(deleteEvent("event-1")).rejects.toThrow("NEXT_REDIRECT");

    expect(mockEvent.deleteMany).toHaveBeenCalledWith({
      where: { id: "event-1", ownerUserId: "user-1" },
    });
  });
});

describe("createInvite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects when no session", async () => {
    mockGetSession.mockResolvedValueOnce(null);
    const redirectError = new Error("NEXT_REDIRECT");
    mockRedirect.mockImplementationOnce(() => { throw redirectError; });
    await expect(createInvite("event-1")).rejects.toThrow("NEXT_REDIRECT");
    expect(mockEventInvite.create).not.toHaveBeenCalled();
  });

  it("throws when event not found", async () => {
    mockGetSession.mockResolvedValueOnce({ id: "user-1" });
    mockEvent.findFirst.mockResolvedValueOnce(null);

    await expect(createInvite("event-999")).rejects.toThrow(
      "Event not found"
    );
  });

  it("does not create duplicate invite", async () => {
    mockGetSession.mockResolvedValueOnce({ id: "user-1" });
    mockEvent.findFirst.mockResolvedValueOnce({
      id: "event-1",
      invite: { id: "invite-1", token: "existing-token" },
    });
    mockRevalidatePath.mockImplementationOnce(() => {});

    await createInvite("event-1");

    expect(mockEventInvite.create).not.toHaveBeenCalled();
  });

  it("creates invite when none exists", async () => {
    mockGetSession.mockResolvedValueOnce({ id: "user-1" });
    mockEvent.findFirst.mockResolvedValueOnce({
      id: "event-1",
      invite: null,
    });
    mockEventInvite.create.mockResolvedValueOnce({ id: "invite-new", token: "tok" });
    mockRevalidatePath.mockImplementation(() => {});

    await createInvite("event-1");

    expect(mockEventInvite.create).toHaveBeenCalledWith({
      data: { eventId: "event-1", token: expect.any(String) },
    });
  });
});

describe("submitRsvp", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("throws when required fields missing", async () => {
    const fd = makeFormData({ name: "", email: "", status: "" });
    await expect(submitRsvp(fd)).rejects.toThrow("All fields are required");
  });

  it("throws when event not found", async () => {
    mockEvent.findUnique.mockResolvedValueOnce(null);
    const fd = makeFormData({
      eventId: "event-999",
      name: "John",
      email: "john@test.com",
      status: "going",
    });
    await expect(submitRsvp(fd)).rejects.toThrow("Event not found");
  });

  it("throws when invite token is invalid", async () => {
    mockEvent.findUnique.mockResolvedValueOnce({
      id: "event-1",
      invite: { id: "invite-1", token: "correct-token" },
    });
    const fd = makeFormData({
      eventId: "event-1",
      name: "John",
      email: "john@test.com",
      status: "going",
      inviteToken: "wrong-token",
    });
    await expect(submitRsvp(fd)).rejects.toThrow("Invalid invite link");
  });

  it("creates new RSVP", async () => {
    mockEvent.findUnique.mockResolvedValueOnce({
      id: "event-1",
      invite: { id: "invite-1", token: "tok123" },
    });
    mockEventRsvp.findUnique.mockResolvedValueOnce(null);
    mockEventRsvp.create.mockResolvedValueOnce({ id: "rsvp-new" });
    const _redirectErr = new Error("NEXT_REDIRECT");
    mockRedirect.mockImplementationOnce(() => { throw _redirectErr; });

    const fd = makeFormData({
      eventId: "event-1",
      name: "John Doe",
      email: "john@example.com",
      status: "going",
      inviteToken: "tok123",
    });

    await expect(submitRsvp(fd)).rejects.toThrow("NEXT_REDIRECT");

    expect(mockEventRsvp.create).toHaveBeenCalledWith({
      data: {
        eventId: "event-1",
        inviteId: "invite-1",
        name: "John Doe",
        email: "john@example.com",
        emailNormalized: "john@example.com",
        status: "going",
      },
    });
  });

  it("updates existing RSVP (upsert)", async () => {
    mockEvent.findUnique.mockResolvedValueOnce({
      id: "event-1",
      invite: null,
    });
    mockEventRsvp.findUnique.mockResolvedValueOnce({
      id: "rsvp-existing",
    });
    mockEventRsvp.update.mockResolvedValueOnce({ id: "rsvp-existing" });
    const _redirectErr = new Error("NEXT_REDIRECT");
    mockRedirect.mockImplementationOnce(() => { throw _redirectErr; });

    const fd = makeFormData({
      eventId: "event-1",
      name: "John Doe",
      email: "john@example.com",
      status: "maybe",
    });

    await expect(submitRsvp(fd)).rejects.toThrow("NEXT_REDIRECT");

    expect(mockEventRsvp.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "rsvp-existing" },
        data: expect.objectContaining({
          name: "John Doe",
          status: "maybe",
          respondedAt: expect.any(Date),
        }),
      })
    );
    expect(mockEventRsvp.create).not.toHaveBeenCalled();
  });

  it("normalizes email to lowercase", async () => {
    mockEvent.findUnique.mockResolvedValueOnce({
      id: "event-1",
      invite: null,
    });
    mockEventRsvp.findUnique.mockResolvedValueOnce(null);
    mockEventRsvp.create.mockResolvedValueOnce({ id: "rsvp-1" });
    const _redirectErr = new Error("NEXT_REDIRECT");
    mockRedirect.mockImplementationOnce(() => { throw _redirectErr; });

    const fd = makeFormData({
      eventId: "event-1",
      name: "John",
      email: "John@Example.COM",
      status: "going",
    });

    await expect(submitRsvp(fd)).rejects.toThrow("NEXT_REDIRECT");

    expect(mockEventRsvp.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          emailNormalized: "john@example.com",
        }),
      })
    );
  });
});

describe("getPublicEvent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches event with RSVPs and invite", async () => {
    const mockData = {
      id: "event-1",
      title: "Public Event",
      rsvps: [{ status: "going" }],
      invite: { token: "tok" },
    };
    mockEvent.findUnique.mockResolvedValueOnce(mockData);

    const result = await getPublicEvent("event-1");

    expect(result).toEqual(mockData);
    expect(mockEvent.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "event-1" },
        include: {
          rsvps: { orderBy: { respondedAt: "desc" } },
          invite: true,
        },
      })
    );
  });

  it("returns null for non-existent event", async () => {
    mockEvent.findUnique.mockResolvedValueOnce(null);
    const result = await getPublicEvent("nonexistent");
    expect(result).toBeNull();
  });
});

describe("deleteRsvp", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("throws when no session", async () => {
    mockGetSession.mockResolvedValueOnce(null);
    await expect(deleteRsvp("event-1", "rsvp-1")).rejects.toThrow(
      "Unauthorized"
    );
  });

  it("throws when event not found or not owned", async () => {
    mockGetSession.mockResolvedValueOnce({ id: "user-1" });
    mockEvent.findFirst.mockResolvedValueOnce(null);

    await expect(deleteRsvp("event-999", "rsvp-1")).rejects.toThrow(
      "Event not found"
    );
  });

  it("deletes RSVP when user owns the event", async () => {
    mockGetSession.mockResolvedValueOnce({ id: "user-1" });
    mockEvent.findFirst.mockResolvedValueOnce({ id: "event-1" });
    mockEventRsvp.delete.mockResolvedValueOnce({ id: "rsvp-1" });
    mockRevalidatePath.mockImplementationOnce(() => {});

    await deleteRsvp("event-1", "rsvp-1");

    expect(mockEventRsvp.delete).toHaveBeenCalledWith({
      where: { id: "rsvp-1" },
    });
  });
});
