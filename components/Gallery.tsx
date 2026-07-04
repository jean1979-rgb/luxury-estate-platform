"use client";

type GalleryProps = {
  images?: string[];
  title?: string;
};

export default function Gallery({ images = [], title = "Propiedad" }: GalleryProps) {
  const safeImages = Array.isArray(images)
    ? images.filter((img) => typeof img === "string" && img.trim().length > 0)
    : [];

  if (safeImages.length === 0) {
    return (
      <div className="flex h-[360px] w-full items-center justify-center bg-black text-sm text-white/40">
        Sin imágenes disponibles
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {safeImages.map((image, index) => (
        <a
          key={`${image}-${index}`}
          href={image}
          target="_blank"
          rel="noreferrer"
          className="group block overflow-hidden rounded-[28px] border border-white/10 bg-black"
        >
          <div className="relative aspect-[4/3] w-full overflow-hidden bg-black">
            <img
              src={image}
              alt={`${title} ${index + 1}`}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          </div>
        </a>
      ))}
    </div>
  );
}
