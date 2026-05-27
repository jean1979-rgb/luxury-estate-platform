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

export async function POST(req: Request) {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET;
  const publicUrl = process.env.R2_PUBLIC_URL;

  if (!accountId || !accessKeyId || !secretAccessKey || !bucket || !publicUrl) {
    return NextResponse.json(
      { ok: false, error: "Missing R2 environment variables" },
      { status: 500 }
    );
  }

  const s3 = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { ok: false, error: "No file provided" },
        { status: 400 }
      );
    }

    const rawKind =
      String(
        formData.get("kind") ||
        formData.get("folder") ||
        formData.get("type") ||
        "misc"
      ).trim() || "misc";

    const kind = rawKind
      .replace(/^\/+/, "")
      .replace(/\/+$/, "")
      .replace(/[^\w/-]+/g, "-");

    const inputBuffer = Buffer.from(await file.arrayBuffer());

    const isImage =
      file.type.startsWith("image/") ||
      /\.(jpg|jpeg|png|webp)$/i.test(file.name);

    let finalBuffer: Buffer<ArrayBufferLike> = inputBuffer;
    let contentType = file.type || "application/octet-stream";
    let extension = file.name.split(".").pop() || "file";

    if (isImage) {
      const sharpImage = sharp(inputBuffer, {
        failOn: "none",
      });

      const metadata = await sharpImage.metadata();

      if (
        metadata.width &&
        metadata.height &&
        metadata.width > metadata.height
      ) {
        const ratio = metadata.width / metadata.height;

        if (ratio > 1.85 && ratio < 2.15) {
          console.log("360 panorama detected");
        }
      }

      finalBuffer = await sharpImage
        .rotate()
        .jpeg({
          quality: 92,
          mozjpeg: true,
        })
        .toBuffer();

      contentType = "image/jpeg";
      extension = "jpg";
    }

    const cleanBaseName = file.name.replace(/\.[^.]+$/, "");
    const finalName = `${cleanBaseName}.${extension}`;

    const key = buildKey(kind, finalName);

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
      resource_type: contentType.startsWith("video/")
        ? "video"
        : "image",
    });
  } catch (error) {
    console.error("R2 admin upload failed:", error);

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Upload failed",
      },
      { status: 500 }
    );
  }
}
