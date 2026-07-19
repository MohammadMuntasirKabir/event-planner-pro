import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { validateSubmitRsvp } from "@/lib/validations";
import { normalizeEmail } from "@/lib/utils";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const { eventId } = await params;

  let body: Record<string, string> = {};
  const contentType = req.headers.get("content-type") || "";

  try {
    if (contentType.includes("application/json")) {
      body = (await req.json()) as Record<string, string>;
    } else {
      const formData = await req.formData();
      for (const [key, value] of formData.entries()) {
        body[key] = String(value);
      }
    }
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const validation = validateSubmitRsvp({
    eventId,
    name: body.name,
    email: body.email,
    status: body.status,
    inviteToken: body.inviteToken,
  });
  if (!validation.success) {
    const message = Object.values(validation.errors).join("; ");
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const { name, email, status, inviteToken } = validation.data;

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { invite: true },
  });
  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  let inviteId: string | null = null;
  if (inviteToken) {
    if (event.invite?.token !== inviteToken) {
      return NextResponse.json({ error: "Invalid invite link" }, { status: 403 });
    }
    inviteId = event.invite.id;
  }

  const emailNormalized = normalizeEmail(email);

  const existing = await prisma.eventRsvp.findUnique({
    where: {
      eventId_emailNormalized: { eventId, emailNormalized },
    },
  });

  if (existing) {
    await prisma.eventRsvp.update({
      where: { id: existing.id },
      data: {
        name: name.trim(),
        email: email.trim(),
        status: status as "going" | "maybe" | "not_going",
        respondedAt: new Date(),
        inviteId,
      },
    });
  } else {
    await prisma.eventRsvp.create({
      data: {
        eventId,
        inviteId,
        name: name.trim(),
        email: email.trim(),
        emailNormalized,
        status: status as "going" | "maybe" | "not_going",
      },
    });
  }

  return NextResponse.json({ success: true, status });
}
