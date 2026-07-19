import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import RsvpForm from "@/components/rsvp-form";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}): Promise<Metadata> {
  const { token } = await params;
  const invite = await prisma.eventInvite.findFirst({
    where: { token },
    include: { event: true },
  });
  return {
    title: invite ? `RSVP — ${invite.event.title}` : "Event RSVP",
    description: "Respond to this event invitation.",
  };
}

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const invite = await prisma.eventInvite.findFirst({
    where: { token },
    include: {
      event: {
        include: {
          rsvps: { orderBy: { respondedAt: "desc" } },
          invite: true,
        },
      },
    },
  });

  if (!invite?.event) {
    notFound();
  }

  const event = invite.event;

  return (
    <RsvpForm
      eventId={event.id}
      inviteToken={token}
      eventTitle={event.title}
      eventDescription={event.description}
      eventDate={event.eventDate}
      location={event.location}
    />
  );
}
