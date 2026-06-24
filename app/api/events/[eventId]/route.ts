import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";

type Params = Promise<{ eventId: string }>;

function getClientIp(request: NextRequest): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  const xri = request.headers.get("x-real-ip");
  if (xri) return xri;
  return "unknown";
}

// DELETE /api/events/[eventId]
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

  const { eventId } = await params;

  // Verify ownership before deleting
  const event = await db.event.findFirst({
    where: { id: eventId, ownerUserId: userId },
  });

  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  await db.event.delete({ where: { id: eventId } });
  return NextResponse.json({ success: true });
}
