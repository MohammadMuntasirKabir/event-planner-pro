import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

type Params = Promise<{ eventId: string }>;

// DELETE /api/events/[eventId]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Params }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { eventId } = await params;

  // Verify ownership before deleting
  const event = await db.event.findFirst({
    where: { id: eventId, ownerUserId: session.user.id },
  });

  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  await db.event.delete({ where: { id: eventId } });
  return NextResponse.json({ success: true });
}
