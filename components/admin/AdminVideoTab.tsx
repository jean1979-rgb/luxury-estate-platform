"use client";

import { useMemo, useState } from "react";
import VideoPlayer from "@/components/VideoPlayer";

type AdminVideoTabProps = {
  videoUrl: string;
  videoPoster: string;
  videoType?: string | null;
  onVideoUrlChange: (value: string) => void;
  onVideoPosterChange: (value: string) => void;
  onVideoTypeChange: (value: string) => void;
  onUploadVideo?: (file: File) => void | Promise<void>;
};

function inferPoster(videoUrl: string, videoPoster: string, videoType?: string | null) {
  const manualPoster = videoPoster.trim();
  if (manualPoster) return manualPoster;
  if ((videoType || "").trim() === "youtube") return "";
  return "";
}

export default function AdminVideoTab({
  videoUrl,
  videoPoster,
  videoType,
  onVideoUrlChange,
  onVideoPosterChange,
  onVideoTypeChange,
  onUploadVideo,
}: AdminVideoTabProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const resolvedType = (videoType || "upload").trim() || "upload";

  const previewPoster = useMemo(
    () => inferPoster(videoUrl, videoPoster, resolvedType),
    [videoUrl, videoPoster, resolvedType]
  );

  async function uploadToR2(file: File) {
    setUploading(true);
    setUploadError("");

    try {
      const presignRes = await fetch("/api/admin/upload/presign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type || "application/octet-stream",
          kind: "videos",
        }),
      });

      const presignData = await presignRes.json();

      if (!presignRes.ok || !presignData.ok || !presignData.uploadUrl || !presignData.url) {
        throw new Error(presignData.error || "No se pudo preparar la subida directa a R2.");
      }

      const uploadRes = await fetch(presignData.uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type || "application/octet-stream",
        },
        body: file,
      });

      if (!uploadRes.ok) {
        throw new Error(`R2 upload failed: ${uploadRes.status} ${uploadRes.statusText}`);
      }

      onVideoUrlChange(presignData.url);
      onVideoTypeChange("upload");

      if (onUploadVideo) {
        await onUploadVideo(file);
      }
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "No se pudo subir el video.");
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
            Puedes usar video directo subido a Cloudflare R2 o una URL de YouTube.
          </div>
        </div>

        <label className="space-y-2">
          <span className="text-[11px] uppercase tracking-[0.24em] text-white/35">
            Video type
          </span>
          <select
            value={resolvedType}
            onChange={(e) => onVideoTypeChange(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition focus:border-white/25"
          >
            <option value="upload" className="bg-black text-white">Upload</option>
            <option value="youtube" className="bg-black text-white">YouTube</option>
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-[11px] uppercase tracking-[0.24em] text-white/35">
            Video URL
          </span>
          <input
            value={videoUrl}
            onChange={(e) => onVideoUrlChange(e.target.value)}
            placeholder={
              resolvedType === "youtube"
                ? "https://www.youtube.com/watch?v=..."
                : "https://pub-xxxx.r2.dev/videos/mi-video.mp4"
            }
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
            placeholder={
              resolvedType === "youtube"
                ? "Opcional para teaser/preview"
                : "Poster opcional"
            }
            className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-white/25"
          />
        </label>

        {resolvedType === "upload" ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-5">
            <div className="text-sm text-white/75">Cloudflare R2 upload</div>
            <div className="mt-2 text-sm text-white/45">
              Subida por /api/admin/upload hacia R2.
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
                      await uploadToR2(file);
                    }

                    input.value = "";
                  }}
                />
                {uploading ? "Subiendo..." : "Subir video"}
              </label>

              <div className="rounded-2xl border border-white/10 px-4 py-3 text-xs uppercase tracking-[0.22em] text-white/40">
                R2
              </div>
            </div>

            {uploadError ? (
              <pre className="mt-4 overflow-x-auto rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-xs whitespace-pre-wrap text-red-100">
                {uploadError}
              </pre>
            ) : null}
          </div>
        ) : null}
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
              poster={previewPoster}
              className="aspect-video w-full object-cover"
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
