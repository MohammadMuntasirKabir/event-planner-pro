import { describe, it, expect } from "vitest";
import {
  cn,
  formatDate,
  formatDateTime,
  generateToken,
  normalizeEmail,
} from "@/lib/utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("handles conditional classes", () => {
    expect(cn("foo", false && "bar", "baz")).toContain("foo");
    expect(cn("foo", false && "bar", "baz")).toContain("baz");
    expect(cn("foo", false && "bar", "baz")).not.toContain("bar");
  });

  it("merges tailwind classes correctly", () => {
    expect(cn("px-2 px-4")).toBe("px-4");
  });
});

describe("formatDate", () => {
  it("formats a Date object", () => {
    const result = formatDate(new Date("2026-03-15"));
    expect(result).toContain("March");
    expect(result).toContain("15");
    expect(result).toContain("2026");
  });

  it("formats a date string", () => {
    const result = formatDate("2026-06-01");
    expect(result).toContain("June");
    expect(result).toContain("2026");
  });

  it("returns empty string for null/undefined", () => {
    expect(formatDate(null)).toBe("");
    expect(formatDate(undefined)).toBe("");
  });
});

describe("formatDateTime", () => {
  it("formats with time", () => {
    const result = formatDateTime(new Date("2026-03-15T14:30:00"));
    expect(result).toContain("March");
    expect(result).toContain("2026");
  });

  it("returns empty string for null/undefined", () => {
    expect(formatDateTime(null)).toBe("");
    expect(formatDateTime(undefined)).toBe("");
  });
});

describe("generateToken", () => {
  it("generates a token of expected length", () => {
    const token = generateToken();
    expect(token.length).toBe(32);
  });

  it("generates unique tokens", () => {
    const token1 = generateToken();
    const token2 = generateToken();
    expect(token1).not.toBe(token2);
  });

  it("generates alphanumeric tokens", () => {
    const token = generateToken();
    expect(token).toMatch(/^[A-Za-z0-9]+$/);
  });
});

describe("normalizeEmail", () => {
  it("lowercases email", () => {
    expect(normalizeEmail("User@Example.COM")).toBe("user@example.com");
  });

  it("trims whitespace", () => {
    expect(normalizeEmail("  user@example.com  ")).toBe("user@example.com");
  });

  it("handles already normalized email", () => {
    expect(normalizeEmail("user@example.com")).toBe("user@example.com");
  });
});
