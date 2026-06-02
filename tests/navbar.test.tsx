import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

// Mock next/link
vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

// Mock next/navigation — Navbar uses usePathname and useRouter
const mockPush = vi.fn();
const mockReplace = vi.fn();
const mockRefresh = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    refresh: mockRefresh,
  }),
}));

// Mock lucide-react
vi.mock("lucide-react", () => ({
  CalendarDays: () => null,
  LayoutDashboard: () => null,
  LogOut: () => null,
  Plus: () => null,
  User: () => null,
  LinkIcon: () => null,
  Copy: () => null,
  Check: () => null,
  Trash2: () => null,
  Users: () => null,
  Mail: () => null,
  Clock: () => null,
  ArrowLeft: () => null,
  Sparkles: () => null,
  PartyPopper: () => null,
  ArrowRight: () => null,
}));

import Navbar from "@/components/navbar";
import { AuthProvider } from "@/lib/auth/client";

describe("Navbar auth state", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows Sign In and Get Started when user is not authenticated", () => {
    render(
      <AuthProvider initialUser={null}>
        <Navbar />
      </AuthProvider>
    );

    expect(screen.getByText("Sign In")).toBeTruthy();
    expect(screen.getByText("Get Started")).toBeTruthy();
    expect(screen.queryByText("Sign Out")).toBeNull();
    expect(screen.queryByText("Dashboard")).toBeNull();
  });

  it("shows Dashboard and Sign Out when user is authenticated", () => {
    const user = { id: "1", email: "test@test.com", name: "Test User" };
    render(
      <AuthProvider initialUser={user}>
        <Navbar />
      </AuthProvider>
    );

    expect(screen.getByText("Dashboard")).toBeTruthy();
    expect(screen.getByText("Sign Out")).toBeTruthy();
    expect(screen.getByText("test@test.com")).toBeTruthy();
    expect(screen.queryByText("Sign In")).toBeNull();
    expect(screen.queryByText("Get Started")).toBeNull();
  });

  it("shows user email in navbar when authenticated", () => {
    const user = { id: "42", email: "alice@example.com", name: "Alice" };
    render(
      <AuthProvider initialUser={user}>
        <Navbar />
      </AuthProvider>
    );

    expect(screen.getByText("alice@example.com")).toBeTruthy();
  });

  it("shows New Event link when authenticated", () => {
    const user = { id: "1", email: "test@test.com", name: "Test" };
    render(
      <AuthProvider initialUser={user}>
        <Navbar />
      </AuthProvider>
    );

    expect(screen.getByText("New Event")).toBeTruthy();
  });

  it("does not show New Event link when not authenticated", () => {
    render(
      <AuthProvider initialUser={null}>
        <Navbar />
      </AuthProvider>
    );

    expect(screen.queryByText("New Event")).toBeNull();
  });

  it("calls logout and clears user state on Sign Out click", async () => {
    const user = { id: "1", email: "test@test.com", name: "Test" };

    const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    } as any);

    render(
      <AuthProvider initialUser={user}>
        <Navbar />
      </AuthProvider>
    );

    // Verify logged-in state
    expect(screen.getByText("Sign Out")).toBeTruthy();
    expect(screen.getByText("Dashboard")).toBeTruthy();

    // Click Sign Out
    fireEvent.click(screen.getByText("Sign Out"));

    // The logout function should call DELETE /api/auth
    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith("/api/auth", { method: "DELETE" });
    });

    fetchSpy.mockRestore();
  });

  it("redirects to home after logout", async () => {
    const user = { id: "1", email: "test@test.com", name: "Test" };

    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    } as any);

    render(
      <AuthProvider initialUser={user}>
        <Navbar />
      </AuthProvider>
    );

    fireEvent.click(screen.getByText("Sign Out"));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/");
    });
  });

  it("always shows EventPlanner brand link", () => {
    render(
      <AuthProvider initialUser={null}>
        <Navbar />
      </AuthProvider>
    );
    expect(screen.getByText("EventPlanner")).toBeTruthy();
  });
});
