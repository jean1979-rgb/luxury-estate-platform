"use client";

import Image from "next/image";
import type { DragEvent, ChangeEvent } from "react";

type Props = {
  gallery: string[];
  uploadingGallery: boolean;
  coverImage: string;
  onUploadGallery: (file: File) => Promise<void> | void;
  onRemoveGalleryImage: (index: number) => void;
  onUseAsCover: (image: string) => void;
};

export default function AdminPhotosTab({
  gallery,
  uploadingGallery,
  coverImage,
  onUploadGallery,
  onRemoveGalleryImage,
  onUseAsCover,
}: Props) {
  async function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);
    for (const file of files) {
      await onUploadGallery(file);
    }
    event.currentTarget.value = "";
  }

  async function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files || []).filter((file) =>
      file.type.startsWith("image/")
    );
    for (const file of files) {
      await onUploadGallery(file);
    }
  }

  return (
    <div className="space-y-6">
      <section
        className="rounded-3xl border border-white/10 bg-white/[0.03] p-5"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-sm font-medium text-white">Fotos</div>
            <div className="mt-1 text-xs text-white/45">
              Grid denso con scroll interno. Preparado para cover select y sorting futuro.
            </div>
            <div className="mt-2 text-[11px] text-white/30">
              Puedes arrastrar imágenes aquí o subir varias al mismo tiempo.
            </div>
          </div>

          <label className="inline-flex cursor-pointer items-center rounded-2xl border border-white/15 px-4 py-3 text-sm text-white transition hover:bg-white/10">
            <input
              type="file"
              multiple
              accept="image/png,image/jpeg,image/jpg,image/webp"
              className="hidden"
              onChange={handleInputChange}
            />
            {uploadingGallery ? "Subiendo..." : "Subir fotos"}
          </label>
        </div>
      </section>

      {gallery.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-white/10 px-4 py-12 text-center text-sm text-white/35">
          Aún no hay imágenes en la galería.
        </div>
      ) : (
        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="text-sm text-white/70">
              {gallery.length} imagen{gallery.length === 1 ? "" : "es"}
            </div>
            <div className="text-xs text-white/35">Scroll interno activo</div>
          </div>

          <div className="max-h-[72vh] overflow-y-auto pr-2">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 2xl:grid-cols-7">
              {gallery.map((image, index) => {
                const isCover = image === coverImage;

                return (
                  <article
                    key={`${image}-${index}`}
                    className="overflow-hidden rounded-2xl border border-white/10 bg-black/20"
                  >
                    <div className="relative aspect-square bg-black/30">
                      <Image
                        src={image}
                        alt={`Gallery ${index + 1}`}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>

                    <div className="space-y-2 p-3">
                      <div className="truncate text-[11px] text-white/35">
                        {image}
                      </div>

                      <div className="grid gap-2">
                        <button
                          type="button"
                          onClick={() => onUseAsCover(image)}
                          className={`w-full rounded-2xl border px-3 py-2 text-xs transition ${
                            isCover
                              ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-200"
                              : "border-white/10 text-white/75 hover:bg-white/10"
                          }`}
                        >
                          {isCover ? "Portada actual" : "Usar como portada"}
                        </button>

                        <button
                          type="button"
                          onClick={() => onRemoveGalleryImage(index)}
                          className="w-full rounded-2xl border border-white/10 px-3 py-2 text-xs text-white/75 transition hover:bg-white/10"
                        >
                          Quitar imagen
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
