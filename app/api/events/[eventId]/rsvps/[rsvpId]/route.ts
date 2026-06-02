import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/server";
import prisma from "@/lib/prisma";

type Params = Promise<{ eventId: string; rsvpId: string }>;

// DELETE /api/events/[eventId]/rsvps/[rsvpId]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Params }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { eventId, rsvpId } = await params;

  // Verify ownership
  const event = await prisma.event.findFirst({
    where: { id: eventId, ownerUserId: session.id },
  });

  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  await prisma.eventRsvp.delete({ where: { id: rsvpId } });
  return NextResponse.json({ success: true });
}
