import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import RsvpForm from "@/components/rsvp-form";
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
    <RsvpForm
      eventId={event.id}
      inviteToken={event.invite?.token ?? ""}
      eventTitle={event.title}
      eventDescription={event.description}
      eventDate={event.eventDate}
      location={event.location}
    />
  );
}
