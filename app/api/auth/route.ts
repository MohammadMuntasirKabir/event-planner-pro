import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { normalizeEmail } from "@/lib/utils";

const COOKIE_NAME = "ep_session";

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + "event-planner-salt");
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const computed = await hashPassword(password);
  return computed === hash;
}

/** Build a JSON response with the session cookie set */
function respondWithSession(user: { id: string; email: string; name: string | null }, status = 200) {
  const response = NextResponse.json({ user }, { status });
  response.cookies.set(COOKIE_NAME, JSON.stringify(user), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return response;
}

/** Build a response with the session cookie cleared */
function respondCleared(message = "Signed out") {
  const response = NextResponse.json({ success: true, message });
  response.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}

// POST /api/auth — sign in
export async function POST(request: NextRequest) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email: normalizeEmail(email) },
  });

  if (!user) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  if (!await verifyPassword(password, user.passwordHash)) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  return respondWithSession({ id: user.id, email: user.email, name: user.name });
}

// PUT /api/auth — register
export async function PUT(request: NextRequest) {
  const { name, email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }

  const emailNorm = normalizeEmail(email);

  if (await prisma.user.findUnique({ where: { email: emailNorm } })) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { email: emailNorm, name: name?.trim() || null, passwordHash },
  });

  return respondWithSession({ id: user.id, email: user.email, name: user.name });
}

// GET /api/auth — return current session
export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get(COOKIE_NAME);
  if (!session?.value) return NextResponse.json({ user: null });
  try {
    return NextResponse.json({ user: JSON.parse(session.value) });
  } catch {
    return NextResponse.json({ user: null });
  }
}

// DELETE /api/auth — sign out (clear cookie)
export async function DELETE() {
  return respondCleared();
}
