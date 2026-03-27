import { NextRequest, NextResponse } from "next/server";
import { readAdminProperties, upsertAdminProperty } from "@/utils/adminProperties";
import type { AdminPropertyInput } from "@/types/admin";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const properties = await readAdminProperties();

    return NextResponse.json({
      ok: true,
      properties,
    });
  } catch (error) {
    console.error("GET /api/admin/properties error", error);

    return NextResponse.json(
      {
        ok: false,
        message: "No fue posible leer las propiedades del admin local.",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as AdminPropertyInput;

    if (!body?.title?.trim()) {
      return NextResponse.json(
        {
          ok: false,
          message: "El título es obligatorio.",
        },
        { status: 400 }
      );
    }

    const saved = await upsertAdminProperty(body);

    return NextResponse.json({
      ok: true,
      property: saved,
    });
  } catch (error) {
    console.error("POST /api/admin/properties error", error);

    return NextResponse.json(
      {
        ok: false,
        message: "No fue posible guardar la propiedad.",
      },
      { status: 500 }
    );
  }
}
