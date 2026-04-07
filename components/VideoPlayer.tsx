"use client";

type Props = {
  src: string;
  poster?: string;
  className?: string;
};

export default function VideoPlayer({ src, poster, className = "" }: Props) {
  if (!src) return null;

  return (
    <video
      src={src}
      poster={poster || undefined}
      controls
      playsInline
      preload="metadata"
      className={className || "h-full w-full rounded-2xl object-cover"}
    >
      Tu navegador no soporta video HTML5.
    </video>
  );
}
