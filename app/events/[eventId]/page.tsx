import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getEventById } from "@/lib/actions/events";
import EventDetailContent from "@/components/event-detail-content";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function EventDetailsPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const event = await getEventById(eventId);
  if (!event) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard"
        className="animate-fade-in-up inline-flex items-center gap-1.5 text-sm text-white/50 transition-colors duration-200 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>
      <EventDetailContent event={event} />
    </div>
  );
}
