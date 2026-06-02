import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/server";
import prisma from "@/lib/prisma";
import { generateToken } from "@/lib/utils";

type Params = Promise<{ eventId: string }>;

// DELETE /api/events/[eventId]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Params }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { eventId } = await params;

  // Verify ownership before deleting
  const event = await prisma.event.findFirst({
    where: { id: eventId, ownerUserId: session.id },
  });

  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  await prisma.event.delete({ where: { id: eventId } });
  return NextResponse.json({ success: true });
}

// POST /api/events/[eventId]/invite
export async function POST(
  request: NextRequest,
  { params }: { params: Params }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { eventId } = await params;

  // Verify ownership
  const event = await prisma.event.findFirst({
    where: { id: eventId, ownerUserId: session.id },
    include: { invite: true },
  });

  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  // Return existing token or create new one
  if (event.invite) {
    return NextResponse.json({ token: event.invite.token });
  }

  const token = generateToken();
  await prisma.eventInvite.create({
    data: { eventId, token },
  });

  return NextResponse.json({ token });
}
