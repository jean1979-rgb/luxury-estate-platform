"use client";

import { useMemo, useState } from "react";
import VideoPlayer from "@/components/VideoPlayer";

type AdminVideoTabProps = {
  videoUrl: string;
  videoPoster: string;
  onVideoUrlChange: (value: string) => void;
  onVideoPosterChange: (value: string) => void;
  onVideoTypeChange: (value: string) => void;
};

function inferPoster(videoUrl: string, videoPoster: string) {
  const manualPoster = videoPoster.trim();
  if (manualPoster) return manualPoster;
  return "";
}

export default function AdminVideoTab({
  videoUrl,
  videoPoster,
  onVideoUrlChange,
  onVideoPosterChange,
  onVideoTypeChange,
}: AdminVideoTabProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const previewPoster = useMemo(
    () => inferPoster(videoUrl, videoPoster),
    [videoUrl, videoPoster]
  );

  async function uploadToR2(file: File) {
    setUploading(true);
    setUploadError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("kind", "videos");

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data?.url) {
        throw new Error(
          data?.error || data?.message || "No se pudo subir el video a Cloudflare R2."
        );
      }

      onVideoUrlChange(String(data.url));
      onVideoTypeChange("upload");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo subir el video.";
      setUploadError(message);
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
            Video propio. La subida ahora va a Cloudflare R2 mediante tu API.
          </div>
        </div>

        <label className="space-y-2">
          <span className="text-[11px] uppercase tracking-[0.24em] text-white/35">
            Video type
          </span>
          <div className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/80">
            Upload
          </div>
        </label>

        <label className="space-y-2">
          <span className="text-[11px] uppercase tracking-[0.24em] text-white/35">
            Video URL
          </span>
          <input
            value={videoUrl}
            onChange={(e) => onVideoUrlChange(e.target.value)}
            placeholder="https://pub-xxxx.r2.dev/videos/mi-video.mp4"
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
            placeholder="Poster opcional"
            className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-white/25"
          />
        </label>

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
