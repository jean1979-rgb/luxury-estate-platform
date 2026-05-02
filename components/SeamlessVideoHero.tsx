"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  src: string;
  poster?: string | null;
  className?: string;
};

export default function SeamlessVideoHero({ src, poster, className = "" }: Props) {
  const firstRef = useRef<HTMLVideoElement | null>(null);
  const secondRef = useRef<HTMLVideoElement | null>(null);
  const [active, setActive] = useState<0 | 1>(0);
  const swappingRef = useRef(false);

  useEffect(() => {
    const first = firstRef.current;
    const second = secondRef.current;
    if (!first || !second) return;

    first.currentTime = 0;
    second.currentTime = 0;

    first.play().catch(() => {});
  }, [src]);

  function handleTimeUpdate(currentIndex: 0 | 1) {
    const current = currentIndex === 0 ? firstRef.current : secondRef.current;
    const next = currentIndex === 0 ? secondRef.current : firstRef.current;

    if (!current || !next || swappingRef.current) return;
    if (!Number.isFinite(current.duration) || current.duration <= 0) return;

    const crossfadeSeconds = 1.15;
    const shouldSwap = current.currentTime >= current.duration - crossfadeSeconds;

    if (!shouldSwap) return;

    swappingRef.current = true;

    next.currentTime = 0;
    next.play().catch(() => {});

    setActive(currentIndex === 0 ? 1 : 0);

    window.setTimeout(() => {
      current.pause();
      current.currentTime = 0;
      swappingRef.current = false;
    }, 1300);
  }

  const baseClass =
    "absolute inset-0 h-full w-full object-cover scale-[1.06] animate-[heroZoom_20s_ease-in-out_infinite] transition-opacity duration-[1200ms] ease-out";

  return (
    <div className={`absolute inset-0 overflow-hidden bg-black ${className}`}>
      <video
        ref={firstRef}
        src={src}
        poster={poster || undefined}
        muted
        playsInline
        preload="auto"
        onTimeUpdate={() => handleTimeUpdate(0)}
        className={`${baseClass} ${active === 0 ? "opacity-100" : "opacity-0"}`}
      />

      <video
        ref={secondRef}
        src={src}
        poster={poster || undefined}
        muted
        playsInline
        preload="auto"
        onTimeUpdate={() => handleTimeUpdate(1)}
        className={`${baseClass} ${active === 1 ? "opacity-100" : "opacity-0"}`}
      />
    </div>
  );
}
