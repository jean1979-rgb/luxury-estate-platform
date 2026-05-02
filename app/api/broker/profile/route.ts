export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  businessName: z.string().min(2).optional(),
  city: z.string().min(2).optional(),
  phone: z.string().optional(),
});

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { ok: false, message: "No autenticado." },
      { status: 401 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { brokerProfile: true },
  });

  if (!user || user.role !== "BROKER") {
    return NextResponse.json(
      { ok: false, message: "Broker no encontrado." },
      { status: 404 }
    );
  }

  const { passwordHash, ...safeUser } = user as any;

  return NextResponse.json({
    ok: true,
    user: safeUser,
  });
}

export async function PUT(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { ok: false, message: "No autenticado." },
      { status: 401 }
    );
  }

  const body = await req.json();
  const data = updateSchema.parse(body);

  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { brokerProfile: true },
  });

  if (!currentUser || currentUser.role !== "BROKER") {
    return NextResponse.json(
      { ok: false, message: "Broker no encontrado." },
      { status: 404 }
    );
  }

  const email = data.email?.trim().toLowerCase();

  if (email && email !== currentUser.email) {
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json(
        { ok: false, message: "Ese correo ya está registrado." },
        { status: 409 }
      );
    }
  }

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name: data.name?.trim(),
      email,
      brokerProfile: {
        upsert: {
          create: {
            businessName:
              data.businessName?.trim() ||
              currentUser.name ||
              currentUser.email.split("@")[0],
            slug: `broker-${session.user.id.slice(0, 8).toLowerCase()}`,
            city: data.city?.trim() || "CDMX",
            phone: data.phone?.trim() || "",
            approved: currentUser.brokerProfile?.approved ?? false,
            canPublish: currentUser.brokerProfile?.canPublish ?? false,
            tokkoEnabled: currentUser.brokerProfile?.tokkoEnabled ?? false,
          },
          update: {
            businessName: data.businessName?.trim(),
            city: data.city?.trim(),
            phone: data.phone?.trim() || "",
          },
        },
      },
    },
    include: { brokerProfile: true },
  });

  const { passwordHash, ...safeUser } = updated as any;

  return NextResponse.json({
    ok: true,
    user: safeUser,
  });
}
