export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";

function sanitizeFileName(name: string) {
  return name
    .normalize("NFKD")
    .replace(/[^\w.\-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function buildKey(kind: string, fileName: string) {
  const safeKind = (kind || "misc").replace(/[^\w/-]+/g, "-");
  const safeName = sanitizeFileName(fileName || "file");
  return `${safeKind}/${Date.now()}-${safeName}`;
}

function inferContentType(file: File) {
  const name = file.name.toLowerCase();

  if (file.type) return file.type;
  if (name.endsWith(".jpg") || name.endsWith(".jpeg")) return "image/jpeg";
  if (name.endsWith(".png")) return "image/png";
  if (name.endsWith(".webp")) return "image/webp";
  if (name.endsWith(".mp4")) return "video/mp4";
  if (name.endsWith(".mov")) return "video/quicktime";

  return "application/octet-stream";
}

export async function POST(req: Request) {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET;
  const publicUrl = process.env.R2_PUBLIC_URL;

  if (!accountId || !accessKeyId || !secretAccessKey || !bucket || !publicUrl) {
    return NextResponse.json({ ok: false, error: "Missing R2 environment variables" }, { status: 500 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ ok: false, error: "No file provided" }, { status: 400 });
    }

    const rawKind =
      String(formData.get("kind") || formData.get("folder") || formData.get("type") || "misc").trim() || "misc";

    const kind = rawKind
      .replace(/^\/+/, "")
      .replace(/\/+$/, "")
      .replace(/[^\w/-]+/g, "-");

    const inputBuffer = Buffer.from(await file.arrayBuffer());
    const originalContentType = inferContentType(file);

    let finalBuffer: Buffer<ArrayBufferLike> = inputBuffer;
    let contentType = originalContentType;
    let finalName = file.name;

    const isImage =
      originalContentType.startsWith("image/") ||
      /\.(jpg|jpeg|png|webp)$/i.test(file.name);

    if (isImage) {
      try {
        finalBuffer = await sharp(inputBuffer, { failOn: "none" })
          .rotate()
          .jpeg({ quality: 92, mozjpeg: true })
          .toBuffer();

        contentType = "image/jpeg";
        finalName = `${file.name.replace(/\.[^.]+$/, "")}.jpg`;
      } catch (error) {
        console.warn("Image normalization failed, uploading original file:", error);
        finalBuffer = inputBuffer;
        contentType = originalContentType;
        finalName = file.name;
      }
    }

    const key = buildKey(kind, finalName);

    const s3 = new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId, secretAccessKey },
    });

    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: finalBuffer,
        ContentType: contentType,
      })
    );

    const base = publicUrl.replace(/\/+$/, "");
    const url = `${base}/${key}`;

    return NextResponse.json({
      ok: true,
      url,
      secure_url: url,
      publicUrl: url,
      key,
      bytes: finalBuffer.length,
      originalBytes: file.size,
      normalized: finalBuffer.length !== file.size,
      resource_type: contentType.startsWith("video/") ? "video" : "image",
    });
  } catch (error) {
    console.error("R2 admin upload failed:", error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 }
    );
  }
}
