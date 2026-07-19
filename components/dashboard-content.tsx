"use client";

import Link from "next/link";
import { useState } from "react";
import {
  CalendarDays,
  LinkIcon,
  MapPin,
  Trash2,
  Users,
  Search,
  Copy,
} from "lucide-react";

type EventWithCounts = {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  eventDate: Date | null;
  createdAt: Date;
  invite: { token: string; id: string } | null;
  rsvpCounts: {
    going: number;
    maybe: number;
    not_going: number;
    total: number;
  };
};

type SortKey = "newest" | "oldest" | "title" | "rsvps";

export default function DashboardContent({
  events,
}: {
  events: EventWithCounts[];
}) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(eventId: string) {
    if (!confirm("Are you sure you want to delete this event?")) return;
    setDeletingId(eventId);
    const res = await fetch(`/api/events/${eventId}`, { method: "DELETE" });
    if (res.ok) {
      window.location.reload();
    }
    setDeletingId(null);
  }

  async function copyInvite(token: string) {
    const url = `${window.location.origin}/invite/${token}`;
    await navigator.clipboard.writeText(url);
  }

  const filtered = events
    .filter((e) => {
      if (!query.trim()) return true;
      const q = query.toLowerCase();
      return (
        e.title.toLowerCase().includes(q) ||
        (e.description ?? "").toLowerCase().includes(q) ||
        (e.location ?? "").toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      switch (sort) {
        case "oldest":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case "title":
          return a.title.localeCompare(b.title);
        case "rsvps":
          return b.rsvpCounts.total - a.rsvpCounts.total;
        default:
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
      }
    });

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search events..."
            className="w-full rounded-lg border border-white/10 bg-white/5 py-2.5 pl-9 pr-3 text-sm text-white placeholder:text-white/30 transition-all duration-200 focus:border-violet-500/50 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
          />
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white/80 transition-all duration-200 focus:border-violet-500/50 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="title">Title (A–Z)</option>
          <option value="rsvps">Most RSVPs</option>
        </select>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-20">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-violet-500/10">
            <CalendarDays className="h-10 w-10 text-violet-400" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">
            No events yet
          </h2>
          <p className="text-white/50 mb-6">
            Create your first event to get started.
          </p>
          <Link
            href="/events/new"
            className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-6 py-3 text-sm font-medium text-white transition-all duration-200 hover:bg-violet-500 hover:shadow-lg hover:shadow-violet-600/25"
          >
            Create Event
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-white/50">
          No events match &ldquo;{query}&rdquo;.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((event, i) => (
            <div
              key={event.id}
              className="event-card group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm transition-all duration-500 hover:border-violet-500/30 hover:bg-white/10 hover:shadow-xl hover:shadow-violet-500/5"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="flex items-start justify-between mb-3">
                <Link href={`/events/${event.id}`} className="flex-1">
                  <h3 className="text-lg font-semibold text-white group-hover:text-violet-300 transition-colors duration-200 truncate">
                    {event.title}
                  </h3>
                </Link>
                <button
                  onClick={() => handleDelete(event.id)}
                  disabled={deletingId === event.id}
                  className="rounded-lg p-1.5 text-white/30 transition-all duration-200 hover:bg-red-500/10 hover:text-red-400"
                  title="Delete event"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {event.description && (
                <p className="text-sm text-white/50 line-clamp-2 mb-4">
                  {event.description}
                </p>
              )}

              <div className="space-y-2 text-xs text-white/40">
                {event.eventDate && (
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-3.5 w-3.5" />
                    <span>
                      {new Date(event.eventDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                )}
                {event.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5" />
                    <span className="truncate">{event.location}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
                <div className="flex items-center gap-2 text-xs text-white/50">
                  <Users className="h-3.5 w-3.5" />
                  <span>
                    {event.rsvpCounts.going} going, {event.rsvpCounts.maybe}{" "}
                    maybe
                  </span>
                </div>
                {event.invite && (
                  <button
                    onClick={() => copyInvite(event.invite!.token)}
                    title="Copy invite link"
                    className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 transition-colors"
                  >
                    <Copy className="h-3 w-3" />
                    Copy
                  </button>
                )}
              </div>

              {!event.invite && (
                <Link
                  href={`/events/${event.id}`}
                  className="mt-3 flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 transition-colors"
                >
                  <LinkIcon className="h-3 w-3" />
                  Create invite
                </Link>
              )}

              <div className="mt-3 flex gap-2">
                <span className="inline-flex items-center rounded-md bg-green-500/10 px-2 py-0.5 text-xs text-green-400">
                  {event.rsvpCounts.going} Going
                </span>
                <span className="inline-flex items-center rounded-md bg-yellow-500/10 px-2 py-0.5 text-xs text-yellow-400">
                  {event.rsvpCounts.maybe} Maybe
                </span>
                {event.rsvpCounts.not_going > 0 && (
                  <span className="inline-flex items-center rounded-md bg-red-500/10 px-2 py-0.5 text-xs text-red-400">
                    {event.rsvpCounts.not_going} No
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
