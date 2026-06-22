import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

type Params = Promise<{ eventId: string; rsvpId: string }>;

// DELETE /api/events/[eventId]/rsvps/[rsvpId]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Params }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { eventId, rsvpId } = await params;

  // Verify ownership
  const event = await db.event.findFirst({
    where: { id: eventId, ownerUserId: userId },
  });

  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  await db.eventRsvp.delete({
    where: { id: rsvpId },
  });

  return NextResponse.json({ success: true });
}
