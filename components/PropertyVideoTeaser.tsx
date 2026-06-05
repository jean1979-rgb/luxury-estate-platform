"use client";

import { useEffect, useState } from "react";
import VideoPlayer from "@/components/VideoPlayer";

type PropertyVideoTeaserProps = {
  propertyId: string;
  title: string;
  videoUrl?: string;
  videoPoster?: string;
  onClose?: () => void;
};

export default function PropertyVideoTeaser({
  propertyId,
  title,
  videoUrl,
  videoPoster,
  onClose,
}: PropertyVideoTeaserProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!videoUrl || !propertyId) return;

    const key = `property-video-teaser:${propertyId}`;

    try {
      const seen = window.sessionStorage.getItem(key);
      if (!seen) {
        setOpen(true);
        window.sessionStorage.setItem(key, "1");
      }
    } catch {
      setOpen(true);
    }
  }, [propertyId, videoUrl]);

  if (!videoUrl || !open) return null;

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl overflow-hidden rounded-[24px] border border-white/10 bg-neutral-950 shadow-[0_30px_120px_rgba(0,0,0,0.55)]">
        <button
          type="button"
          onClick={() => {
  setOpen(false);
  window.dispatchEvent(new Event("open-property-video"));
  onClose?.();
}}
          aria-label="Cerrar video"
          className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/65 text-lg text-white transition hover:bg-black/85"
        >
          ✕
        </button>

        <div className="border-b border-white/10 px-5 py-4 sm:px-7">
          <p className="text-[10px] uppercase tracking-[0.38em] text-white/35">
            Video disponible
          </p>
          <h2 className="mt-2 text-[1.65rem] font-light leading-tight text-white sm:text-3xl">
            {title}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">
            Esta propiedad incluye video disponible. Puedes verlo ahora o continuar a la ficha completa.
          </p>
        </div>

        <div className="bg-black p-3 sm:p-5">
          <div className="overflow-hidden rounded-[18px] border border-white/10">
            <VideoPlayer
              src={videoUrl}
              poster={videoPoster}
              className="aspect-video w-full object-cover"
            />
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-white/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
          <p className="text-xs leading-5 text-white/40">
            El aviso se muestra una sola vez por visita.
          </p>

          <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-3">
            <button
              type="button"
              onClick={() => {
  setOpen(false);
  window.dispatchEvent(new Event("open-property-video"));
  onClose?.();
}}
              className="rounded-full border border-white/15 px-4 py-2.5 text-[11px] uppercase tracking-[0.18em] text-white/75 transition hover:border-white/30 hover:text-white"
            >
              Saltar
            </button>

            <button
              type="button"
              onClick={() => {
  setOpen(false);
  window.dispatchEvent(new Event("open-property-video"));
  onClose?.();
}}
              className="rounded-full border border-[#c6a66a]/35 bg-[#c6a66a]/10 px-4 py-2.5 text-[11px] uppercase tracking-[0.18em] text-[#f3dfb2] transition hover:bg-[#c6a66a]/15"
            >
              Ver video
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
