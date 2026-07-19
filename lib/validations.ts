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

export function validateCreateEvent(
  input: FormData | {
    title?: string;
    description?: string;
    location?: string;
    eventDate?: string;
  }
): ValidationResult<CreateEventInput> {
  const errors: Record<string, string> = {};

  const get = (key: string) =>
    input instanceof FormData
      ? ((input.get(key) as string) || "")
      : ((input[key as keyof typeof input] as string) || "");
  const title = get("title").trim();
  const description = get("description").trim() || null;
  const location = get("location").trim() || null;
  const eventDate = get("eventDate").trim() || null;

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

// ---- RSVP Submission ----

export interface SubmitRsvpInput {
  eventId: string;
  name: string;
  email: string;
  status: "going" | "maybe" | "not_going";
  inviteToken: string | null;
}

export function validateSubmitRsvp(
  input: FormData | {
    eventId?: string;
    name?: string;
    email?: string;
    status?: string;
    inviteToken?: string;
  }
): ValidationResult<SubmitRsvpInput> {
  const errors: Record<string, string> = {};

  const get = (key: string) =>
    input instanceof FormData ? ((input.get(key) as string) || "") : ((input[key as keyof typeof input] as string) || "");
  const eventId = get("eventId").trim();
  const name = get("name").trim();
  const email = get("email").trim();
  const status = get("status").trim();
  const inviteToken = get("inviteToken").trim() || null;

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

// ---- Registration ----

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export function validateRegister(data: {
  name?: string;
  email?: string;
  password?: string;
}): ValidationResult<RegisterInput> {
  const errors: Record<string, string> = {};

  const name = (data.name || "").trim();
  const email = (data.email || "").trim();
  const password = (data.password || "");

  if (!name) {
    errors.name = "Name is required";
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

  if (!password) {
    errors.password = "Password is required";
  } else if (password.length < 6) {
    errors.password = "Password must be at least 6 characters";
  } else if (password.length > 128) {
    errors.password = "Password must be 128 characters or fewer";
  }

  if (Object.keys(errors).length > 0) {
    return fail(errors);
  }

  return ok({ name, email, password });
}
