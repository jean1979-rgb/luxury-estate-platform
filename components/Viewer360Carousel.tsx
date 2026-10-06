"use client";

import { useEffect, useRef, useState } from "react";
import VideoPlayer from "@/components/VideoPlayer";
import { Viewer360Stage } from "@/modules/viewer360";
import type { Viewer360Scene } from "@/modules/viewer360";

type Scene360Input = Omit<Viewer360Scene, "hotspots"> & {
  hotspots?: unknown[];
};

function isViewer360Hotspot(
  value: unknown
): value is NonNullable<Viewer360Scene["hotspots"]>[number] {
  if (!value || typeof value !== "object") return false;

  const hotspot = value as Record<string, unknown>;

  return (
    typeof hotspot.id === "string" &&
    typeof hotspot.yaw === "number" &&
    typeof hotspot.pitch === "number"
  );
}

const VIEWER360_PROXY_HOST =
  "pub-97c7fb12e7244f288f056306452e2d7d.r2.dev";

function resolveViewer360Image(src: string): string {
  try {
    const url = new URL(src);

    if (
      url.protocol === "https:" &&
      url.hostname === VIEWER360_PROXY_HOST
    ) {
      return `/api/image-proxy?src=${encodeURIComponent(src)}`;
    }
  } catch {
    // Relative/local URLs pass through unchanged.
  }

  return src;
}

type Viewer360CarouselProps = {
  scenes: Scene360Input[];
  videoUrl?: string;
  videoPoster?: string;
  initialTab?: "360" | "video";
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

export default function Viewer360Carousel({
  scenes,
  videoUrl,
  videoPoster,
  initialTab,
}: Viewer360CarouselProps) {
  const safeScenes: Viewer360Scene[] = Array.isArray(scenes)
    ? scenes
        .filter((scene) => scene?.image)
        .map((scene) => ({
          ...scene,
          image: resolveViewer360Image(scene.image),
          thumbnail: scene.thumbnail
            ? resolveViewer360Image(scene.thumbnail)
            : scene.thumbnail,
          hotspots: Array.isArray(scene.hotspots)
            ? scene.hotspots.filter(isViewer360Hotspot)
            : [],
        }))
    : [];

  const hasVideo =
    typeof videoUrl === "string" && videoUrl.trim().length > 0;

  const defaultTab: "360" | "video" =
    initialTab === "video" && hasVideo
      ? "video"
      : safeScenes.length > 0
        ? "360"
        : "video";

  const [activeTab, setActiveTab] =
    useState<"360" | "video">(defaultTab);

  const [isVideoFullscreenMounted, setIsVideoFullscreenMounted] =
    useState(false);
  const [isVideoFullscreenVisible, setIsVideoFullscreenVisible] =
    useState(false);
  const [videoOriginRect, setVideoOriginRect] =
    useState<RectState | null>(null);
  const [videoViewport, setVideoViewport] =
    useState<ViewportState | null>(null);

  const videoCardRef = useRef<HTMLDivElement | null>(null);

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

  if (safeScenes.length === 0 && !hasVideo) {
    return null;
  }

  function openVideoFullscreen() {
    if (activeTab !== "video" || !hasVideo) return;

    const rect = videoCardRef.current?.getBoundingClientRect();
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

        <div className="mt-3 flex items-center gap-5">
          {safeScenes.length > 0 ? (
            <button
              type="button"
              onClick={() => setActiveTab("360")}
              className={`text-3xl font-light transition ${
                activeTab === "360"
                  ? "text-white"
                  : "text-white/35"
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
                activeTab === "video"
                  ? "text-white"
                  : "text-white/35"
              }`}
            >
              Video
            </button>
          ) : null}
        </div>

        <div className="mt-6">
          {activeTab === "360" && safeScenes.length > 0 ? (
            <Viewer360Stage scenes={safeScenes} />
          ) : null}

          {activeTab === "video" && hasVideo ? (
            <>
              <div
                ref={videoCardRef}
                className="relative aspect-[16/9] w-full overflow-hidden rounded-[28px] border border-white/10 bg-black"
              >
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
              </div>

              <p className="mt-3 text-sm text-white/45">
                Reproduce el video para conocer la propiedad desde otra perspectiva.
              </p>
            </>
          ) : null}
        </div>
      </div>

      {activeTab === "video" &&
      isVideoFullscreenMounted &&
      videoOriginRect &&
      videoViewport ? (
        <div
          className={`fixed inset-0 z-[9999] transition-opacity duration-500 ${
            isVideoFullscreenVisible
              ? "opacity-100"
              : "opacity-0"
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
              isVideoFullscreenVisible
                ? "translate-y-0 opacity-100"
                : "-translate-y-2 opacity-0"
            }`}
          >
            ✕
          </button>
        </div>
      ) : null}
    </>
  );
}
