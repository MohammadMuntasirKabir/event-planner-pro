"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { generateToken, normalizeEmail } from "@/lib/utils";

// ---- Event Actions ----

export async function createEvent(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const title = formData.get("title") as string;
  const description = (formData.get("description") as string) || null;
  const location = (formData.get("location") as string) || null;
  const eventDate = (formData.get("eventDate") as string) || null;

  if (!title?.trim()) {
    throw new Error("Title is required");
  }

  const event = await prisma.event.create({
    data: {
      ownerUserId: session.user.id,
      title: title.trim(),
      description: description?.trim() || null,
      location: location?.trim() || null,
      eventDate: eventDate ? new Date(eventDate) : null,
    },
  });

  revalidatePath("/dashboard");
  redirect(`/events/${event.id}`);
}

export async function getMyEvents() {
  const session = await auth();
  if (!session?.user?.id) return [];

  const events = await prisma.event.findMany({
    where: { ownerUserId: session.user.id },
    include: {
      rsvps: true,
      invite: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return events.map((ev) => ({
    ...ev,
    rsvpCounts: {
      going: ev.rsvps.filter((r: { status: string }) => r.status === "going").length,
      maybe: ev.rsvps.filter((r: { status: string }) => r.status === "maybe").length,
      not_going: ev.rsvps.filter((r: { status: string }) => r.status === "not_going").length,
      total: ev.rsvps.length,
    },
  }));
}

export async function getEventById(eventId: string) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const event = await prisma.event.findFirst({
    where: {
      id: eventId,
      ownerUserId: session.user.id,
    },
    include: {
      rsvps: {
        orderBy: { respondedAt: "desc" },
      },
      invite: true,
    },
  });

  return event;
}

export async function deleteEvent(eventId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  await prisma.event.deleteMany({
    where: {
      id: eventId,
      ownerUserId: session.user.id,
    },
  });

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

// ---- Invite Actions ----

export async function createInvite(eventId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  // Verify ownership
  const event = await prisma.event.findFirst({
    where: { id: eventId, ownerUserId: session.user.id },
    include: { invite: true },
  });

  if (!event) {
    throw new Error("Event not found");
  }

  if (event.invite) {
    revalidatePath(`/events/${eventId}`);
    return;
  }

  const token = generateToken();
  await prisma.eventInvite.create({
    data: { eventId, token },
  });

  revalidatePath(`/events/${eventId}`);
}

// ---- RSVP Actions ----

export async function submitRsvp(formData: FormData) {
  const eventId = formData.get("eventId") as string;
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const status = formData.get("status") as string;
  const inviteToken = (formData.get("inviteToken") as string) || null;

  if (!eventId || !name?.trim() || !email?.trim() || !status) {
    throw new Error("All fields are required");
  }

  const emailNormalized = normalizeEmail(email);

  // Verify event exists
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { invite: true },
  });

  if (!event) {
    throw new Error("Event not found");
  }

  // If invite token provided, verify it
  let inviteId: string | null = null;
  if (inviteToken) {
    if (event.invite?.token !== inviteToken) {
      throw new Error("Invalid invite link");
    }
    inviteId = event.invite.id;
  }

  // Upsert RSVP
  const existing = await prisma.eventRsvp.findUnique({
    where: {
      eventId_emailNormalized: {
        eventId,
        emailNormalized,
      },
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

  revalidatePath(`/events/${eventId}`);
  redirect(`/invite/${inviteToken ?? ""}`);
}

export async function getPublicEvent(eventId: string) {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      rsvps: {
        orderBy: { respondedAt: "desc" },
      },
      invite: true,
    },
  });

  return event;
}

export async function deleteRsvp(eventId: string, rsvpId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  // Verify ownership
  const event = await prisma.event.findFirst({
    where: { id: eventId, ownerUserId: session.user.id },
  });

  if (!event) throw new Error("Event not found");

  await prisma.eventRsvp.delete({
    where: { id: rsvpId },
  });

  revalidatePath(`/events/${eventId}`);
}
