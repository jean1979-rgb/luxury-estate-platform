import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  token: z.string().min(20),
  password: z.string().min(8),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    const found = await prisma.emailVerificationToken.findUnique({
      where: { token: data.token },
      include: { user: true },
    });

    if (!found || found.expiresAt < new Date()) {
      return NextResponse.json(
        { ok: false, message: "El enlace expiró o no es válido." },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    await prisma.user.update({
      where: { id: found.userId },
      data: {
        passwordHash,
        emailVerified: new Date(),
        status: "ACTIVE",
      },
    });

    await prisma.emailVerificationToken.delete({
      where: { token: data.token },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("CREATE_PASSWORD_ERROR", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, message: "La contraseña debe tener mínimo 8 caracteres." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { ok: false, message: "No se pudo crear la contraseña." },
      { status: 500 }
    );
  }
}
