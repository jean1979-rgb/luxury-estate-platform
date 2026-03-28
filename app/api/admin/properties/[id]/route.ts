import { NextResponse } from "next/server";
import { readAdminProperties, writeAdminProperties } from "@/utils/adminProperties";

type RouteContext = {
  params: Promise<{ id: string }> | { id: string };
};

export async function DELETE(_: Request, context: RouteContext) {
  try {
    const resolvedParams = await context.params;
    const id = decodeURIComponent(resolvedParams?.id || "").trim();

    if (!id) {
      return NextResponse.json(
        { ok: false, message: "ID inválido" },
        { status: 400 }
      );
    }

    const current = await readAdminProperties();
    const exists = current.some((item) => item.id === id);

    if (!exists) {
      return NextResponse.json(
        { ok: false, message: "Propiedad no encontrada" },
        { status: 404 }
      );
    }

    const next = current.filter((item) => item.id !== id);
    await writeAdminProperties(next);

    return NextResponse.json({
      ok: true,
      deletedId: id,
    });
  } catch (error) {
    console.error("DELETE /api/admin/properties/[id] error", error);

    return NextResponse.json(
      { ok: false, message: "Error al eliminar propiedad" },
      { status: 500 }
    );
  }
}
