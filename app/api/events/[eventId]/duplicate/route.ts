import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const { eventId } = await params;
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const source = await prisma.event.findFirst({
    where: { id: eventId, ownerUserId: userId },
  });
  if (!source) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  const copy = await prisma.event.create({
    data: {
      ownerUserId: userId,
      title: `${source.title} (Copy)`,
      description: source.description,
      location: source.location,
      eventDate: source.eventDate,
    },
  });

  return NextResponse.json({ success: true, eventId: copy.id });
}
