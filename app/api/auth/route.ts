import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/auth/passwords";
import { normalizeEmail } from "@/lib/utils";

// Legacy email/password auth endpoints (new auth uses Auth.js [...nextauth])

// POST /api/auth — sign in with email/password
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

  if (!user || !user.passwordHash) {
    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 }
    );
  }

  if (!await verifyPassword(password, user.passwordHash)) {
    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 }
    );
  }

  return NextResponse.json({
    user: { id: user.id, email: user.email, name: user.name },
  });
}

// PUT /api/auth — register new account
export async function PUT(request: NextRequest) {
  const { name, email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required" },
      { status: 400 }
    );
  }

  if (password.length < 6) {
    return NextResponse.json(
      { error: "Password must be at least 6 characters" },
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

  return NextResponse.json({
    user: { id: user.id, email: user.email, name: user.name },
  });
}

// GET /api/auth/legacy-session — return current session (kept for backward compat)
export async function GET() {
  return NextResponse.json({ user: null });
}

// DELETE /api/auth — sign out (legacy)
export async function DELETE() {
  return NextResponse.json({ success: true });
}
