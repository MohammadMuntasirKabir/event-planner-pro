import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import prisma from "@/lib/prisma";
import { validateRegister } from "@/lib/validations";
import { normalizeEmail } from "@/lib/utils";

export async function POST(req: NextRequest) {
  let payload: Record<string, string> = {};

  const contentType = req.headers.get("content-type") || "";
  try {
    if (contentType.includes("application/json")) {
      payload = (await req.json()) as Record<string, string>;
    } else {
      const formData = await req.formData();
      for (const [key, value] of formData.entries()) {
        payload[key] = String(value);
      }
    }
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const validation = validateRegister(payload);
  if (!validation.success) {
    const message = Object.values(validation.errors).join("; ");
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const { name, email, password } = validation.data;
  const normalizedEmail = normalizeEmail(email);

  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });
  if (existing) {
    return NextResponse.json(
      { error: "An account with this email already exists" },
      { status: 409 }
    );
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: {
      id: randomUUID(),
      email: normalizedEmail,
      name,
      password: hashedPassword,
    },
  });

  return NextResponse.json({ success: true });
}
