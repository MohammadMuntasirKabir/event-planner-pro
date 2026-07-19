import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { buildCsv } from "@/lib/utils";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const { eventId } = await params;
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const event = await prisma.event.findFirst({
    where: { id: eventId, ownerUserId: userId },
    include: { rsvps: { orderBy: { respondedAt: "desc" } } },
  });
  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  const csv = buildCsv(
    event.rsvps.map((r) => ({
      name: r.name,
      email: r.email,
      status: r.status,
      respondedAt: r.respondedAt,
    }))
  );

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${event.title
        .replace(/\s+/g, "-")
        .toLowerCase()}-rsvps.csv"`,
    },
  });
}
