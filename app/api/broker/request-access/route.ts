import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

const requestSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional().default(""),
  businessName: z.string().optional().default(""),
  city: z.string().optional().default(""),
  message: z.string().optional().default(""),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = requestSchema.parse(body);
    const email = data.email.trim().toLowerCase();

    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json(
        { ok: false, message: "Ese correo ya está registrado." },
        { status: 409 }
      );
    }

    const existingRequest = await prisma.brokerAccessRequest.findFirst({
      where: { email, status: "PENDING" },
      select: { id: true },
    });

    if (existingRequest) {
      return NextResponse.json(
        { ok: false, message: "Ya existe una solicitud pendiente con ese correo." },
        { status: 409 }
      );
    }

    const item = await prisma.brokerAccessRequest.create({
      data: {
        name: data.name.trim(),
        email,
        phone: data.phone.trim(),
        businessName: data.businessName.trim(),
        city: data.city.trim(),
        message: data.message.trim(),
      },
    });

    return NextResponse.json({
      ok: true,
      message: "Solicitud enviada correctamente.",
      item,
    });
  } catch (error) {
    console.error("BROKER_REQUEST_ACCESS_ERROR", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, message: "Datos inválidos." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { ok: false, message: "No se pudo enviar la solicitud." },
      { status: 500 }
    );
  }
}
