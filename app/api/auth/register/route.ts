import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/passwords";
import { normalizeEmail } from "@/lib/utils";
import { auth } from "@/lib/auth";

// POST /api/auth/register — create a new account (called from sign-up page)
export async function POST(request: Request) {
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

  // Check if already logged in
  const session = await auth();
  if (session?.user) {
    return NextResponse.json(
      { error: "Already signed in" },
      { status: 409 }
    );
  }

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
