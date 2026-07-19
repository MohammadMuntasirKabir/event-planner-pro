"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RsvpForm({
  eventId,
  inviteToken,
  eventTitle,
  eventDescription,
  eventDate,
  location,
}: {
  eventId: string;
  inviteToken: string;
  eventTitle: string;
  eventDescription: string | null;
  eventDate: Date | null;
  location: string | null;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"going" | "maybe" | "not_going">("going");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/events/${eventId}/rsvps`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, status, inviteToken }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Failed to submit RSVP");
        return;
      }
      setDone(true);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="mx-auto w-full max-w-lg">
        <div className="animate-fade-in-up rounded-xl border border-violet-500/30 bg-violet-500/10 p-6 text-center text-violet-200 backdrop-blur-sm sm:p-8">
          Your RSVP has been recorded. Thank you!
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-lg">
      <div className="animate-fade-in-up-delay rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm sm:p-8">
        <div className="mb-6">
          <span className="inline-flex items-center rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-300 mb-4">
            You&apos;re Invited
          </span>
          <h1 className="text-2xl font-bold text-white mb-2">{eventTitle}</h1>
          {eventDescription && (
            <p className="text-sm text-white/50 leading-relaxed mb-3">
              {eventDescription}
            </p>
          )}
          <div className="flex flex-wrap gap-3 text-sm text-white/40">
            {eventDate && (
              <span>
                {new Date(eventDate).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </span>
            )}
            {location && <span>{location}</span>}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 text-red-300 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-white/70"
            >
              Your Name <span className="text-violet-400">*</span>
            </label>
            <input
              id="name"
              name="name"
              required
              minLength={2}
              maxLength={120}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/30 transition-all duration-200 focus:border-violet-500/50 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-white/70"
            >
              Email <span className="text-violet-400">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/30 transition-all duration-200 focus:border-violet-500/50 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-white/70">
              Will you attend? <span className="text-violet-400">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["going", "maybe", "not_going"] as const).map((s) => (
                <label
                  key={s}
                  className="group relative flex cursor-pointer items-center justify-center rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white/60 transition-all duration-200 hover:border-violet-500/30 hover:bg-violet-500/10 has-[:checked]:border-violet-500/50 has-[:checked]:bg-violet-500/15 has-[:checked]:text-violet-300"
                >
                  <input
                    type="radio"
                    name="status"
                    value={s}
                    checked={status === s}
                    onChange={() => setStatus(s)}
                    className="sr-only"
                  />
                  <span className="capitalize">{s.replace("_", " ")}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-violet-600 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-violet-600/25 transition-all duration-200 hover:bg-violet-500 hover:shadow-violet-500/40 hover:scale-[1.02] disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit RSVP"}
          </button>
        </form>

        <div className="mt-6 border-t border-white/10 pt-4">
          <p className="text-xs text-white/40 text-center">
            Powered by Event Planner Pro
          </p>
        </div>
      </div>
    </div>
  );
}
