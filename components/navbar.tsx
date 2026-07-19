"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, LayoutDashboard, LogOut, Plus, User } from "lucide-react";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const { data: session, status } = useSession();
  const user = session?.user;
  const isLoaded = status !== "loading";
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith("/auth");

  if (isAuthPage) return null;

  async function handleLogout() {
    await signOut({ callbackUrl: "/" });
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0a0f]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-600 transition-transform duration-200 group-hover:scale-110">
            <CalendarDays className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold text-white">EventPlanner</span>
        </Link>

        <nav className="flex items-center gap-1">
          {!isLoaded ? (
            /* Session still loading — show skeleton nav */
            <div className="flex items-center gap-2 animate-pulse">
              <div className="h-9 w-20 rounded-lg bg-white/5" />
              <div className="h-9 w-28 rounded-lg bg-white/5" />
            </div>
          ) : user ? (
            <>
              <Link
                href="/dashboard"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/70 transition-all duration-200 hover:bg-white/10 hover:text-white"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
              <Link
                href="/events/new"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/70 transition-all duration-200 hover:bg-white/10 hover:text-white"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">New Event</span>
              </Link>
              <div className="mx-2 h-4 w-px bg-white/10" />
              <div className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/60">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline max-w-[120px] truncate">
                  {user?.name ?? user?.email}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/70 transition-all duration-200 hover:bg-red-500/10 hover:text-red-400"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/auth/signin"
                className="rounded-lg px-4 py-2 text-sm text-white/70 transition-all duration-200 hover:bg-white/10 hover:text-white"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:bg-violet-500 hover:shadow-lg hover:shadow-violet-600/25"
              >
                Get Started
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
