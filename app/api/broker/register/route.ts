import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { sendMail } from "@/lib/email/send-mail";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  businessName: z.string().min(2),
  city: z.string().min(2),
  phone: z.string().min(6),
});

function clean(value: string) {
  return value.trim();
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function normalizePhone(value: string) {
  return value.replace(/\D/g, "");
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = registerSchema.parse(body);

    const name = clean(data.name);
    const email = normalizeEmail(data.email);
    const businessName = clean(data.businessName);
    const city = clean(data.city);
    const phone = clean(data.phone);
    const phoneDigits = normalizePhone(phone);

    const existingEmail = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingEmail) {
      return NextResponse.json(
        { ok: false, message: "Ese correo ya está registrado." },
        { status: 409 }
      );
    }

    const existingPhone = await prisma.brokerProfile.findFirst({
      where: {
        OR: [
          { phone },
          ...(phoneDigits ? [{ phone: phoneDigits }] : []),
        ],
      },
      select: { id: true },
    });

    if (existingPhone) {
      return NextResponse.json(
        { ok: false, message: "Ese teléfono ya está registrado." },
        { status: 409 }
      );
    }

    const existingName = await prisma.user.findFirst({
      where: {
        OR: [
          { name },
          { brokerProfile: { businessName } },
        ],
      },
      select: { id: true },
    });

    if (existingName) {
      return NextResponse.json(
        { ok: false, message: "Ese nombre o firma ya está registrado." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(data.password, 12);
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);

    const created = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: "BROKER",
        status: "PENDING",
        brokerProfile: {
          create: {
            businessName,
            city,
            phone,
            slug: slugify(businessName || name),
            approved: false,
            canPublish: false,
            tokkoEnabled: false,
          },
        },
        emailVerificationTokens: {
          create: {
            token,
            expiresAt,
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    const baseUrl =
      process.env.NEXTAUTH_URL?.replace(/\\n/g, "").replace(/"/g, "").trim() ||
      process.env.AUTH_URL?.replace(/\\n/g, "").replace(/"/g, "").trim() ||
      "http://localhost:3000";

    const verifyUrl = `${baseUrl}/api/broker/verify-email?token=${token}`;

    await sendMail({
      to: created.email,
      subject: "Verifica tu correo - Private Estates México",
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111">
          <h2>Verifica tu correo</h2>
          <p>Hola ${created.name || ""},</p>
          <p>Gracias por registrarte como broker en Private Estates México.</p>
          <p>
            <a href="${verifyUrl}" style="display:inline-block;padding:12px 18px;background:#111;color:#fff;text-decoration:none;border-radius:8px">
              Verificar correo
            </a>
          </p>
          <p>Si el botón no funciona, copia y pega este enlace:</p>
          <p>${verifyUrl}</p>
        </div>
      `,
    });

    return NextResponse.json({
      ok: true,
      message: "Broker creado. Enviamos un correo de verificación.",
      user: created,
    });
  } catch (error) {
    console.error("BROKER_REGISTER_ERROR", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, message: "Datos inválidos." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { ok: false, message: "No se pudo crear el broker." },
      { status: 500 }
    );
  }
}
