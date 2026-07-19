import { notFound } from "next/navigation";
import { submitRsvp } from "@/lib/actions/events";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ eventId: string }>;
}): Promise<Metadata> {
  const { eventId } = await params;
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  return {
    title: event ? `RSVP — ${event.title}` : "Event RSVP",
    description: "Respond to this event invitation.",
  };
}

export default async function PublicEventPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      rsvps: { orderBy: { respondedAt: "desc" } },
      invite: true,
    },
  });

  if (!event) notFound();

  return (
    <div className="mx-auto w-full max-w-lg">
      <div className="animate-fade-in-up-delay rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm sm:p-8">
        <div className="mb-6">
          <span className="inline-flex items-center rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-300 mb-4">
            You&apos;re Invited
          </span>
          <h1 className="text-2xl font-bold text-white mb-2">{event.title}</h1>
          {event.description && (
            <p className="text-sm text-white/50 leading-relaxed mb-3">
              {event.description}
            </p>
          )}
          <div className="flex flex-wrap gap-3 text-sm text-white/40">
            {event.eventDate && (
              <span>
                {new Date(event.eventDate).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </span>
            )}
            {event.location && <span>{event.location}</span>}
          </div>
        </div>

        <form action={submitRsvp} className="space-y-5">
          <input type="hidden" name="eventId" value={event.id} />
          <input
            type="hidden"
            name="inviteToken"
            value={event.invite?.token ?? ""}
          />

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
              placeholder="you@example.com"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/30 transition-all duration-200 focus:border-violet-500/50 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-white/70">
              Will you attend? <span className="text-violet-400">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["going", "maybe", "not_going"] as const).map((status) => (
                <label
                  key={status}
                  className="group relative flex cursor-pointer items-center justify-center rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white/60 transition-all duration-200 hover:border-violet-500/30 hover:bg-violet-500/10 has-[:checked]:border-violet-500/50 has-[:checked]:bg-violet-500/15 has-[:checked]:text-violet-300"
                >
                  <input
                    type="radio"
                    name="status"
                    value={status}
                    required
                    defaultChecked={status === "going"}
                    className="sr-only"
                  />
                  <span className="capitalize">
                    {status.replace("_", " ")}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-violet-600 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-violet-600/25 transition-all duration-200 hover:bg-violet-500 hover:shadow-violet-500/40 hover:scale-[1.02]"
          >
            Submit RSVP
          </button>
        </form>

        {event.rsvps.length > 0 && (
          <div className="mt-6 border-t border-white/10 pt-4">
            <p className="text-xs text-white/40 text-center">
              {event.rsvps.filter((r) => r.status === "going").length} going,{" "}
              {event.rsvps.filter((r) => r.status === "maybe").length} maybe,{" "}
              {event.rsvps.filter((r) => r.status === "not_going").length} not
              going
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
