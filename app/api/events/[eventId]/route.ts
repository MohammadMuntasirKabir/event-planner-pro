import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

type Params = Promise<{ eventId: string }>;

// DELETE /api/events/[eventId]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Params }
) {
  const { userId } = await auth();
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
