"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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

const SCENE_CROSSFADE_MS = 180;

// Precarga conservadora para evitar saturar dispositivos móviles.
const SCENE_PREFETCH_LIMIT = 3;
const SCENE_PREFETCH_DELAY_MS = 600;

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

  const [pendingIndex, setPendingIndex] = useState<number | null>(null);
  const [pendingReady, setPendingReady] = useState(false);
  const [activeLayer, setActiveLayer] = useState<0 | 1>(0);
  const [layerScenes, setLayerScenes] = useState<
    [number | null, number | null]
  >([initialIndex, null]);

  const [mode, setMode] = useState<Viewer360StageMode>("inline");
  const [fullscreenMounted, setFullscreenMounted] = useState(false);
  const [fullscreenVisible, setFullscreenVisible] = useState(false);
  const [originRect, setOriginRect] = useState<Viewer360Rect | null>(null);
  const [viewport, setViewport] =
    useState<Viewer360FullscreenState | null>(null);

  const [fullscreenEntrySceneId, setFullscreenEntrySceneId] =
    useState<string | null>(null);

  const cardRef = useRef<HTMLDivElement | null>(null);
  const transitionTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (transitionTimerRef.current !== null) {
        window.clearTimeout(transitionTimerRef.current);
      }
    };
  }, []);

  const current = safeScenes[index] ?? safeScenes[0];

  useEffect(() => {
    if (!current || safeScenes.length <= 1) return;
    if (pendingIndex !== null) return;

    const connection = (
      navigator as Navigator & {
        connection?: {
          saveData?: boolean;
          effectiveType?: string;
        };
      }
    ).connection;

    // No anticipar descargas cuando el usuario ahorra datos
    // o dispone de una conexión especialmente lenta.
    if (
      connection?.saveData ||
      connection?.effectiveType === "slow-2g" ||
      connection?.effectiveType === "2g"
    ) {
      return;
    }

    const candidates: string[] = [];

    const addCandidate = (scene?: Viewer360Scene) => {
      if (!scene?.image) return;
      if (scene.image === current.image) return;
      if (candidates.includes(scene.image)) return;

      candidates.push(scene.image);
    };

    // Prioridad 1: escenas conectadas mediante hotspots.
    for (const hotspot of current.hotspots || []) {
      if (!hotspot.targetSceneId) continue;

      const target = safeScenes.find(
        (scene) => scene.id === hotspot.targetSceneId
      );

      addCandidate(target);
    }

    // Prioridad 2: navegación secuencial.
    addCandidate(safeScenes[(index + 1) % safeScenes.length]);

    addCandidate(
      safeScenes[
        (index - 1 + safeScenes.length) % safeScenes.length
      ]
    );

    const queue = candidates.slice(0, SCENE_PREFETCH_LIMIT);

    if (!queue.length) return;

    let cancelled = false;
    let position = 0;
    let activeImage: HTMLImageElement | null = null;

    const preloadNext = () => {
      if (cancelled || position >= queue.length) return;

      const url = queue[position++];
      const image = new Image();

      activeImage = image;

      // Coincidir con el modo CORS de THREE.TextureLoader.
      image.crossOrigin = "anonymous";
      image.decoding = "async";
      image.fetchPriority = "low";

      const finish = () => {
        image.onload = null;
        image.onerror = null;

        if (activeImage === image) {
          activeImage = null;
        }

        if (!cancelled) {
          preloadNext();
        }
      };

      image.onload = finish;
      image.onerror = finish;

      image.src = url;
    };

    // Dar prioridad a la panorámica actual.
    const timer = window.setTimeout(
      preloadNext,
      SCENE_PREFETCH_DELAY_MS
    );

    return () => {
      cancelled = true;

      window.clearTimeout(timer);

      if (activeImage) {
        activeImage.onload = null;
        activeImage.onerror = null;
        activeImage = null;
      }
    };
  }, [current, index, safeScenes, pendingIndex]);

  const targetView = current
    ? resolveSceneTargetView(current, { yaw: 0, pitch: 0 })
    : { yaw: 0, pitch: 0 };

  function resetTransition() {
    if (transitionTimerRef.current !== null) {
      window.clearTimeout(transitionTimerRef.current);
      transitionTimerRef.current = null;
    }

    setPendingIndex(null);
    setPendingReady(false);
    setLayerScenes((previous) => {
      const next = [...previous] as [number | null, number | null];
      next[activeLayer === 0 ? 1 : 0] = null;
      return next;
    });
  }

  function openFullscreen() {
    if (pendingIndex !== null) return;

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

    setFullscreenEntrySceneId(current.id);
    setFullscreenVisible(true);
    setFullscreenMounted(true);
    setMode("interactive");
  }

  function closeFullscreen() {
    resetTransition();

    setFullscreenVisible(false);
    setFullscreenMounted(false);
    setFullscreenEntrySceneId(null);
    setOriginRect(null);
    setViewport(null);
    setMode("inline");
  }

  function requestScene(nextIndex: number) {
    if (!safeScenes[nextIndex]) return;
    if (nextIndex === index || pendingIndex !== null) return;

    setPendingReady(false);
    setLayerScenes((previous) => {
      const next = [...previous] as [number | null, number | null];
      next[activeLayer === 0 ? 1 : 0] = nextIndex;
      return next;
    });
    setPendingIndex(nextIndex);
  }

  function handlePendingReady() {
    if (pendingIndex === null || pendingReady) return;

    // Una segunda notificación no debe reiniciar
    // una transición que ya está en curso.
    if (transitionTimerRef.current !== null) return;

    setPendingReady(true);

    const nextIndex = pendingIndex;

    transitionTimerRef.current = window.setTimeout(() => {
      setActiveLayer((layer) => (layer === 0 ? 1 : 0));
      setIndex(nextIndex);
      setPendingIndex(null);
      setPendingReady(false);
      setLayerScenes((previous) => {
        const next = [...previous] as [number | null, number | null];
        next[activeLayer] = null;
        return next;
      });
      transitionTimerRef.current = null;
    }, SCENE_CROSSFADE_MS);
  }

  function goPrev() {
    if (safeScenes.length <= 1 || pendingIndex !== null) return;

    requestScene(
      (index - 1 + safeScenes.length) % safeScenes.length
    );
  }

  function goNext() {
    if (safeScenes.length <= 1 || pendingIndex !== null) return;

    requestScene((index + 1) % safeScenes.length);
  }

  function handleHotspotSceneChange(targetSceneId?: string) {
    if (!targetSceneId) return;

    const nextIndex = safeScenes.findIndex(
      (scene) => scene.id === targetSceneId
    );

    if (nextIndex === -1) return;
    if (nextIndex === index) return;

    requestScene(nextIndex);
  }

  if (!current) return null;

  /*
   * El intro pertenece únicamente a la escena con la que se abrió
   * fullscreen. No cambia al comenzar una precarga.
   */
  const fullscreenIntroEnabled =
    fullscreenEntrySceneId === current.id;

  return (
    <>
      <div className={className}>
        <div
          ref={cardRef}
          className="relative overflow-hidden rounded-[28px] border border-white/10 bg-black"
        >
          <div className="relative aspect-[4/5] w-full bg-black sm:aspect-[16/9]">
            {([0, 1] as const).map((layer) => {
              const sceneIndex = layerScenes[layer];
              const item =
                sceneIndex === null ? null : safeScenes[sceneIndex];
              if (!item) return null;

              const isActive = layer === activeLayer;
              const view = resolveSceneTargetView(item, {
                yaw: 0,
                pitch: 0,
              });

              return (
                <div
                  key={`inline-layer-${layer}`}
                  className="absolute inset-0"
                  style={{
                    zIndex: isActive ? 10 : pendingReady ? 11 : 1,
                    opacity: isActive ? 1 : pendingReady ? 1 : 0,
                    transition: isActive
                      ? "none"
                      : `opacity ${SCENE_CROSSFADE_MS}ms ease`,
                    pointerEvents: isActive ? "auto" : "none",
                  }}
                >
                  <Viewer360Core
                    key={item.id}
                    image={item.image}
                    initialYaw={view.yaw}
                    initialPitch={view.pitch}
                    hotspots={item.hotspots || []}
                    interactive={
                      isActive &&
                      pendingIndex === null &&
                      !fullscreenMounted
                    }
                    renderSuspended={fullscreenMounted}
                    introEnabled={false}
                    onHotspotClick={handleHotspotSceneChange}
                    onReady={
                      !isActive && !fullscreenMounted
                        ? handlePendingReady
                        : undefined
                    }
                  />
                </div>
              );
            })}

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/20" />

            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex items-end justify-between gap-3 p-3 sm:gap-4 sm:p-5">
              <div className="pointer-events-none">
                <p className="text-[10px] uppercase tracking-[0.34em] text-white/45">
                  Vista 360
                </p>

                <h3 className="mt-1 text-lg font-light text-white sm:mt-2 sm:text-2xl">
                  {current.title || `Escena ${index + 1}`}
                </h3>

                <p className="mt-1 text-[10px] text-white/60 sm:mt-2 sm:text-xs sm:text-white/45">
                  Arrastra para explorar
                </p>
              </div>

              <button
                type="button"
                onClick={openFullscreen}
                className="pointer-events-auto flex min-h-[44px] shrink-0 items-center justify-center rounded-full border border-white/15 bg-black/35 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-white backdrop-blur-md transition hover:bg-white hover:text-black sm:px-5 sm:py-3 sm:text-[11px] sm:tracking-[0.28em]"
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
              disabled={pendingIndex !== null}
              className="min-h-[44px] rounded-full border border-white/15 px-4 py-2 text-[11px] uppercase tracking-[0.14em] text-white/80 transition hover:bg-white hover:text-black disabled:cursor-wait disabled:opacity-40 sm:min-h-0 sm:text-xs sm:tracking-[0.24em]"
            >
              ← Prev
            </button>

            <div className="text-sm text-white/50">
              Escena {index + 1} de {safeScenes.length}
            </div>

            <button
              type="button"
              onClick={goNext}
              disabled={pendingIndex !== null}
              className="min-h-[44px] rounded-full border border-white/15 px-4 py-2 text-[11px] uppercase tracking-[0.14em] text-white/80 transition hover:bg-white hover:text-black disabled:cursor-wait disabled:opacity-40 sm:min-h-0 sm:text-xs sm:tracking-[0.24em]"
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
          {([0, 1] as const).map((layer) => {
            const sceneIndex = layerScenes[layer];
            const item =
              sceneIndex === null ? null : safeScenes[sceneIndex];
            if (!item) return null;

            const isActive = layer === activeLayer;
            const view = resolveSceneTargetView(item, {
              yaw: 0,
              pitch: 0,
            });

            return (
              <div
                key={`fullscreen-layer-${layer}`}
                className="absolute inset-0"
                style={{
                  zIndex: isActive ? 10 : pendingReady ? 11 : 1,
                  opacity: isActive ? 1 : pendingReady ? 1 : 0,
                  transition: isActive
                    ? "none"
                    : `opacity ${SCENE_CROSSFADE_MS}ms ease`,
                  pointerEvents: isActive ? "auto" : "none",
                }}
              >
                <Viewer360Core
                  key={item.id}
                  image={item.image}
                  initialYaw={view.yaw}
                  initialPitch={view.pitch}
                  hotspots={item.hotspots || []}
                  interactive={isActive && pendingIndex === null}
                  introEnabled={isActive && fullscreenEntrySceneId === item.id}
                  onHotspotClick={handleHotspotSceneChange}
                  onReady={
                    !isActive && fullscreenMounted
                      ? handlePendingReady
                      : undefined
                  }
                />
              </div>
            );
          })}

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
