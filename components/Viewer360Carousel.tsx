"use client";

import { useState } from "react";
import Viewer360 from "@/components/Viewer360";

type Scene360 = {
  id: string;
  title?: string;
  image: string;
  thumbnail?: string;
  hotspots?: unknown[];
};

export default function Viewer360Carousel({ scenes }: { scenes: Scene360[] }) {
  const [index, setIndex] = useState(0);

  if (!Array.isArray(scenes) || scenes.length === 0) return null;

  const current = scenes[index];

  function goPrev() {
    setIndex((prev) => (prev - 1 + scenes.length) % scenes.length);
  }

  function goNext() {
    setIndex((prev) => (prev + 1) % scenes.length);
  }

  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.4em] text-white/30">
        Experiencia inmersiva
      </p>

      <div className="mt-3 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-light">Vista 360</h2>
          {scenes.length > 1 ? (
            <p className="mt-2 text-sm text-white/45">
              Escena {index + 1} de {scenes.length}
            </p>
          ) : null}
        </div>

        {scenes.length > 1 ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={goPrev}
              aria-label="Escena anterior"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/5 text-xl text-white transition hover:bg-white/10"
            >
              ←
            </button>

            <button
              type="button"
              onClick={goNext}
              aria-label="Escena siguiente"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/5 text-xl text-white transition hover:bg-white/10"
            >
              →
            </button>
          </div>
        ) : null}
      </div>

      <div className="mt-6 h-[420px] overflow-hidden rounded-[28px] border border-white/10 bg-black md:h-[560px]">
        <Viewer360 image={current.image} />
      </div>
    </div>
  );
}
