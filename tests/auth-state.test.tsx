import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "@/lib/auth/client";

// Mock fetch for the AuthProvider
const mockFetch = vi.fn();
global.fetch = mockFetch;

function makeWrapper(initialUser: any) {
  // Return a proper wrapper component that passes initialUser to AuthProvider
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return AuthProvider({ children, initialUser });
  };
}

describe("AuthProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
  });

  it("initializes with initialUser from server", () => {
    const user = { id: "1", email: "test@test.com", name: "Test" };
    const { result } = renderHook(() => useAuth(), {
      wrapper: makeWrapper(user),
    });
    expect(result.current.user).toEqual(user);
    expect(result.current.loading).toBe(false);
  });

  it("initializes with null user when not authenticated", () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: makeWrapper(null),
    });
    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it("refresh() fetches session and updates user", async () => {
    const user = { id: "1", email: "test@test.com", name: "Test" };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user }),
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: makeWrapper(null),
    });

    expect(result.current.user).toBeNull();

    await act(async () => {
      await result.current.refresh();
    });

    expect(result.current.user).toEqual(user);
    expect(mockFetch).toHaveBeenCalledWith("/api/auth");
  });

  it("refresh() sets user to null when API returns no user", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user: null }),
    });

    const initialUser = { id: "1", email: "test@test.com", name: "Test" };
    const { result } = renderHook(() => useAuth(), {
      wrapper: makeWrapper(initialUser),
    });

    expect(result.current.user).toEqual(initialUser);

    await act(async () => {
      await result.current.refresh();
    });

    expect(result.current.user).toBeNull();
  });

  it("refresh() sets user to null on network error", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    const initialUser = { id: "1", email: "test@test.com", name: "Test" };
    const { result } = renderHook(() => useAuth(), {
      wrapper: makeWrapper(initialUser),
    });

    await act(async () => {
      await result.current.refresh();
    });

    expect(result.current.user).toBeNull();
  });

  it("logout() clears user state and calls DELETE /api/auth", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    const initialUser = { id: "1", email: "test@test.com", name: "Test" };
    const { result } = renderHook(() => useAuth(), {
      wrapper: makeWrapper(initialUser),
    });

    expect(result.current.user).toEqual(initialUser);

    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(mockFetch).toHaveBeenCalledWith("/api/auth", { method: "DELETE" });
  });

  it("logout() clears user even if API call fails", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    const initialUser = { id: "1", email: "test@test.com", name: "Test" };
    const { result } = renderHook(() => useAuth(), {
      wrapper: makeWrapper(initialUser),
    });

    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.user).toBeNull();
  });

  it("loading transitions correctly during refresh", async () => {
    const user = { id: "1", email: "test@test.com", name: "Test" };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user }),
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: makeWrapper(null),
    });

    // Before refresh
    expect(result.current.loading).toBe(false);
    expect(result.current.user).toBeNull();

    // Trigger refresh
    await act(async () => {
      await result.current.refresh();
    });

    // After refresh — user loaded
    expect(result.current.loading).toBe(false);
    expect(result.current.user).toEqual(user);
  });

  // ---- Auth flow: sign in → navbar shows logged in state ----

  it("after sign-in API sets cookie, refresh() populates user → Navbar shows Dashboard", async () => {
    const user = { id: "1", email: "user@test.com", name: "User" };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user }),
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: makeWrapper(null), // server rendered with no user
    });

    // Before sign-in: Navbar would show Sign In + Get Started
    expect(result.current.user).toBeNull();

    // After page calls refresh() following successful sign-in
    await act(async () => {
      await result.current.refresh();
    });

    // Navbar should now show Dashboard + Sign Out
    expect(result.current.user).toEqual(user);
  });

  // ---- Auth flow: sign out → navbar shows signed out state ----

  it("after sign-out, user becomes null → Navbar shows Sign In buttons", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    const initialUser = { id: "1", email: "user@test.com", name: "User" };
    const { result } = renderHook(() => useAuth(), {
      wrapper: makeWrapper(initialUser),
    });

    // Before sign-out: Navbar shows Dashboard + Sign Out
    expect(result.current.user).toEqual(initialUser);

    // After clicking Sign Out
    await act(async () => {
      await result.current.logout();
    });

    // Navbar should now show Sign In + Get Started
    expect(result.current.user).toBeNull();
  });

  // ---- Auth flow: authenticated vs unauthenticated ----

  it("authenticated user has non-null user → Navbar shows Dashboard", () => {
    const user = { id: "1", email: "user@test.com", name: "User" };
    const { result } = renderHook(() => useAuth(), {
      wrapper: makeWrapper(user),
    });
    expect(result.current.user).not.toBeNull();
    expect(result.current.user?.email).toBe("user@test.com");
  });

  it("unauthenticated user has null user → Navbar shows Sign In", () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: makeWrapper(null),
    });
    expect(result.current.user).toBeNull();
  });
});

describe("auth API route response shapes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
  });

  it("POST /api/auth returns { user } on success", async () => {
    const user = { id: "1", email: "test@test.com", name: "Test" };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user }),
    });

    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "test@test.com", password: "password123" }),
    });
    const data = await res.json();
    expect(data.user).toEqual(user);
  });

  it("POST /api/auth returns { error } on failure", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ error: "Invalid email or password" }),
    });

    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "bad@test.com", password: "wrong" }),
    });
    expect(res.ok).toBe(false);
    const data = await res.json();
    expect(data.error).toBe("Invalid email or password");
  });

  it("PUT /api/auth returns { user } on successful registration", async () => {
    const user = { id: "2", email: "new@test.com", name: "New User" };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user }),
    });

    const res = await fetch("/api/auth", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "New User", email: "new@test.com", password: "password123" }),
    });
    const data = await res.json();
    expect(data.user).toEqual(user);
  });

  it("PUT /api/auth returns { error: Email already registered } for duplicate", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 409,
      json: async () => ({ error: "Email already registered" }),
    });

    const res = await fetch("/api/auth", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "exists@test.com", password: "password123" }),
    });
    expect(res.ok).toBe(false);
    const data = await res.json();
    expect(data.error).toBe("Email already registered");
  });

  it("GET /api/auth returns { user } when session exists", async () => {
    const user = { id: "1", email: "test@test.com", name: "Test" };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user }),
    });

    const res = await fetch("/api/auth");
    const data = await res.json();
    expect(data.user).toEqual(user);
  });

  it("GET /api/auth returns { user: null } when no session", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user: null }),
    });

    const res = await fetch("/api/auth");
    const data = await res.json();
    expect(data.user).toBeNull();
  });

  it("DELETE /api/auth returns { success: true }", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, message: "Signed out" }),
    });

    const res = await fetch("/api/auth", { method: "DELETE" });
    const data = await res.json();
    expect(data.success).toBe(true);
  });
});
