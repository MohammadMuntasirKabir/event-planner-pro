import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

type Params = Promise<{ eventId: string; rsvpId: string }>;

// DELETE /api/events/[eventId]/rsvps/[rsvpId]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Params }
) {
  const ip = getClientIp(request);
  const rl = rateLimit(ip);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: {
          "X-RateLimit-Remaining": String(rl.remaining),
          "X-RateLimit-Reset": String(rl.resetAt),
        },
      }
    );
  }

  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { eventId, rsvpId } = await params;

  // Verify ownership
  const event = await prisma.event.findFirst({
    where: { id: eventId, ownerUserId: userId },
  });

  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  await prisma.eventRsvp.delete({
    where: { id: rsvpId },
  });

  return NextResponse.json({ success: true });
}
