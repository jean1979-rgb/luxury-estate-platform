"use client";

import { useMemo, useState } from "react";
import Viewer360 from "@/components/Viewer360";

type Hotspot360 = {
  id: string;
  pitch: number;
  yaw: number;
  label?: string;
  targetSceneId?: string;
};

type Scene360 = {
  id: string;
  title?: string;
  image: string;
  thumbnail?: string;
  hotspots?: unknown[];
};

function isHotspot(value: unknown): value is Hotspot360 {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === "string" &&
    typeof v.pitch === "number" &&
    typeof v.yaw === "number"
  );
}

export default function Viewer360Carousel({ scenes }: { scenes: Scene360[] }) {
  const [index, setIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fade, setFade] = useState(false);

  const safeScenes = Array.isArray(scenes)
    ? scenes.filter((scene) => scene?.image)
    : [];

  const sceneIndexById = useMemo(() => {
    return new Map(safeScenes.map((scene, i) => [scene.id, i]));
  }, [safeScenes]);

  if (safeScenes.length === 0) return null;

  const current = safeScenes[index] ?? safeScenes[0];

  const currentHotspots = Array.isArray(current.hotspots)
    ? current.hotspots.filter(isHotspot)
    : [];

  const visibleHotspots = currentHotspots.filter(
    (hotspot) =>
      hotspot?.targetSceneId &&
      sceneIndexById.has(hotspot.targetSceneId)
  );

  function goPrev() {
    setFade(true);
    setTimeout(() => {
      setIndex((prev) => (prev - 1 + safeScenes.length) % safeScenes.length);
      setFade(false);
    }, 120);
  }

  function goNext() {
    setFade(true);
    setTimeout(() => {
      setIndex((prev) => (prev + 1) % safeScenes.length);
      setFade(false);
    }, 120);
  }

  function goToSceneById(targetSceneId?: string) {
    if (!targetSceneId) return;
    const nextIndex = sceneIndexById.get(targetSceneId);
    if (typeof nextIndex === "number") {
      setFade(true);
      setTimeout(() => {
        setIndex(nextIndex);
        setFade(false);
      }, 120);
    }
  }

  const viewer = (
    <div
      className={`relative w-full aspect-[16/9] overflow-hidden rounded-[28px] border border-white/10 bg-black transition-opacity duration-300 ${
        fade ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* botón expandir */}
      <button
        onClick={() => setIsFullscreen(true)}
        className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur hover:bg-black/80"
      >
        ⛶
      </button>

      <Viewer360
        key={current.id || current.image}
        image={current.image}
        hotspots={visibleHotspots}
        onHotspotClick={goToSceneById}
      />
    </div>
  );

  return (
    <>
      <div>
        <p className="text-[10px] uppercase tracking-[0.4em] text-white/30">
          Experiencia inmersiva
        </p>

        <div className="mt-3 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-light">Vista 360</h2>

            {safeScenes.length > 1 ? (
              <p className="mt-2 text-sm text-white/45">
                Escena {index + 1} de {safeScenes.length}
                {current.title ? ` · ${current.title}` : ""}
              </p>
            ) : null}
          </div>

          {safeScenes.length > 1 ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={goPrev}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/5 text-xl text-white transition hover:bg-white/10"
              >
                ←
              </button>

              <button
                type="button"
                onClick={goNext}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/5 text-xl text-white transition hover:bg-white/10"
              >
                →
              </button>
            </div>
          ) : null}
        </div>

        <div className="mt-6">{viewer}</div>

        {visibleHotspots.length > 0 ? (
          <p className="mt-3 text-sm text-white/45">
            Arrastra para explorar. Haz click en los puntos para cambiar de escena.
          </p>
        ) : null}
      </div>

      {/* FULLSCREEN */}
      {isFullscreen && (
        <div className="fixed inset-0 z-[9999] bg-black">
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute right-6 top-6 z-20 text-white text-2xl"
          >
            ✕
          </button>

          <div className="absolute inset-0">
            <Viewer360
              key={current.id + "-fullscreen"}
              image={current.image}
              hotspots={visibleHotspots}
              onHotspotClick={goToSceneById}
            />
          </div>
        </div>
      )}
    </>
  );
}
