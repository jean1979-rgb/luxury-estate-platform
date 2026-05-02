import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.redirect(
        new URL("/broker/login?error=invalid_token", req.url)
      );
    }

    const found = await prisma.emailVerificationToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!found || found.expiresAt < new Date()) {
      return NextResponse.redirect(
        new URL("/broker/login?error=expired_token", req.url)
      );
    }

    // 🔥 AQUÍ ESTÁ EL FIX REAL
    await prisma.user.update({
      where: { id: found.userId },
      data: {
        emailVerified: new Date(),
        status: "ACTIVE", // opcional pero recomendado
      },
    });

    await prisma.emailVerificationToken.delete({
      where: { token },
    });

    return NextResponse.redirect(
      new URL("/broker/login?verified=1", req.url)
    );
  } catch (err) {
    console.error("VERIFY EMAIL ERROR:", err);
    return NextResponse.redirect(
      new URL("/broker/login?error=server", req.url)
    );
  }
}
