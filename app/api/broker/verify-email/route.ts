export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/broker/login?verified=missing", req.url));
  }

  const found = await prisma.emailVerificationToken.findUnique({
    where: { token },
  });

  if (!found || found.expiresAt < new Date()) {
    return NextResponse.redirect(new URL("/broker/login?verified=expired", req.url));
  }

  await prisma.user.update({
    where: { id: found.userId },
    data: { status: "PENDING" },
  });

  await prisma.emailVerificationToken.delete({
    where: { token },
  });

  return NextResponse.redirect(new URL("/broker/login?verified=success", req.url));
}
