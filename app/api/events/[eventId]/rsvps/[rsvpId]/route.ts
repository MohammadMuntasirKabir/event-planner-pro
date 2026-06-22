import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";

type Params = Promise<{ eventId: string; rsvpId: string }>;

function getClientIp(request: NextRequest): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  const xri = request.headers.get("x-real-ip");
  if (xri) return xri;
  return "unknown";
}

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
