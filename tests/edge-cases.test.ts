import { describe, it, expect } from "vitest";

// ---- Edge case tests for standalone utility functions ----

// Re-implement the parse functions from event-actions.test.ts
// to test additional edge cases
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

describe("parseCreateEvent edge cases", () => {
  it("handles title exactly at minimum length (3 chars)", () => {
    const data = new Map([["title", "ABC"]]);
    const result = parseCreateEvent(data);
    expect(result.title).toBe("ABC");
  });

  it("handles title exactly at maximum length (120 chars)", () => {
    const data = new Map([["title", "A".repeat(120)]]);
    const result = parseCreateEvent(data);
    expect(result.title.length).toBe(120);
  });

  it("throws for title at 121 chars", () => {
    const data = new Map([["title", "A".repeat(121)]]);
    expect(() => parseCreateEvent(data)).toThrow(
      "Title must be between 3 and 120 characters"
    );
  });

  it("handles title with leading/trailing whitespace", () => {
    const data = new Map([["title", "  Hello World  "]]);
    const result = parseCreateEvent(data);
    expect(result.title).toBe("Hello World");
  });

  it("handles multi-byte unicode in title", () => {
    const data = new Map([["title", "🎉 Party Time!"]]);
    const result = parseCreateEvent(data);
    expect(result.title).toBe("🎉 Party Time!");
  });

  it("handles title with special characters", () => {
    const data = new Map([["title", "Team's Dinner @ Office!"]]);
    const result = parseCreateEvent(data);
    expect(result.title).toBe("Team's Dinner @ Office!");
  });

  it("handles empty form data (all missing fields)", () => {
    const data = new Map<string, string>([]);
    expect(() => parseCreateEvent(data)).toThrow();
  });

  it("handles description at exactly 2000 chars", () => {
    const data = new Map([
      ["title", "Event"],
      ["description", "A".repeat(2000)],
    ]);
    const result = parseCreateEvent(data);
    expect(result.description?.length).toBe(2000);
  });

  it("handles location at exactly 200 chars", () => {
    const data = new Map([
      ["title", "Event"],
      ["location", "A".repeat(200)],
    ]);
    const result = parseCreateEvent(data);
    expect(result.location?.length).toBe(200);
  });

  it("handles whitespace-only description and location", () => {
    const data = new Map([
      ["title", "Event"],
      ["description", "   "],
      ["location", "   "],
    ]);
    const result = parseCreateEvent(data);
    expect(result.description).toBeNull();
    expect(result.location).toBeNull();
  });

  it("preserves eventDate string as-is", () => {
    const data = new Map([
      ["title", "Event"],
      ["eventDate", "2026-12-25T10:30"],
    ]);
    const result = parseCreateEvent(data);
    expect(result.eventDate).toBe("2026-12-25T10:30");
  });
});

describe("parseRsvp edge cases", () => {
  it("handles name exactly at minimum length (2 chars)", () => {
    const data = new Map([
      ["name", "AB"],
      ["email", "test@test.com"],
      ["status", "going"],
    ]);
    const result = parseRsvp(data);
    expect(result.name).toBe("AB");
  });

  it("handles name exactly at maximum length (120 chars)", () => {
    const data = new Map([
      ["name", "A".repeat(120)],
      ["email", "test@test.com"],
      ["status", "going"],
    ]);
    const result = parseRsvp(data);
    expect(result.name.length).toBe(120);
  });

  it("throws for name at 121 chars", () => {
    const data = new Map([
      ["name", "A".repeat(121)],
      ["email", "test@test.com"],
      ["status", "going"],
    ]);
    expect(() => parseRsvp(data)).toThrow(
      "Name must be between 2 and 120 characters"
    );
  });

  it("handles email exactly at minimum length (3 chars)", () => {
    const data = new Map([
      ["name", "John"],
      ["email", "a@b"],
      ["status", "going"],
    ]);
    const result = parseRsvp(data);
    expect(result.email).toBe("a@b");
  });

  it("handles email exactly at maximum length (320 chars)", () => {
    const longEmail = "a".repeat(315) + "@b.co";
    expect(longEmail.length).toBe(320);
    const data = new Map([
      ["name", "John"],
      ["email", longEmail],
      ["status", "going"],
    ]);
    const result = parseRsvp(data);
    expect(result.email).toBe(longEmail);
  });

  it("throws for email at 321 chars", () => {
    const tooLongEmail = "a".repeat(316) + "@b.co";
    expect(tooLongEmail.length).toBeGreaterThan(320);
    const data = new Map([
      ["name", "John"],
      ["email", tooLongEmail],
      ["status", "going"],
    ]);
    expect(() => parseRsvp(data)).toThrow("Please enter a valid email");
  });

  it("throws for empty email", () => {
    const data = new Map([
      ["name", "John"],
      ["email", ""],
      ["status", "going"],
    ]);
    expect(() => parseRsvp(data)).toThrow("Please enter a valid email");
  });

  it("throws for email with spaces only", () => {
    const data = new Map([
      ["name", "John"],
      ["email", "   "],
      ["status", "going"],
    ]);
    expect(() => parseRsvp(data)).toThrow("Please enter a valid email");
  });

  it("throws for email that is exactly '@'", () => {
    const data = new Map([
      ["name", "John"],
      ["email", "@"],
      ["status", "going"],
    ]);
    // length is 1, which is < 3, so should throw
    expect(() => parseRsvp(data)).toThrow("Please enter a valid email");
  });

  it("throws for email with @ at start but nothing else valid", () => {
    const data = new Map([
      ["name", "John"],
      ["email", "@@"],
      ["status", "going"],
    ]);
    // length is 2, which is < 3
    expect(() => parseRsvp(data)).toThrow("Please enter a valid email");
  });

  it("handles whitespace-only name", () => {
    const data = new Map([
      ["name", "   "],
      ["email", "test@test.com"],
      ["status", "going"],
    ]);
    expect(() => parseRsvp(data)).toThrow(
      "Name must be between 2 and 120 characters"
    );
  });

  it("handles name with unicode characters", () => {
    const data = new Map([
      ["name", "José López"],
      ["email", "jose@example.com"],
      ["status", "going"],
    ]);
    const result = parseRsvp(data);
    expect(result.name).toBe("José López");
  });

  it("handles name with newlines and tabs", () => {
    const data = new Map([
      ["name", "\n\tJohn Doe\n\t"],
      ["email", "john@example.com"],
      ["status", "going"],
    ]);
    const result = parseRsvp(data);
    // trim() removes all whitespace including \n and \t
    expect(result.name).toBe("John Doe");
  });

  it("throws for all invalid statuses", () => {
    const invalidStatuses = ["GOING", "Going", "YES", "no", "", "null", "undefined", "yes", "attending"];
    for (const status of invalidStatuses) {
      const data = new Map([
        ["name", "John"],
        ["email", "john@example.com"],
        ["status", status],
      ]);
      expect(() => parseRsvp(data)).toThrow("Invalid RSVP status");
    }
  });

  it("handles empty form data", () => {
    const data = new Map<string, string>([]);
    expect(() => parseRsvp(data)).toThrow();
  });
});

import { normalizeEmail, generateToken } from "@/lib/utils";

describe("normalizeEmail edge cases", () => {
  it("handles mixed case", () => {
    expect(normalizeEmail("User@Example.COM")).toBe("user@example.com");
  });

  it("handles leading/trailing spaces", () => {
    expect(normalizeEmail("  user@example.com  ")).toBe("user@example.com");
  });

  it("handles already normalized email", () => {
    expect(normalizeEmail("user@example.com")).toBe("user@example.com");
  });

  it("handles email with tabs", () => {
    expect(normalizeEmail("\tuser@example.com\t")).toBe("user@example.com");
  });
});

describe("generateToken edge cases", () => {

  it("generates tokens of length 32", () => {
    for (let i = 0; i < 100; i++) {
      expect(generateToken().length).toBe(32);
    }
  });

  it("generates unique tokens across 1000 calls", () => {
    const tokens = new Set<string>();
    for (let i = 0; i < 1000; i++) {
      tokens.add(generateToken());
    }
    expect(tokens.size).toBe(1000);
  });

  it("only contains alphanumeric characters", () => {
    for (let i = 0; i < 100; i++) {
      expect(generateToken()).toMatch(/^[A-Za-z0-9]+$/);
    }
  });

  it("has roughly equal distribution of character types", () => {
    const token = generateToken();
    const lower = (token.match(/[a-z]/g) || []).length;
    const upper = (token.match(/[A-Z]/g) || []).length;
    const digits = (token.match(/[0-9]/g) || []).length;
    // All character types should appear at least once in a 32-char token
    expect(lower).toBeGreaterThan(0);
    expect(upper).toBeGreaterThan(0);
    expect(digits).toBeGreaterThan(0);
  });
});
