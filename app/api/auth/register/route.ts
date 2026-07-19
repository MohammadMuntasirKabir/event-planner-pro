import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import prisma from "@/lib/prisma";
import { validateRegister } from "@/lib/validations";
import { normalizeEmail } from "@/lib/utils";

export async function POST(req: NextRequest) {
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const validation = validateRegister(formData);
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
