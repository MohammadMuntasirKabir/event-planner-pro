import { redirect } from "next/navigation";
import { getMyEvents } from "@/lib/actions/events";
import { auth } from "@/lib/auth";
import DashboardContent from "@/components/dashboard-content";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/signin");
  }

  const events = await getMyEvents();

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="animate-fade-in-up text-2xl font-bold text-white">
            Your Events
          </h1>
          <p className="animate-fade-in-up-delay mt-1 text-sm text-white/50">
            Manage your events and track RSVP responses.
          </p>
        </div>
        <Link
          href="/events/new"
          className="animate-fade-in-up-delay-2 inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-violet-600/25 transition-all duration-200 hover:bg-violet-500 hover:shadow-violet-500/40 hover:scale-105"
        >
          <Plus className="h-4 w-4" />
          Create Event
        </Link>
      </div>

      <DashboardContent events={events} />
    </div>
  );
}
