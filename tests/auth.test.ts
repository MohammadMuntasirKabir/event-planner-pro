import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "@/lib/auth/passwords";

describe("password hashing (bcrypt)", () => {
  it("produces bcrypt hashes starting with $2a$ or $2b$", async () => {
    const hash = await hashPassword("mypassword123");
    expect(hash.startsWith("$2a$") || hash.startsWith("$2b$")).toBe(true);
  });

  it("produces different hashes for the same password (random salt)", async () => {
    const hash1 = await hashPassword("mypassword123");
    const hash2 = await hashPassword("mypassword123");
    expect(hash1).not.toBe(hash2);
  });

  it("produces different hashes for different passwords", async () => {
    const hash1 = await hashPassword("password1");
    const hash2 = await hashPassword("password2");
    expect(hash1).not.toBe(hash2);
  });

  it("verifies correct password against bcrypt hash", async () => {
    const hash = await hashPassword("correct-horse-battery-staple");
    const valid = await verifyPassword("correct-horse-battery-staple", hash);
    expect(valid).toBe(true);
  });

  it("rejects incorrect password against bcrypt hash", async () => {
    const hash = await hashPassword("correct-password");
    const valid = await verifyPassword("wrong-password", hash);
    expect(valid).toBe(false);
  });

  it("verifies a moderately long password", async () => {
    const pwd = "a".repeat(50);
    const hash = await hashPassword(pwd);
    expect(await verifyPassword(pwd, hash)).toBe(true);
    expect(await verifyPassword("a".repeat(49) + "b", hash)).toBe(false);
  });

  it("unicode password works", async () => {
    const pwd = "пароль🔐ñ";
    const hash = await hashPassword(pwd);
    expect(await verifyPassword(pwd, hash)).toBe(true);
    expect(await verifyPassword("password", hash)).toBe(false);
  });
});

describe("password hashing — legacy SHA-256 fallback", () => {
  it("verifies legacy SHA-256 hex hash", async () => {
    // Simulate a legacy SHA-256 hash (64 hex chars, no $ prefix)
    const encoder = new TextEncoder();
    const data = encoder.encode("password123event-planner-salt");
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const legacyHash = Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    expect(legacyHash).toHaveLength(64);
    expect(legacyHash.startsWith("$")).toBe(false);

    // Should verify correctly via the fallback path
    const valid = await verifyPassword("password123", legacyHash);
    expect(valid).toBe(true);
  });

  it("rejects wrong password against legacy SHA-256 hash", async () => {
    const encoder = new TextEncoder();
    const data = encoder.encode("password123event-planner-salt");
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const legacyHash = Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    const valid = await verifyPassword("wrongpassword", legacyHash);
    expect(valid).toBe(false);
  });
});
