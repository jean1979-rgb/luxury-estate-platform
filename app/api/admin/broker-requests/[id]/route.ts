import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    if (body.action !== "approve" && body.action !== "reject") {
      return NextResponse.json(
        { ok: false, message: "Acción inválida." },
        { status: 400 }
      );
    }

    const item = await prisma.brokerAccessRequest.update({
      where: { id },
      data: {
        status: body.action === "approve" ? "APPROVED" : "REJECTED",
      },
    });

    return NextResponse.json({ ok: true, item });
  } catch (error) {
    console.error("ADMIN_BROKER_REQUEST_ERROR", error);

    return NextResponse.json(
      { ok: false, message: "No se pudo actualizar la solicitud." },
      { status: 500 }
    );
  }
}
