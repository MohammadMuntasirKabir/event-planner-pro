import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
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

function createUserResponse(userId: string, email_: string, name: string | null, redirectTo: string) {
  const userData = { id: userId, email: email_, name };
  const response = NextResponse.json({ user: userData }, { status: 200 });

  // Set session cookie directly on the response
  response.cookies.set(COOKIE_NAME, JSON.stringify(userData), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  // Redirect header
  response.headers.set("Location", redirectTo);
  response.headers.set("X-Auth-Success", "true");

  return response;
}

// POST /api/auth — sign in
export async function POST(request: NextRequest) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required" },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { email: normalizeEmail(email) },
  });

  if (!user) {
    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 }
    );
  }

  const validPassword = await verifyPassword(password, user.passwordHash);
  if (!validPassword) {
    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 }
    );
  }

  return createUserResponse(user.id, user.email, user.name, "/dashboard");
}

// PUT /api/auth — register
export async function PUT(request: NextRequest) {
  const { name, email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required" },
      { status: 400 }
    );
  }

  const emailNorm = normalizeEmail(email);

  const existing = await prisma.user.findUnique({
    where: { email: emailNorm },
  });

  if (existing) {
    return NextResponse.json(
      { error: "Email already registered" },
      { status: 409 }
    );
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      email: emailNorm,
      name: name?.trim() || null,
      passwordHash,
    },
  });

  return createUserResponse(user.id, user.email, user.name, "/dashboard");
}

// GET /api/auth/session — return current session
export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get(COOKIE_NAME);
  if (!session?.value) {
    return NextResponse.json({ user: null });
  }
  try {
    return NextResponse.json({ user: JSON.parse(session.value) });
  } catch {
    return NextResponse.json({ user: null });
  }
}

// DELETE /api/auth — logout
export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete(COOKIE_NAME);
  return response;
}
