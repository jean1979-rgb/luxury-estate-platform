"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Viewer360 from "@/components/Viewer360";
import Viewer360Planet from "@/components/Viewer360Planet";

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
  initialYaw?: number;
  initialPitch?: number;
};

type RectState = {
  top: number;
  left: number;
  width: number;
  height: number;
};

type ViewportState = {
  width: number;
  height: number;
};

const ENTRY_PITCH = -12;
const FULLSCREEN_HANDOFF_PITCH = 12;

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
  const [fade, setFade] = useState(false);

  const [isFullscreenMounted, setIsFullscreenMounted] = useState(false);
  const [isFullscreenVisible, setIsFullscreenVisible] = useState(false);
  const [originRect, setOriginRect] = useState<RectState | null>(null);
  const [viewport, setViewport] = useState<ViewportState | null>(null);

  const [fullscreenIndex, setFullscreenIndex] = useState(0);
  const [fullscreenSeed, setFullscreenSeed] = useState(0);
  const [planetVisible, setPlanetVisible] = useState(true);

  const viewerCardRef = useRef<HTMLDivElement>(null);

  const safeScenes = Array.isArray(scenes)
    ? scenes.filter((scene) => scene?.image)
    : [];

  const sceneIndexById = useMemo(() => {
    return new Map(safeScenes.map((scene, i) => [scene.id, i]));
  }, [safeScenes]);

  useEffect(() => {
    if (!isFullscreenMounted) return;

    const onResize = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    onResize();

    const frameId = window.requestAnimationFrame(() => {
      setIsFullscreenVisible(true);
    });

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("resize", onResize);

    return () => {
      window.cancelAnimationFrame(frameId);
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("resize", onResize);
    };
  }, [isFullscreenMounted]);

  if (safeScenes.length === 0) return null;

  const current = safeScenes[index] ?? safeScenes[0];
  const fullscreenCurrent = safeScenes[fullscreenIndex] ?? safeScenes[0];

  const currentEntryPitch =
    typeof current.initialPitch === "number" ? current.initialPitch : ENTRY_PITCH;

  const fullscreenViewerPitch =
    typeof fullscreenCurrent.initialPitch === "number"
      ? fullscreenCurrent.initialPitch
      : FULLSCREEN_HANDOFF_PITCH;

  const currentHotspots = Array.isArray(current.hotspots)
    ? current.hotspots.filter(isHotspot)
    : [];

  const fullscreenHotspots = Array.isArray(fullscreenCurrent.hotspots)
    ? fullscreenCurrent.hotspots.filter(isHotspot)
    : [];

  const visibleHotspots = currentHotspots.filter(
    (hotspot) =>
      hotspot?.targetSceneId &&
      sceneIndexById.has(hotspot.targetSceneId)
  );

  const visibleFullscreenHotspots = fullscreenHotspots.filter(
    (hotspot) =>
      hotspot?.targetSceneId &&
      sceneIndexById.has(hotspot.targetSceneId)
  );

  function goPrev() {
    setFade(true);
    window.setTimeout(() => {
      setIndex((prev) => (prev - 1 + safeScenes.length) % safeScenes.length);
      setFade(false);
    }, 120);
  }

  function goNext() {
    setFade(true);
    window.setTimeout(() => {
      setIndex((prev) => (prev + 1) % safeScenes.length);
      setFade(false);
    }, 120);
  }

  function goToSceneInline(targetSceneId?: string) {
    if (!targetSceneId) return;
    const nextIndex = sceneIndexById.get(targetSceneId);
    if (typeof nextIndex === "number") {
      setFade(true);
      window.setTimeout(() => {
        setIndex(nextIndex);
        setFade(false);
      }, 120);
    }
  }

  function goToSceneFullscreen(targetSceneId?: string) {
    if (!targetSceneId) return;
    const nextIndex = sceneIndexById.get(targetSceneId);
    if (typeof nextIndex === "number") {
      setFullscreenIndex(nextIndex);
      setPlanetVisible(true);
      setFullscreenSeed((prev) => prev + 1);
    }
  }

  function openFullscreen() {
    const rect = viewerCardRef.current?.getBoundingClientRect();
    if (!rect) return;

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

    setFullscreenIndex(index);
    setFullscreenSeed((prev) => prev + 1);
    setPlanetVisible(true);
    setIsFullscreenVisible(false);
    setIsFullscreenMounted(true);
  }

  function closeFullscreen() {
    setIsFullscreenVisible(false);
    window.setTimeout(() => {
      setIsFullscreenMounted(false);
      setOriginRect(null);
      setViewport(null);
      setPlanetVisible(true);
    }, 480);
  }

  const panelStyle =
    originRect && viewport
      ? isFullscreenVisible
        ? {
            top: 0,
            left: 0,
            width: viewport.width,
            height: viewport.height,
            borderRadius: "0px",
          }
        : {
            top: originRect.top,
            left: originRect.left,
            width: originRect.width,
            height: originRect.height,
            borderRadius: "28px",
          }
      : undefined;

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

        <div className="mt-6">
          <div
            ref={viewerCardRef}
            className={`relative w-full aspect-[16/9] overflow-hidden rounded-[28px] border border-white/10 bg-black transition-opacity duration-300 ${
              fade ? "opacity-0" : "opacity-100"
            }`}
          >
            <button
              type="button"
              onClick={openFullscreen}
              className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur transition hover:bg-black/80"
            >
              ⛶
            </button>

            <Viewer360
              key={current.id || current.image}
              image={current.image}
              hotspots={visibleHotspots}
              onHotspotClick={goToSceneInline}
              initialYaw={current.initialYaw || 0}
              initialPitch={currentEntryPitch}
            />
          </div>
        </div>

        {visibleHotspots.length > 0 ? (
          <p className="mt-3 text-sm text-white/45">
            Arrastra para explorar. Haz click en los puntos para cambiar de escena.
          </p>
        ) : null}
      </div>

      {isFullscreenMounted && originRect && viewport ? (
        <div
          className={`fixed inset-0 z-[9999] transition-opacity duration-700 ${
            isFullscreenVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="absolute inset-0 bg-black/96" />

          <div
            className="fixed overflow-hidden border border-white/10 bg-black shadow-[0_30px_120px_rgba(0,0,0,0.55)] transition-all duration-[1100ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={panelStyle}
          >
            <div className="absolute inset-0">
              <Viewer360
                key={`${fullscreenCurrent.id}-immersive-${fullscreenSeed}`}
                image={fullscreenCurrent.image}
                hotspots={visibleFullscreenHotspots}
                onHotspotClick={goToSceneFullscreen}
                initialYaw={fullscreenCurrent.initialYaw || 0}
                initialPitch={fullscreenViewerPitch}
              />
            </div>

            <div
              className={`absolute inset-0 transition-opacity duration-700 ${
                planetVisible ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
            >
              <Viewer360Planet
                key={`${fullscreenCurrent.id}-planet-${fullscreenSeed}`}
                image={fullscreenCurrent.image}
                durationMs={3600}
                targetYaw={fullscreenCurrent.initialYaw || 0}
                targetPitch={fullscreenViewerPitch}
                onComplete={() => {
                  setPlanetVisible(false);
                }}
              />
            </div>

            <div
              className={`pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.08)_48%,rgba(0,0,0,0.34)_100%)] transition-opacity duration-[1100ms] ${
                isFullscreenVisible ? "opacity-100" : "opacity-0"
              }`}
            />
          </div>

          <button
            type="button"
            onClick={closeFullscreen}
            className={`absolute right-6 top-6 z-30 text-2xl text-white transition-all duration-700 ${
              isFullscreenVisible ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"
            }`}
          >
            ✕
          </button>
        </div>
      ) : null}
    </>
  );
}
