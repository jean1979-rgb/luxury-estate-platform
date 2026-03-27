import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";
import {
  readAdminProperties,
  writeAdminProperties,
} from "@/utils/adminProperties";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const parts = url.pathname.split("/");
    const id = parts[parts.length - 1];

    if (!id) {
      return NextResponse.json(
        { ok: false, message: "ID requerido" },
        { status: 400 }
      );
    }

    const current = await readAdminProperties();

    const exists = current.find((p) => p.id === id);

    if (!exists) {
      return NextResponse.json(
        { ok: false, message: "Propiedad no encontrada" },
        { status: 404 }
      );
    }

    const next = current.filter((p) => p.id !== id);

    await writeAdminProperties(next);

    const folderPath = path.join(
      process.cwd(),
      "public",
      "uploads",
      "properties",
      id
    );

    try {
      await fs.rm(folderPath, { recursive: true, force: true });
    } catch {}

    return NextResponse.json({
      ok: true,
      deletedId: id,
    });
  } catch (error) {
    console.error("DELETE property error", error);

    return NextResponse.json(
      { ok: false, message: "Error eliminando propiedad" },
      { status: 500 }
    );
  }
}
