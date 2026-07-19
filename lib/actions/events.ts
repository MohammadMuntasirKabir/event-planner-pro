"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { generateToken, normalizeEmail, buildCsv } from "@/lib/utils";
import { validateCreateEvent, validateSubmitRsvp } from "@/lib/validations";

/**
 * Ensure a local User record exists for the current user.
 * Called from actions that require a user record (createEvent, etc.)
 */
async function getOrCreateUser() {
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/signin");
  }

  const userId = session.user.id;
  const email = session.user.email ?? "";
  const name = session.user.name ?? null;

  // Check if a user record already exists
  let user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        id: userId,
        email,
        name,
      },
    });
  }

  return { userId, user };
}

// ---- Event Actions ----

export async function createEvent(formData: FormData) {
  const { userId } = await getOrCreateUser();

  const validation = validateCreateEvent(formData);
  if (!validation.success) {
    const messages = Object.values(validation.errors).join("; ");
    throw new Error(messages);
  }

  const { title, description, location, eventDate } = validation.data;

  const event = await prisma.event.create({
    data: {
      ownerUserId: userId,
      title,
      description,
      location,
      eventDate: eventDate ? new Date(eventDate) : null,
    },
  });

  revalidatePath("/dashboard");
  redirect(`/events/${event.id}`);
}

export async function updateEvent(eventId: string, formData: FormData) {
  const { userId } = await getOrCreateUser();

  const validation = validateCreateEvent(formData);
  if (!validation.success) {
    const messages = Object.values(validation.errors).join("; ");
    throw new Error(messages);
  }

  const { title, description, location, eventDate } = validation.data;

  // Verify ownership
  const existing = await prisma.event.findFirst({
    where: { id: eventId, ownerUserId: userId },
  });
  if (!existing) {
    throw new Error("Event not found");
  }

  await prisma.event.update({
    where: { id: eventId },
    data: {
      title,
      description,
      location,
      eventDate: eventDate ? new Date(eventDate) : null,
    },
  });

  revalidatePath(`/events/${eventId}`);
  revalidatePath("/dashboard");
  redirect(`/events/${eventId}`);
}

export async function duplicateEvent(eventId: string) {
  const { userId } = await getOrCreateUser();

  const source = await prisma.event.findFirst({
    where: { id: eventId, ownerUserId: userId },
  });
  if (!source) {
    throw new Error("Event not found");
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

  revalidatePath("/dashboard");
  redirect(`/events/${copy.id}`);
}

export async function exportRsvpsCsv(eventId: string): Promise<string> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error("Unauthorized");

  const event = await prisma.event.findFirst({
    where: { id: eventId, ownerUserId: userId },
    include: { rsvps: { orderBy: { respondedAt: "desc" } } },
  });
  if (!event) throw new Error("Event not found");

  return buildCsv(
    event.rsvps.map((r) => ({
      name: r.name,
      email: r.email,
      status: r.status,
      respondedAt: r.respondedAt,
    }))
  );
}

export async function getMyEvents() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return [];

  const events = await prisma.event.findMany({
    where: { ownerUserId: userId },
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
  const userId = session?.user?.id;
  if (!userId) return null;

  const event = await prisma.event.findFirst({
    where: {
      id: eventId,
      ownerUserId: userId,
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
  const { userId } = await getOrCreateUser();

  await prisma.event.deleteMany({
    where: {
      id: eventId,
      ownerUserId: userId,
    },
  });

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

// ---- Invite Actions ----

export async function createInvite(eventId: string) {
  const { userId } = await getOrCreateUser();

  // Verify ownership
  const event = await prisma.event.findFirst({
    where: { id: eventId, ownerUserId: userId },
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
  const validation = validateSubmitRsvp(formData);
  if (!validation.success) {
    const messages = Object.values(validation.errors).join("; ");
    throw new Error(messages);
  }

  const { eventId, name, email, status, inviteToken } = validation.data;

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

export async function deleteRsvp(eventId: string, rsvpId: string) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error("Unauthorized");
  // Verify ownership
  const event = await prisma.event.findFirst({
    where: { id: eventId, ownerUserId: userId },
  });

  if (!event) throw new Error("Event not found");

  await prisma.eventRsvp.delete({
    where: { id: rsvpId },
  });

  revalidatePath(`/events/${eventId}`);
}
