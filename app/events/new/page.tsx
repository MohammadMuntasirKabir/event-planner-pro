import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { createEvent } from "@/lib/actions/events";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function NewEventPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/auth/signin");
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <Link
        href="/dashboard"
        className="animate-fade-in-up inline-flex items-center gap-1.5 text-sm text-white/50 transition-colors duration-200 hover:text-white mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>

      <div className="animate-fade-in-up-delay rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm sm:p-8">
        <h1 className="text-2xl font-bold text-white mb-2">Create Event</h1>
        <p className="text-sm text-white/50 mb-8">
          Fill in the details below to create your event.
        </p>

        <form action={createEvent} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="title" className="block text-sm font-medium text-white/70">
              Event Title <span className="text-violet-400">*</span>
            </label>
            <input id="title" name="title" required minLength={3} maxLength={120} placeholder="Team dinner, Birthday party..." className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/30 transition-all duration-200 focus:border-violet-500/50 focus:outline-none focus:ring-2 focus:ring-violet-500/20" />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-medium text-white/70">Description</label>
            <textarea id="description" name="description" rows={3} maxLength={2000} placeholder="Optional details about the event..." className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/30 transition-all duration-200 focus:border-violet-500/50 focus:outline-none focus:ring-2 focus:ring-violet-500/20 resize-none" />
          </div>

          <div className="space-y-2">
            <label htmlFor="location" className="block text-sm font-medium text-white/70">Location</label>
            <input id="location" name="location" maxLength={200} placeholder="Optional location or venue..." className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/30 transition-all duration-200 focus:border-violet-500/50 focus:outline-none focus:ring-2 focus:ring-violet-500/20" />
          </div>

          <div className="space-y-2">
            <label htmlFor="eventDate" className="block text-sm font-medium text-white/70">Date and Time</label>
            <input id="eventDate" name="eventDate" type="datetime-local" className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white transition-all duration-200 focus:border-violet-500/50 focus:outline-none focus:ring-2 focus:ring-violet-500/20 [color-scheme:dark]" />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button type="submit" className="rounded-lg bg-violet-600 px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-violet-600/25 transition-all duration-200 hover:bg-violet-500 hover:shadow-violet-500/40 hover:scale-105">
              Create Event
            </button>
            <Link href="/dashboard" className="rounded-lg border border-white/10 px-6 py-2.5 text-sm font-medium text-white/70 transition-all duration-200 hover:bg-white/5 hover:text-white">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
