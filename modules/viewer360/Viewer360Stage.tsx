"use client";

import { useMemo, useRef, useState } from "react";
import Viewer360Core from "./Viewer360Core";
import Viewer360FullscreenShell from "./Viewer360FullscreenShell";
import type {
  Viewer360FullscreenState,
  Viewer360Rect,
  Viewer360Scene,
  Viewer360StageMode,
} from "./Viewer360.types";
import { resolveSceneTargetView } from "./Viewer360SceneDirector";

type Viewer360StageProps = {
  scenes: Viewer360Scene[];
  initialIndex?: number;
  className?: string;
};

export default function Viewer360Stage({
  scenes,
  initialIndex = 0,
  className = "",
}: Viewer360StageProps) {
  const safeScenes = useMemo(
    () => (Array.isArray(scenes) ? scenes.filter((scene) => scene?.image) : []),
    [scenes]
  );

  const [index, setIndex] = useState(initialIndex);
  const [mode, setMode] = useState<Viewer360StageMode>("inline");
  const [fullscreenMounted, setFullscreenMounted] = useState(false);
  const [fullscreenVisible, setFullscreenVisible] = useState(false);
  const [originRect, setOriginRect] = useState<Viewer360Rect | null>(null);
  const [viewport, setViewport] = useState<Viewer360FullscreenState | null>(null);

  const cardRef = useRef<HTMLDivElement | null>(null);

  const current = safeScenes[index] ?? safeScenes[0];
  const targetView = resolveSceneTargetView(current, { yaw: 0, pitch: 0 });

  function openFullscreen() {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect || !current) return;

    setOriginRect({
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    });

    setViewport({
      width: window.innerWidth,
      height: window.innerHeight,
    });

    setFullscreenVisible(true);
    setFullscreenMounted(true);
    setMode("interactive");
  }

  function closeFullscreen() {
    setFullscreenVisible(false);
    setFullscreenMounted(false);
    setOriginRect(null);
    setViewport(null);
    setMode("inline");
  }

  function jumpTo(nextIndex: number) {
    if (!safeScenes[nextIndex]) return;
    setIndex(nextIndex);
  }

  function goPrev() {
    if (safeScenes.length <= 1) return;
    jumpTo((index - 1 + safeScenes.length) % safeScenes.length);
  }

  function goNext() {
    if (safeScenes.length <= 1) return;
    jumpTo((index + 1) % safeScenes.length);
  }

  function handleHotspotSceneChange(targetSceneId?: string) {
    if (!targetSceneId) return;
    const nextIndex = safeScenes.findIndex((scene) => scene.id === targetSceneId);
    if (nextIndex === -1) return;
    jumpTo(nextIndex);
  }

  if (!current) return null;

  return (
    <>
      <div className={className}>
        <div
          ref={cardRef}
          className="relative overflow-hidden rounded-[28px] border border-white/10 bg-black"
        >
          <div className="relative aspect-[16/10] w-full bg-black">
            <img
              src={current.image}
              alt={current.title || "Vista 360"}
              className="absolute inset-0 h-full w-full object-cover"
              draggable={false}
            />

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/20" />

            <div className="absolute inset-x-0 bottom-0 z-20 flex items-end justify-between gap-4 p-5">
              <div className="pointer-events-none">
                <p className="text-[10px] uppercase tracking-[0.34em] text-white/45">
                  Vista 360
                </p>
                <h3 className="mt-2 text-2xl font-light text-white">
                  {current.title || `Escena ${index + 1}`}
                </h3>
                <p className="mt-2 text-xs text-white/45">
                  Preview estático · fullscreen en laboratorio
                </p>
              </div>

              <button
                type="button"
                onClick={openFullscreen}
                className="rounded-full border border-white/15 bg-black/35 px-5 py-3 text-[11px] uppercase tracking-[0.28em] text-white backdrop-blur-md transition hover:bg-white hover:text-black"
              >
                Expandir
              </button>
            </div>
          </div>
        </div>

        {safeScenes.length > 1 ? (
          <div className="mt-4 flex items-center justify-between">
            <button
              type="button"
              onClick={goPrev}
              className="rounded-full border border-white/15 px-4 py-2 text-xs uppercase tracking-[0.24em] text-white/80 transition hover:bg-white hover:text-black"
            >
              ← Prev
            </button>

            <div className="text-sm text-white/50">
              Escena {index + 1} de {safeScenes.length}
            </div>

            <button
              type="button"
              onClick={goNext}
              className="rounded-full border border-white/15 px-4 py-2 text-xs uppercase tracking-[0.24em] text-white/80 transition hover:bg-white hover:text-black"
            >
              Next →
            </button>
          </div>
        ) : null}
      </div>

      <Viewer360FullscreenShell
        mounted={fullscreenMounted}
        visible={fullscreenVisible}
        originRect={originRect}
        viewport={viewport}
        onClose={closeFullscreen}
      >
        <div className="relative h-full w-full bg-black">
          <Viewer360Core
            key={`fullscreen-${current.id}`}
            image={current.image}
            initialYaw={targetView.yaw}
            initialPitch={targetView.pitch}
            hotspots={current.hotspots || []}
            interactive={true}
            introEnabled={true}
            onHotspotClick={handleHotspotSceneChange}
          />

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/30" />

          <div className="absolute inset-x-0 top-0 z-30 flex items-start justify-between gap-4 p-6">
            <div className="pointer-events-none">
              <p className="text-[10px] uppercase tracking-[0.34em] text-white/45">
                Fullscreen 360
              </p>
              <h3 className="mt-2 text-3xl font-light text-white">
                {current.title || `Escena ${index + 1}`}
              </h3>
            </div>

            <button
              type="button"
              onClick={closeFullscreen}
              className="rounded-full border border-white/15 bg-black/35 px-5 py-3 text-[11px] uppercase tracking-[0.28em] text-white backdrop-blur-md transition hover:bg-white hover:text-black"
            >
              Cerrar
            </button>
          </div>
        </div>
      </Viewer360FullscreenShell>
    </>
  );
}
