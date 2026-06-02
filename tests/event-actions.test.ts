import { describe, it, expect } from "vitest";

// Test the event parsing logic (extracted from server actions)
function parseCreateEvent(formData: Map<string, string>) {
  const title = (formData.get("title") ?? "").trim();
  if (title.length < 3 || title.length > 120) {
    throw new Error("Title must be between 3 and 120 characters.");
  }
  const description = (formData.get("description") ?? "").trim();
  const location = (formData.get("location") ?? "").trim();
  const eventDate = (formData.get("eventDate") ?? "").trim();
  return {
    title,
    description: description.length ? description.slice(0, 2000) : null,
    location: location.length ? location.slice(0, 200) : null,
    eventDate: eventDate.length ? eventDate : null,
  };
}

function parseRsvp(formData: Map<string, string>) {
  const name = (formData.get("name") ?? "").trim();
  if (name.length < 2 || name.length > 120) {
    throw new Error("Name must be between 2 and 120 characters.");
  }
  const email = (formData.get("email") ?? "").trim();
  if (email.length < 3 || email.length > 320 || !email.includes("@")) {
    throw new Error("Please enter a valid email.");
  }
  const status = (formData.get("status") ?? "").trim();
  const validStatuses = ["going", "maybe", "not_going"];
  if (!validStatuses.includes(status)) {
    throw new Error("Invalid RSVP status.");
  }
  return { name, email, status };
}

describe("parseCreateEvent", () => {
  it("parses valid event data", () => {
    const data = new Map([
      ["title", "Team Dinner"],
      ["description", "Monthly team dinner"],
      ["location", "Downtown Cafe"],
      ["eventDate", "2026-06-15T18:00"],
    ]);
    const result = parseCreateEvent(data);
    expect(result.title).toBe("Team Dinner");
    expect(result.description).toBe("Monthly team dinner");
    expect(result.location).toBe("Downtown Cafe");
    expect(result.eventDate).toBe("2026-06-15T18:00");
  });

  it("trims whitespace from fields", () => {
    const data = new Map([
      ["title", "  Team Dinner  "],
      ["description", "  Some description  "],
      ["location", "  Some location  "],
      ["eventDate", ""],
    ]);
    const result = parseCreateEvent(data);
    expect(result.title).toBe("Team Dinner");
    expect(result.description).toBe("Some description");
    expect(result.location).toBe("Some location");
  });

  it("returns null for empty optional fields", () => {
    const data = new Map([
      ["title", "Team Dinner"],
      ["description", ""],
      ["location", ""],
      ["eventDate", ""],
    ]);
    const result = parseCreateEvent(data);
    expect(result.description).toBeNull();
    expect(result.location).toBeNull();
    expect(result.eventDate).toBeNull();
  });

  it("throws for title too short", () => {
    const data = new Map([["title", "AB"]]);
    expect(() => parseCreateEvent(data)).toThrow(
      "Title must be between 3 and 120 characters"
    );
  });

  it("throws for title too long", () => {
    const data = new Map([["title", "A".repeat(121)]]);
    expect(() => parseCreateEvent(data)).toThrow(
      "Title must be between 3 and 120 characters"
    );
  });

  it("throws for empty title", () => {
    const data = new Map([["title", ""]]);
    expect(() => parseCreateEvent(data)).toThrow(
      "Title must be between 3 and 120 characters"
    );
  });

  it("truncates description to 2000 chars", () => {
    const data = new Map([
      ["title", "Event"],
      ["description", "A".repeat(2500)],
    ]);
    const result = parseCreateEvent(data);
    expect(result.description?.length).toBe(2000);
  });

  it("truncates location to 200 chars", () => {
    const data = new Map([
      ["title", "Event"],
      ["location", "A".repeat(250)],
    ]);
    const result = parseCreateEvent(data);
    expect(result.location?.length).toBe(200);
  });
});

describe("parseRsvp", () => {
  it("parses valid RSVP data", () => {
    const data = new Map([
      ["name", "John Doe"],
      ["email", "john@example.com"],
      ["status", "going"],
    ]);
    const result = parseRsvp(data);
    expect(result.name).toBe("John Doe");
    expect(result.email).toBe("john@example.com");
    expect(result.status).toBe("going");
  });

  it("accepts all valid statuses", () => {
    for (const status of ["going", "maybe", "not_going"]) {
      const data = new Map([
        ["name", "John"],
        ["email", "john@example.com"],
        ["status", status],
      ]);
      const result = parseRsvp(data);
      expect(result.status).toBe(status);
    }
  });

  it("throws for invalid status", () => {
    const data = new Map([
      ["name", "John"],
      ["email", "john@example.com"],
      ["status", "invalid"],
    ]);
    expect(() => parseRsvp(data)).toThrow("Invalid RSVP status");
  });

  it("throws for name too short", () => {
    const data = new Map([
      ["name", "J"],
      ["email", "john@example.com"],
      ["status", "going"],
    ]);
    expect(() => parseRsvp(data)).toThrow(
      "Name must be between 2 and 120 characters"
    );
  });

  it("throws for invalid email", () => {
    const data = new Map([
      ["name", "John"],
      ["email", "not-an-email"],
      ["status", "going"],
    ]);
    expect(() => parseRsvp(data)).toThrow("Please enter a valid email");
  });

  it("throws for email without @", () => {
    const data = new Map([
      ["name", "John"],
      ["email", "johnexample.com"],
      ["status", "going"],
    ]);
    expect(() => parseRsvp(data)).toThrow("Please enter a valid email");
  });

  it("trims whitespace from fields", () => {
    const data = new Map([
      ["name", "  John Doe  "],
      ["email", "  john@example.com  "],
      ["status", "going"],
    ]);
    const result = parseRsvp(data);
    expect(result.name).toBe("John Doe");
    expect(result.email).toBe("john@example.com");
  });
});
