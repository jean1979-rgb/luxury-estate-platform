"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Viewer360 from "@/components/Viewer360";
import VideoPlayer from "@/components/VideoPlayer";

type HotspotType =
  | "nav"
  | "stairs-up"
  | "stairs-down"
  | "terrace"
  | "room"
  | "amenity"
  | "kitchen"
  | "living"
  | "bedroom"
  | "bathroom"
  | "pool"
  | "beach"
  | "view"
  | "garden"
  | "parking"
  | "elevator"
  | "gym"
  | "spa"
  | "lobby"
  | "dining";

type HotspotSize = "sm" | "md" | "lg";

type Hotspot360 = {
  id: string;
  pitch: number;
  yaw: number;
  label?: string;
  targetSceneId?: string;
  type?: HotspotType;
  size?: HotspotSize;
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

type Viewer360CarouselProps = {
  scenes: Scene360[];
  videoUrl?: string;
  videoPoster?: string;
  initialTab?: "360" | "video";
};

export default function Viewer360Carousel({
  scenes,
  videoUrl,
  videoPoster,
  initialTab,
}: Viewer360CarouselProps) {
  const safeScenes = Array.isArray(scenes)
    ? scenes.filter((scene) => scene?.image)
    : [];

  const hasVideo = typeof videoUrl === "string" && videoUrl.trim().length > 0;

  const defaultTab: "360" | "video" =
    initialTab === "video" && hasVideo
      ? "video"
      : safeScenes.length > 0
        ? "360"
        : "video";

  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(false);
  const [activeTab, setActiveTab] = useState<"360" | "video">(defaultTab);

  const [isFullscreenMounted, setIsFullscreenMounted] = useState(false);
  const [isFullscreenVisible, setIsFullscreenVisible] = useState(false);
  const [originRect, setOriginRect] = useState<RectState | null>(null);
  const [viewport, setViewport] = useState<ViewportState | null>(null);

  const [fullscreenIndex, setFullscreenIndex] = useState(0);
  const [fullscreenSeed, setFullscreenSeed] = useState(0);
  const [fullscreenIntroEnabled, setFullscreenIntroEnabled] = useState(false);
  const [isFsTransitioning, setIsFsTransitioning] = useState(false);


  const [isVideoFullscreenMounted, setIsVideoFullscreenMounted] = useState(false);
  const [isVideoFullscreenVisible, setIsVideoFullscreenVisible] = useState(false);
  const [videoOriginRect, setVideoOriginRect] = useState<RectState | null>(null);
  const [videoViewport, setVideoViewport] = useState<ViewportState | null>(null);

  const viewerCardRef = useRef<HTMLDivElement>(null);

  const sceneIndexById = useMemo(() => {
    return new Map(safeScenes.map((scene, i) => [scene.id, i]));
  }, [safeScenes]);

  useEffect(() => {
    if (initialTab === "video" && hasVideo) {
      setActiveTab("video");
      return;
    }

    if (initialTab === "360" && safeScenes.length > 0) {
      setActiveTab("360");
      return;
    }

    if (safeScenes.length === 0 && hasVideo) {
      setActiveTab("video");
    }
  }, [initialTab, hasVideo, safeScenes.length]);

  useEffect(() => {
    const handler = () => {
      if (hasVideo) {
        setActiveTab("video");
      }
    };

    window.addEventListener("open-property-video", handler);

    return () => {
      window.removeEventListener("open-property-video", handler);
    };
  }, [hasVideo]);

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

  useEffect(() => {
    if (!isVideoFullscreenMounted) return;

    const onResize = () => {
      setVideoViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    onResize();

    const frameId = window.requestAnimationFrame(() => {
      setIsVideoFullscreenVisible(true);
    });

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("resize", onResize);

    return () => {
      window.cancelAnimationFrame(frameId);
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("resize", onResize);
    };
  }, [isVideoFullscreenMounted]);

  if (safeScenes.length === 0 && !hasVideo) return null;

  const current = safeScenes[index] ?? safeScenes[0];
  const fullscreenCurrent = safeScenes[fullscreenIndex] ?? safeScenes[0];

  const currentEntryPitch =
    typeof current?.initialPitch === "number" ? current.initialPitch : ENTRY_PITCH;

  const fullscreenViewerPitch =
    typeof fullscreenCurrent?.initialPitch === "number"
      ? fullscreenCurrent.initialPitch
      : FULLSCREEN_HANDOFF_PITCH;

  const currentHotspots = Array.isArray(current?.hotspots)
    ? current.hotspots.filter(isHotspot)
    : [];

  const fullscreenHotspots = Array.isArray(fullscreenCurrent?.hotspots)
    ? fullscreenCurrent.hotspots.filter(isHotspot)
    : [];

  const visibleHotspots = currentHotspots.filter(
    (hotspot) => hotspot?.targetSceneId
  );

  const visibleFullscreenHotspots = fullscreenHotspots.filter(
    (hotspot) => hotspot?.targetSceneId
  );

  function goPrev() {
    if (safeScenes.length <= 1) return;
    setFade(true);
    window.setTimeout(() => {
      setIndex((prev) => (prev - 1 + safeScenes.length) % safeScenes.length);
      setFade(false);
    }, 120);
  }

  function goNext() {
    if (safeScenes.length <= 1) return;
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
    if (!targetSceneId || isFsTransitioning) return;

    const nextIndex = sceneIndexById.get(targetSceneId);
    if (typeof nextIndex !== "number") return;

    setIsFsTransitioning(true);

    window.setTimeout(() => {
      setFullscreenIntroEnabled(false);
      setFullscreenIndex(nextIndex);
      setFullscreenSeed((prev) => prev + 1);
    }, 200);

    window.setTimeout(() => {
      setIsFsTransitioning(false);
    }, 520);
  }

  function openFullscreen() {
    if (activeTab !== "360") return;
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
    setFullscreenIntroEnabled(true);
    setIsFullscreenVisible(false);
    setIsFullscreenMounted(true);
  }

  function closeFullscreen() {
    setIsFullscreenVisible(false);
    window.setTimeout(() => {
      setIsFullscreenMounted(false);
      setFullscreenIntroEnabled(false);
      setOriginRect(null);
      setViewport(null);
    }, 480);
  }

  function openVideoFullscreen() {
    if (activeTab !== "video" || !hasVideo) return;
    const rect = viewerCardRef.current?.getBoundingClientRect();
    if (!rect) return;

    setVideoOriginRect({
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    });

    setVideoViewport({
      width: window.innerWidth,
      height: window.innerHeight,
    });

    setIsVideoFullscreenVisible(false);
    setIsVideoFullscreenMounted(true);
  }

  function closeVideoFullscreen() {
    setIsVideoFullscreenVisible(false);
    window.setTimeout(() => {
      setIsVideoFullscreenMounted(false);
      setVideoOriginRect(null);
      setVideoViewport(null);
    }, 420);
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

  const videoPanelStyle =
    videoOriginRect && videoViewport
      ? isVideoFullscreenVisible
        ? {
            top: 0,
            left: 0,
            width: videoViewport.width,
            height: videoViewport.height,
            borderRadius: "0px",
          }
        : {
            top: videoOriginRect.top,
            left: videoOriginRect.left,
            width: videoOriginRect.width,
            height: videoOriginRect.height,
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
            <div className="flex items-center gap-5">
              {safeScenes.length > 0 ? (
                <button
                  type="button"
                  onClick={() => setActiveTab("360")}
                  className={`text-3xl font-light transition ${
                    activeTab === "360" ? "text-white" : "text-white/35"
                  }`}
                >
                  Vista 360
                </button>
              ) : null}

              {hasVideo ? (
                <button
                  type="button"
                  onClick={() => setActiveTab("video")}
                  className={`text-3xl font-light transition ${
                    activeTab === "video" ? "text-white" : "text-white/35"
                  }`}
                >
                  Video
                </button>
              ) : null}
            </div>

            {activeTab === "360" && safeScenes.length > 1 ? (
              <p className="mt-2 text-sm text-white/45">
                Escena {index + 1} de {safeScenes.length}
                {current?.title ? ` · ${current.title}` : ""}
              </p>
            ) : activeTab === "video" ? (
              <p className="mt-2 text-sm text-white/45">
                Recorrido en video de la propiedad
              </p>
            ) : null}
          </div>

          {activeTab === "360" && safeScenes.length > 1 ? (
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
          ) : activeTab === "video" && hasVideo ? (
            <button
              type="button"
              onClick={openVideoFullscreen}
              className="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.24em] text-white transition hover:bg-white/10"
            >
              Fullscreen
            </button>
          ) : null}
        </div>

        <div className="mt-6">
          <div
            ref={viewerCardRef}
            className={`relative w-full aspect-[16/9] overflow-hidden rounded-[28px] border border-white/10 bg-black transition-opacity duration-300 ${
              fade ? "opacity-0" : "opacity-100"
            }`}
          >
            {activeTab === "360" && current ? (
              <>
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
              </>
            ) : hasVideo ? (
              <>
                <button
                  type="button"
                  onClick={openVideoFullscreen}
                  className="absolute right-4 top-4 z-20 flex h-10 min-w-10 items-center justify-center rounded-full bg-black/60 px-3 text-xs uppercase tracking-[0.2em] text-white backdrop-blur transition hover:bg-black/80"
                >
                  ⛶
                </button>

                <VideoPlayer
                  src={videoUrl!}
                  poster={videoPoster}
                  className="h-full w-full object-cover"
                />
              </>
            ) : null}
          </div>
        </div>

        <p className="mt-3 text-sm text-white/45">
          {activeTab === "360"
            ? "Arrastra para explorar. Haz click en los puntos para cambiar de escena."
            : "Reproduce el video para conocer la propiedad desde otra perspectiva."}
        </p>
      </div>

      {activeTab === "360" && isFullscreenMounted && originRect && viewport ? (
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
                onHotspotClick={isFsTransitioning ? undefined : goToSceneFullscreen}
                initialYaw={fullscreenCurrent.initialYaw || 0}
                initialPitch={fullscreenViewerPitch}
                introEnabled={fullscreenIntroEnabled}
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

      {activeTab === "video" && isVideoFullscreenMounted && videoOriginRect && videoViewport ? (
        <div
          className={`fixed inset-0 z-[9999] transition-opacity duration-500 ${
            isVideoFullscreenVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="absolute inset-0 bg-black/96" />

          <div
            className="fixed overflow-hidden border border-white/10 bg-black shadow-[0_30px_120px_rgba(0,0,0,0.55)] transition-all duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={videoPanelStyle}
          >
            <div className="absolute inset-0 bg-black">
              <VideoPlayer
                src={videoUrl!}
                poster={videoPoster}
                className="h-full w-full object-contain"
              />
            </div>

            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.04)_52%,rgba(0,0,0,0.22)_100%)]" />
          </div>

          <button
            type="button"
            onClick={closeVideoFullscreen}
            className={`absolute right-6 top-6 z-30 text-2xl text-white transition-all duration-500 ${
              isVideoFullscreenVisible ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"
            }`}
          >
            ✕
          </button>
        </div>
      ) : null}
    </>
  );
}
