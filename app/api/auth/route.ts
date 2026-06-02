import { NextRequest, NextResponse } from "next/server";
import { getSession, setSession, clearSession } from "@/lib/auth/server";
import prisma from "@/lib/prisma";
import { generateToken, normalizeEmail } from "@/lib/utils";

// GET /api/auth/session — return current session
export async function GET() {
  const session = await getSession();
  return NextResponse.json({ user: session });
}

// POST /api/auth/credentials — sign in with email/password
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

  // In production, use bcrypt. For demo, simple comparison.
  const validPassword = await verifyPassword(password, user.passwordHash);
  if (!validPassword) {
    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 }
    );
  }

  await setSession({
    id: user.id,
    email: user.email,
    name: user.name,
  });

  return NextResponse.json({
    user: { id: user.id, email: user.email, name: user.name },
  });
}

// POST /api/auth/register — create account
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

  await setSession({
    id: user.id,
    email: user.email,
    name: user.name,
  });

  return NextResponse.json({
    user: { id: user.id, email: user.email, name: user.name },
  });
}

// POST /api/auth/logout — clear session
export async function DELETE() {
  await clearSession();
  return NextResponse.json({ success: true });
}

// ---- Password helpers (use bcrypt in production) ----
async function hashPassword(password: string): Promise<string> {
  // Simple hash for demo — replace with bcrypt in production
  const encoder = new TextEncoder();
  const data = encoder.encode(password + "event-planner-salt");
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  const computed = await hashPassword(password);
  return computed === hash;
}
