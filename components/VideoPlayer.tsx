"use client";

type Props = {
  src: string;
  poster?: string;
  className?: string;
};

function getYouTubeEmbed(url: string): string | null {
  try {
    if (url.includes("youtu.be/")) {
      const id = url.split("youtu.be/")[1]?.split("?")[0];
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }

    if (url.includes("watch?v=")) {
      const id = url.split("watch?v=")[1]?.split("&")[0];
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }

    if (url.includes("youtube.com/embed/")) {
      return url;
    }

    return null;
  } catch {
    return null;
  }
}

export default function VideoPlayer({ src, poster, className = "" }: Props) {
  if (!src) return null;

  const youtubeEmbed = getYouTubeEmbed(src);

  if (youtubeEmbed) {
    return (
      <iframe
        src={youtubeEmbed}
        title="YouTube video player"
        className={className || "aspect-video w-full rounded-2xl"}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      />
    );
  }

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
