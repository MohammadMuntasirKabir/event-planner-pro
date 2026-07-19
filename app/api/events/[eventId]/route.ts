import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { validateCreateEvent } from "@/lib/validations";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const { eventId } = await params;
  const ip = getClientIp(req);
  const limit = rateLimit(ip);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const event = await prisma.event.findFirst({
    where: { id: eventId, ownerUserId: userId },
  });
  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  await prisma.event.delete({ where: { id: eventId } });
  return NextResponse.json({ success: true });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const { eventId } = await params;
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: Record<string, string> = {};
  const contentType = req.headers.get("content-type") || "";
  try {
    if (contentType.includes("application/json")) {
      body = (await req.json()) as Record<string, string>;
    } else {
      const formData = await req.formData();
      for (const [key, value] of formData.entries()) body[key] = String(value);
    }
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const validation = validateCreateEvent({
    title: body.title,
    description: body.description,
    location: body.location,
    eventDate: body.eventDate,
  });
  if (!validation.success) {
    return NextResponse.json(
      { error: Object.values(validation.errors).join("; ") },
      { status: 400 }
    );
  }

  const existing = await prisma.event.findFirst({
    where: { id: eventId, ownerUserId: userId },
  });
  if (!existing) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  const { title, description, location, eventDate } = validation.data;
  const updated = await prisma.event.update({
    where: { id: eventId },
    data: {
      title,
      description,
      location,
      eventDate: eventDate ? new Date(eventDate) : null,
    },
  });

  return NextResponse.json({ success: true, event: updated });
}
