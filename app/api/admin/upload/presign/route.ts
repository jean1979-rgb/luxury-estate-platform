export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

function sanitizeFileName(name: string) {
  return name
    .normalize("NFKD")
    .replace(/[^\w.\-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

function buildKey(kind: string, fileName: string) {
  const cleanKind = sanitizeFileName(kind || "uploads");
  const cleanName = sanitizeFileName(fileName || "file");
  return `${cleanKind}/${Date.now()}-${cleanName}`;
}

export async function POST(req: Request) {
  try {
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

    const body = await req.json();
    const fileName = String(body.fileName || "video.mp4");
    const contentType = String(body.contentType || "application/octet-stream");
    const kind = String(body.kind || "videos");

    const key = buildKey(kind, fileName);

    const s3 = new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });

    const uploadUrl = await getSignedUrl(
      s3,
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        ContentType: contentType,
      }),
      { expiresIn: 60 * 10 }
    );

    const base = publicUrl.replace(/\/+$/, "");
    const url = `${base}/${key}`;

    return NextResponse.json({
      ok: true,
      uploadUrl,
      url,
      key,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Could not create signed upload URL",
      },
      { status: 500 }
    );
  }
}
