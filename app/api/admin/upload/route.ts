import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ ok: false, message: "No file" }, { status: 400 });
    }

    const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const preset =
      file.type.startsWith("video/")
        ? process.env.NEXT_PUBLIC_CLOUDINARY_VIDEO_UPLOAD_PRESET
        : process.env.NEXT_PUBLIC_CLOUDINARY_IMAGE_UPLOAD_PRESET;

    if (!cloud || !preset) {
      throw new Error("Cloudinary no configurado");
    }

    const uploadForm = new FormData();
    uploadForm.append("file", file);
    uploadForm.append("upload_preset", preset);

    const isVideo = file.type.startsWith("video/");

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloud}/${isVideo ? "video" : "image"}/upload`,
      {
        method: "POST",
        body: uploadForm,
      }
    );

    const data = await res.json();

    if (!res.ok || !data.secure_url) {
      throw new Error("Upload failed");
    }

    return NextResponse.json({
      ok: true,
      file: {
        url: data.secure_url,
      },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false, message: "Upload error" }, { status: 500 });
  }
}
