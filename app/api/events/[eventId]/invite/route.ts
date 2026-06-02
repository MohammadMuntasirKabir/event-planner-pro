import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { generateToken } from "@/lib/utils";

type Params = Promise<{ eventId: string }>;

// POST /api/events/[eventId]/invite — generate or return existing invite token
export async function POST(
  request: NextRequest,
  { params }: { params: Params }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { eventId } = await params;

  // Verify ownership
  const event = await prisma.event.findFirst({
    where: { id: eventId, ownerUserId: session.user.id },
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
