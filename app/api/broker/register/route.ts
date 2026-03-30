import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slugify";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  businessName: z.string().min(2),
  city: z.string().min(2),
  phone: z.string().optional().default(""),
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const data = schema.parse(json);

    const email = data.email.trim().toLowerCase();

    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json(
        { ok: false, message: "Ese email ya está registrado." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const baseSlug = slugify(data.businessName);
    let slug = baseSlug || `broker-${Date.now()}`;
    let i = 1;

    while (
      await prisma.brokerProfile.findUnique({
        where: { slug },
      })
    ) {
      slug = `${baseSlug}-${i}`;
      i += 1;
    }

    const created = await prisma.user.create({
      data: {
        name: data.name.trim(),
        email,
        passwordHash,
        role: "BROKER",
        status: "ACTIVE",
        brokerProfile: {
          create: {
            businessName: data.businessName.trim(),
            slug,
            phone: data.phone?.trim() || "",
            city: data.city.trim(),
            approved: true,
          },
        },
      },
      include: {
        brokerProfile: true,
      },
    });

    return NextResponse.json({
      ok: true,
      user: {
        id: created.id,
        email: created.email,
        role: created.role,
      },
    });
  } catch (error) {
    console.error("POST /api/broker/register", error);
    return NextResponse.json(
      { ok: false, message: "No se pudo crear la cuenta broker." },
      { status: 500 }
    );
  }
}
