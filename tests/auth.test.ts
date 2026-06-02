import { describe, it, expect, vi } from "vitest";

// ---- Password helper tests (same logic as in the API route) ----

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + "event-planner-salt");
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  const computed = await hashPassword(password);
  return computed === hash;
}

describe("password hashing", () => {
  it("produces deterministic hashes", async () => {
    const hash1 = await hashPassword("mypassword123");
    const hash2 = await hashPassword("mypassword123");
    expect(hash1).toBe(hash2);
  });

  it("produces different hashes for different passwords", async () => {
    const hash1 = await hashPassword("password1");
    const hash2 = await hashPassword("password2");
    expect(hash1).not.toBe(hash2);
  });

  it("verifies correct password", async () => {
    const hash = await hashPassword("correct-horse-battery-staple");
    const valid = await verifyPassword("correct-horse-battery-staple", hash);
    expect(valid).toBe(true);
  });

  it("rejects incorrect password", async () => {
    const hash = await hashPassword("correct-password");
    const valid = await verifyPassword("wrong-password", hash);
    expect(valid).toBe(false);
  });

  it("hash is 64 hex chars (SHA-256)", async () => {
    const hash = await hashPassword("test");
    expect(hash).toHaveLength(64);
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it("empty password produces valid hash", async () => {
    const hash = await hashPassword("");
    expect(hash).toHaveLength(64);
    const valid = await verifyPassword("", hash);
    expect(valid).toBe(true);
  });
});
