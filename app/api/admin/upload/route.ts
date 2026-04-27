export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

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
      return NextResponse.json({ ok: false, error: "No file provided" }, { status: 400 });
    }

    const rawKind =
      String(formData.get("kind") || formData.get("folder") || formData.get("type") || "misc").trim() || "misc";

    const kind = rawKind
      .replace(/^\/+/, "")
      .replace(/\/+$/, "")
      .replace(/[^\w/-]+/g, "-");

    const key = buildKey(kind, file.name);
    const body = Buffer.from(await file.arrayBuffer());

    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: body,
        ContentType: file.type || "application/octet-stream",
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
      bytes: file.size,
      resource_type: file.type.startsWith("video/") ? "video" : "image",
    });
  } catch (error) {
    console.error("R2 admin upload failed:", error);
    return NextResponse.json({ ok: false, error: "Upload failed" }, { status: 500 });
  }
}
