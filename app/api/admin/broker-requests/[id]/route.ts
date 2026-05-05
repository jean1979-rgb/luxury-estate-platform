import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { sendMail } from "@/lib/email/send-mail";

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    if (body.action === "reject") {
      const item = await prisma.brokerAccessRequest.update({
        where: { id },
        data: { status: "REJECTED" },
      });

      return NextResponse.json({ ok: true, item });
    }

    if (body.action !== "approve") {
      return NextResponse.json(
        { ok: false, message: "Acción inválida." },
        { status: 400 }
      );
    }

    const request = await prisma.brokerAccessRequest.findUnique({
      where: { id },
    });

    if (!request) {
      return NextResponse.json(
        { ok: false, message: "Solicitud no encontrada." },
        { status: 404 }
      );
    }

    if (request.status === "APPROVED") {
      return NextResponse.json(
        { ok: false, message: "Esta solicitud ya fue aprobada." },
        { status: 409 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: request.email },
      select: { id: true },
    });

    if (existingUser) {
      await prisma.brokerAccessRequest.update({
        where: { id },
        data: { status: "APPROVED" },
      });

      return NextResponse.json(
        { ok: false, message: "Ese correo ya tiene usuario broker." },
        { status: 409 }
      );
    }

    const tempPassword = randomBytes(10).toString("base64url");
    const passwordHash = await bcrypt.hash(tempPassword, 12);
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);

    const businessName = request.businessName?.trim() || request.name;
    const city = request.city?.trim() || "Sin ciudad";
    const phone = request.phone?.trim() || "";
    const slug = `${slugify(businessName)}-${id.slice(-6)}`;

    const user = await prisma.user.create({
      data: {
        name: request.name,
        email: request.email,
        passwordHash,
        role: "BROKER",
        status: "PENDING",
        brokerProfile: {
          create: {
            businessName,
            city,
            phone,
            slug,
            approved: true,
            canPublish: true,
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

    await prisma.brokerAccessRequest.update({
      where: { id },
      data: { status: "APPROVED" },
    });

    const baseUrl =
      process.env.NEXTAUTH_URL?.replace(/\n/g, "").replace(/"/g, "").trim() ||
      process.env.AUTH_URL?.replace(/\n/g, "").replace(/"/g, "").trim() ||
      "http://localhost:3000";

    const verifyUrl = `${baseUrl}/api/broker/verify-email?token=${token}`;
    const loginUrl = `${baseUrl}/broker/login`;

    await sendMail({
      to: user.email,
      subject: "Tu acceso broker fue aprobado - Private Estates México",
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111">
          <h2>Tu acceso broker fue aprobado</h2>
          <p>Hola ${user.name || ""},</p>
          <p>Tu cuenta broker en Private Estates México ya fue creada.</p>
          <p>Primero verifica tu correo:</p>
          <p>
            <a href="${verifyUrl}" style="display:inline-block;padding:12px 18px;background:#111;color:#fff;text-decoration:none;border-radius:8px">
              Verificar correo
            </a>
          </p>
          <p>Después puedes iniciar sesión aquí:</p>
          <p><a href="${loginUrl}">${loginUrl}</a></p>
          <p><strong>Contraseña temporal:</strong> ${tempPassword}</p>
          <p>Por seguridad, recomendamos cambiarla después de entrar.</p>
        </div>
      `,
    });

    return NextResponse.json({ ok: true, user });
  } catch (error) {
    console.error("ADMIN_BROKER_REQUEST_APPROVE_ERROR", error);

    return NextResponse.json(
      { ok: false, message: "No se pudo aprobar la solicitud." },
      { status: 500 }
    );
  }
}
