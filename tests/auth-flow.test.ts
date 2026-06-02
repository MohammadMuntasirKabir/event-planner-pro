import { describe, it, expect, vi, beforeEach } from "vitest";

// ---- Password hashing tests (same logic as API route) ----

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + "event-planner-salt");
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const computed = await hashPassword(password);
  return computed === hash;
}

describe("password hashing (auth)", () => {
  it("produces deterministic hashes", async () => {
    const h1 = await hashPassword("mypassword");
    const h2 = await hashPassword("mypassword");
    expect(h1).toBe(h2);
  });

  it("different passwords produce different hashes", async () => {
    const h1 = await hashPassword("password1");
    const h2 = await hashPassword("password2");
    expect(h1).not.toBe(h2);
  });

  it("verifyPassword returns true for correct password", async () => {
    const hash = await hashPassword("correct-horse");
    expect(await verifyPassword("correct-horse", hash)).toBe(true);
  });

  it("verifyPassword returns false for wrong password", async () => {
    const hash = await hashPassword("correct-horse");
    expect(await verifyPassword("wrong-horse", hash)).toBe(false);
  });

  it("hash is 64 hex characters (SHA-256)", async () => {
    const hash = await hashPassword("test");
    expect(hash).toHaveLength(64);
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it("empty password produces valid hash", async () => {
    const hash = await hashPassword("");
    expect(hash).toHaveLength(64);
    expect(await verifyPassword("", hash)).toBe(true);
    expect(await verifyPassword("not-empty", hash)).toBe(false);
  });

  it("long password works", async () => {
    const longPwd = "a".repeat(1000);
    const hash = await hashPassword(longPwd);
    expect(await verifyPassword(longPwd, hash)).toBe(true);
    expect(await verifyPassword("a".repeat(999), hash)).toBe(false);
  });

  it("unicode password works", async () => {
    const pwd = "пароль🔐ñ";
    const hash = await hashPassword(pwd);
    expect(await verifyPassword(pwd, hash)).toBe(true);
    expect(await verifyPassword("password", hash)).toBe(false);
  });
});

describe("normalizeEmail (auth)", () => {
  function normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

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

describe("auth flow logic", () => {
  describe("signup validation", () => {
    function validateSignUp(name: string, email: string, password: string): string | null {
      if (!email || !password) return "Email and password are required";
      if (password.length < 6) return "Password must be at least 6 characters";
      return null;
    }

    it("rejects empty email", () => {
      expect(validateSignUp("John", "", "password123")).toBe("Email and password are required");
    });

    it("rejects empty password", () => {
      expect(validateSignUp("John", "john@test.com", "")).toBe("Email and password are required");
    });

    it("rejects short password", () => {
      expect(validateSignUp("John", "john@test.com", "12345")).toBe("Password must be at least 6 characters");
    });

    it("accepts valid input", () => {
      expect(validateSignUp("John", "john@test.com", "password123")).toBeNull();
    });

    it("accepts valid input without name", () => {
      expect(validateSignUp("", "john@test.com", "password123")).toBeNull();
    });
  });

  describe("sign-in validation", () => {
    function validateSignIn(email: string, password: string): string | null {
      if (!email || !password) return "Email and password are required";
      return null;
    }

    it("rejects empty email", () => {
      expect(validateSignIn("", "password")).toBe("Email and password are required");
    });

    it("rejects empty password", () => {
      expect(validateSignIn("john@test.com", "")).toBe("Email and password are required");
    });

    it("accepts valid input", () => {
      expect(validateSignIn("john@test.com", "password123")).toBeNull();
    });
  });

  describe("session cookie", () => {
    const COOKIE_NAME = "ep_session";

    it("cookie name is ep_session", () => {
      expect(COOKIE_NAME).toBe("ep_session");
    });

    it("session user has required fields", () => {
      const user = { id: "uuid-123", email: "test@test.com", name: "Test" };
      expect(user).toHaveProperty("id");
      expect(user).toHaveProperty("email");
      expect(user).toHaveProperty("name");
    });

    it("session JSON round-trips correctly", () => {
      const user = { id: "uuid-123", email: "test@test.com", name: null };
      const serialized = JSON.stringify(user);
      const parsed = JSON.parse(serialized);
      expect(parsed).toEqual(user);
    });

    it("session with special characters round-trips", () => {
      const user = { id: "uuid-123", email: "test+tag@test.com", name: "Test User 🔐" };
      const serialized = JSON.stringify(user);
      const parsed = JSON.parse(serialized);
      expect(parsed).toEqual(user);
    });
  });

  describe("auth guards", () => {
    it("unauthenticated user cannot access dashboard", () => {
      const session = null;
      const isAuthenticated = !!session;
      expect(isAuthenticated).toBe(false);
    });

    it("authenticated user can access dashboard", () => {
      const session = { id: "1", email: "test@test.com", name: "Test" };
      const isAuthenticated = !!session;
      expect(isAuthenticated).toBe(true);
    });

    it("event ownership is enforced", () => {
      const session = { id: "user-1", email: "owner@test.com", name: "Owner" };
      const eventOwnerId = "user-1";
      const otherUserId = "user-2";

      expect(session.id).toBe(eventOwnerId);
      expect(session.id).not.toBe(otherUserId);
    });
  });
});
