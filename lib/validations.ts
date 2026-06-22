/**
 * Input validation schemas.
 * Lightweight manual validators that provide Zod-style APIs
 * without adding a new dependency.
 */

export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; errors: Record<string, string> };

function fail(errors: Record<string, string>): { success: false; errors: Record<string, string> } {
  return { success: false, errors };
}

function ok<T>(data: T): { success: true; data: T } {
  return { success: true, data };
}

// ---- Event Creation ----

export interface CreateEventInput {
  title: string;
  description: string | null;
  location: string | null;
  eventDate: string | null;
}

export function validateCreateEvent(formData: FormData): ValidationResult<CreateEventInput> {
  const errors: Record<string, string> = {};

  const title = (formData.get("title") as string || "").trim();
  const description = (formData.get("description") as string || "").trim() || null;
  const location = (formData.get("location") as string || "").trim() || null;
  const eventDate = (formData.get("eventDate") as string || "").trim() || null;

  if (!title) {
    errors.title = "Title is required";
  } else if (title.length < 3) {
    errors.title = "Title must be at least 3 characters";
  } else if (title.length > 120) {
    errors.title = "Title must be 120 characters or fewer";
  }

  if (description && description.length > 2000) {
    errors.description = "Description must be 2000 characters or fewer";
  }

  if (location && location.length > 200) {
    errors.location = "Location must be 200 characters or fewer";
  }

  if (eventDate) {
    const parsed = new Date(eventDate);
    if (isNaN(parsed.getTime())) {
      errors.eventDate = "Invalid date format";
    }
  }

  if (Object.keys(errors).length > 0) {
    return fail(errors);
  }

  return ok({ title, description, location, eventDate });
}

// ---- RSVP Submission ----

export interface SubmitRsvpInput {
  eventId: string;
  name: string;
  email: string;
  status: "going" | "maybe" | "not_going";
  inviteToken: string | null;
}

const VALID_RSVP_STATUSES = ["going", "maybe", "not_going"];

export function validateSubmitRsvp(formData: FormData): ValidationResult<SubmitRsvpInput> {
  const errors: Record<string, string> = {};

  const eventId = (formData.get("eventId") as string || "").trim();
  const name = (formData.get("name") as string || "").trim();
  const email = (formData.get("email") as string || "").trim();
  const status = (formData.get("status") as string || "").trim();
  const inviteToken = (formData.get("inviteToken") as string || "").trim() || null;

  if (!eventId) {
    errors.eventId = "Event ID is required";
  }

  if (!name) {
    errors.name = "Name is required";
  } else if (name.length < 2) {
    errors.name = "Name must be at least 2 characters";
  } else if (name.length > 120) {
    errors.name = "Name must be 120 characters or fewer";
  }

  if (!email) {
    errors.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Invalid email address";
  } else if (email.length > 254) {
    errors.email = "Email must be 254 characters or fewer";
  }

  if (!status) {
    errors.status = "RSVP status is required";
  } else if (!VALID_RSVP_STATUSES.includes(status)) {
    errors.status = "Invalid RSVP status";
  }

  if (Object.keys(errors).length > 0) {
    return fail(errors);
  }

  return ok({ eventId, name, email, status: status as SubmitRsvpInput["status"], inviteToken });
}
