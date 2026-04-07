"use client";

import { useState } from "react";
import VideoPlayer from "@/components/VideoPlayer";

type Props = {
  videoUrl: string;
  videoPoster: string;
  videoType: string;
  onVideoUrlChange: (value: string) => void;
  onVideoPosterChange: (value: string) => void;
  onVideoTypeChange: (value: string) => void;
  onUploadVideo: (file: File) => Promise<void> | void;
};

function buildCloudinaryPosterUrl(videoUrl: string, publicId?: string) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

  if (cloudName && publicId) {
    return `https://res.cloudinary.com/${cloudName}/video/upload/so_0/${publicId}.jpg`;
  }

  if (videoUrl.includes("/video/upload/")) {
    return videoUrl
      .replace("/video/upload/", "/video/upload/so_0/")
      .replace(/\.(mp4|mov|webm|m4v)(\?.*)?$/i, ".jpg");
  }

  return "";
}

export default function AdminVideoTab({
  videoUrl,
  videoPoster,
  videoType,
  onVideoUrlChange,
  onVideoPosterChange,
  onVideoTypeChange,
}: Props) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_VIDEO_UPLOAD_PRESET;

  async function uploadToCloudinary(file: File) {
    if (!cloudName || !uploadPreset) {
      setUploadError(
        "Faltan NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME o NEXT_PUBLIC_CLOUDINARY_VIDEO_UPLOAD_PRESET."
      );
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      setUploadError("Cloudinary Free: usa videos de hasta 100 MB para pruebas.");
      return;
    }

    const allowed = ["video/mp4", "video/quicktime", "video/webm"];
    const extOk = /\.(mp4|mov|webm|m4v)$/i.test(file.name);

    if (!allowed.includes(file.type) && !extOk) {
      setUploadError("Formato no permitido. Usa mp4, mov, webm o m4v.");
      return;
    }

    setUploading(true);
    setUploadError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", uploadPreset);
      formData.append("resource_type", "video");
      formData.append("folder", "private-estates/properties/videos");

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setUploadError(
          typeof data?.error?.message === "string"
            ? data.error.message
            : JSON.stringify(data, null, 2)
        );
        return;
      }

      const secureUrl = String(data.secure_url || "");
      const publicId = String(data.public_id || "");

      onVideoTypeChange("upload");
      onVideoUrlChange(secureUrl);

      const posterUrl = buildCloudinaryPosterUrl(secureUrl, publicId);
      if (posterUrl) {
        onVideoPosterChange(posterUrl);
      }
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Error subiendo video.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      <div className="space-y-4 rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
        <div>
          <div className="text-[11px] uppercase tracking-[0.28em] text-white/35">
            Video source
          </div>
          <div className="mt-2 text-sm text-white/55">
            Video propio únicamente. Para pruebas con Cloudinary Free, usa videos de hasta 100 MB.
          </div>
        </div>

        <label className="space-y-2">
          <span className="text-[11px] uppercase tracking-[0.24em] text-white/35">
            Video type
          </span>
          <select
            value="upload"
            disabled
            className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/70 outline-none"
          >
            <option value="upload">Upload</option>
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-[11px] uppercase tracking-[0.24em] text-white/35">
            Video URL
          </span>
          <input
            value={videoUrl}
            onChange={(e) => onVideoUrlChange(e.target.value)}
            placeholder="https://res.cloudinary.com/.../video/upload/.../clip.mp4"
            className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-white/25"
          />
        </label>

        <label className="space-y-2">
          <span className="text-[11px] uppercase tracking-[0.24em] text-white/35">
            Poster image
          </span>
          <input
            value={videoPoster}
            onChange={(e) => onVideoPosterChange(e.target.value)}
            placeholder="https://res.cloudinary.com/.../video/upload/so_0/...jpg"
            className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-white/25"
          />
        </label>

        <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-5">
          <div className="text-sm text-white/75">
            Cloudinary direct upload
          </div>
          <div className="mt-2 text-sm text-white/45">
            Subida directa a Cloudinary, sin pasar por tu API de Next.
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <label className="inline-flex cursor-pointer items-center justify-center rounded-2xl border border-white/10 px-4 py-3 text-sm text-white transition hover:bg-white/5">
              <input
                type="file"
                accept="video/mp4,video/quicktime,video/webm,.mp4,.mov,.webm,.m4v"
                className="hidden"
                disabled={uploading}
                onChange={async (e) => {
                  const input = e.currentTarget;
                  const file = input.files?.[0];

                  if (file) {
                    await uploadToCloudinary(file);
                  }

                  input.value = "";
                }}
              />
              {uploading ? "Subiendo..." : "Subir video"}
            </label>

            <div className="rounded-2xl border border-white/10 px-4 py-3 text-xs uppercase tracking-[0.22em] text-white/40">
              Máx. 100 MB
            </div>
          </div>

          {uploadError ? (
            <pre className="mt-4 overflow-x-auto rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-xs whitespace-pre-wrap text-red-100">
{uploadError}
            </pre>
          ) : null}
        </div>
      </div>

      <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
        <div className="mb-4">
          <div className="text-[11px] uppercase tracking-[0.28em] text-white/35">
            Preview
          </div>
          <div className="mt-2 text-sm text-white/55">
            Vista previa del video actual.
          </div>
        </div>

        {videoUrl.trim() ? (
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-black">
            <VideoPlayer
              src={videoUrl}
              poster={videoPoster}
              className="h-[320px] w-full object-cover"
            />
          </div>
        ) : (
          <div className="flex min-h-[260px] items-center justify-center rounded-2xl border border-dashed border-white/10 text-sm text-white/35">
            Sin video cargado
          </div>
        )}
      </div>
    </div>
  );
}
