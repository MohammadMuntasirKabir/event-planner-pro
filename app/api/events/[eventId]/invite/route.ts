import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { generateToken } from "@/lib/utils";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

type Params = Promise<{ eventId: string }>;

// POST /api/events/[eventId]/invite — generate or return existing invite token
export async function POST(
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

  // Verify ownership
  const event = await prisma.event.findFirst({
    where: { id: eventId, ownerUserId: userId },
    include: { invite: true },
  });

  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  // Return existing token if invite already exists
  if (event.invite) {
    return NextResponse.json({ token: event.invite.token });
  }

  // Generate new token and create invite
  const token = generateToken();
  await prisma.eventInvite.create({
    data: { eventId, token },
  });

  return NextResponse.json({ token });
}
