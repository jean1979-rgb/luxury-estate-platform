import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function getSafeExtension(filename: string) {
  const ext = path.extname(filename || "").toLowerCase();
  const allowed = [".jpg", ".jpeg", ".png", ".webp", ".mp4", ".mov", ".webm", ".m4v"];
  if (allowed.includes(ext)) return ext;
  return ".mp4";
}

function getEntityFolder(entityType: string) {
  if (entityType === "property") return "properties";
  return `${entityType}s`;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          ok: false,
          message: "No se recibió ningún archivo.",
        },
        { status: 400 }
      );
    }

    const entityType = String(formData.get("entityType") || "property");
    const entityId = slugify(String(formData.get("entityId") || "temp-property"));
    const folder = slugify(String(formData.get("folder") || "gallery"));

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = getSafeExtension(file.name);
    const filenameBase = slugify(path.basename(file.name, path.extname(file.name)) || "image");
    const stamp = Date.now();
    const finalFileName = `${filenameBase}-${stamp}${ext}`;

    const entityFolder = getEntityFolder(entityType);
    const relativeDir = path.join("uploads", entityFolder, entityId, folder);
    const absoluteDir = path.join(process.cwd(), "public", relativeDir);

    await fs.mkdir(absoluteDir, { recursive: true });

    const absolutePath = path.join(absoluteDir, finalFileName);
    await fs.writeFile(absolutePath, buffer);

    const publicUrl = `/${relativeDir.replace(/\\/g, "/")}/${finalFileName}`;

    return NextResponse.json({
      ok: true,
      file: {
        name: finalFileName,
        originalName: file.name,
        url: publicUrl,
        size: file.size,
        type: file.type || "application/octet-stream",
      },
    });
  } catch (error) {
    console.error("POST /api/admin/upload error", error);

    return NextResponse.json(
      {
        ok: false,
        message: "No fue posible subir el archivo.",
      },
      { status: 500 }
    );
  }
}
