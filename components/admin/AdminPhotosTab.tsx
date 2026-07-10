"use client";

import Image from "next/image";
import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";
import type { DragEvent, ChangeEvent } from "react";
import type {
  PdfAssignments,
  PdfEditorialPage,
} from "@/types/admin";

const PDF_PAGE_OPTIONS: Array<{
  value: PdfEditorialPage;
  label: string;
}> = [
  { value: "cover", label: "Portada" },
  { value: "architecture", label: "Arquitectura y Diseño" },
  { value: "spaces", label: "Espacios de Lujo" },
  { value: "materials", label: "Materialidad y Acabados" },
  { value: "wellness", label: "Wellness & Lifestyle" },
  { value: "gallery", label: "Galería Curada" },
  { value: "destination", label: "Destino" },
  { value: "investment", label: "Inversión" },
  { value: "contact", label: "Contacto" },
];

type Props = {
  gallery: string[];
  pdfGallery: string[];
  pdfAssignments: PdfAssignments;
  uploadingGallery: boolean;
  coverImage: string;
  onUploadGallery: (file: File) => Promise<void> | void;
  onRemoveGalleryImage: (index: number) => void;
  onTogglePdfImage: (image: string) => void;
  onSetPdfAssignment: (image: string, page: PdfEditorialPage) => void;
  onUseAsCover: (image: string) => void;
  onReorderGallery: (from: number, to: number) => void;
};

export default function AdminPhotosTab({
  gallery,
  pdfGallery,
  pdfAssignments,
  uploadingGallery,
  coverImage,
  onUploadGallery,
  onRemoveGalleryImage,
  onTogglePdfImage,
  onSetPdfAssignment,
  onUseAsCover,
  onReorderGallery,
}: Props) {
  const dragIndexRef = useRef<number | null>(null);
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!pendingImage) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setPendingImage(null);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [pendingImage]);

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

  function assignmentLabel(image: string) {
    const assignment = pdfAssignments[image];

    return (
      PDF_PAGE_OPTIONS.find((option) => option.value === assignment)?.label ||
      "Sin asignar"
    );
  }

  return (
    <div className="space-y-6">
      <section
        className="rounded-3xl border border-white/10 bg-white/[0.03] p-5"
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-sm font-medium text-white">Fotos</div>

            <div className="mt-1 text-xs text-white/45">
              Selecciona las fotos y asigna cada una a su página editorial.
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

            <div className="text-xs text-amber-300">
              PDF: {pdfGallery.length} seleccionadas
            </div>
          </div>

          <div className="max-h-[72vh] overflow-y-auto pr-2">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 2xl:grid-cols-7">
              {gallery.map((image, index) => {
                const isCover = image === coverImage;
                const isPdf = pdfGallery.includes(image);

                return (
                  <article
                    key={`${image}-${index}`}
                    draggable
                    onDragStart={() => {
                      dragIndexRef.current = index;
                    }}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={() => {
                      if (dragIndexRef.current === null) return;

                      onReorderGallery(dragIndexRef.current, index);
                      dragIndexRef.current = null;
                    }}
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

                      {isPdf ? (
                        <div className="absolute bottom-2 left-2 right-2 truncate rounded-lg bg-black/75 px-2 py-1 text-center text-[9px] uppercase tracking-[0.12em] text-amber-200">
                          {assignmentLabel(image)}
                        </div>
                      ) : null}
                    </div>

                    <div className="space-y-2 p-3">
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
                        onClick={() => setPendingImage(image)}
                        className={`w-full rounded-2xl border px-3 py-2 text-xs transition ${
                          isPdf
                            ? "border-amber-300/50 bg-amber-300/10 text-amber-200"
                            : "border-white/10 text-white/75 hover:bg-white/10"
                        }`}
                      >
                        {isPdf ? "✓ PDF · Cambiar" : "Foto PDF"}
                      </button>

                      <button
                        type="button"
                        onClick={() => onRemoveGalleryImage(index)}
                        className="w-full rounded-2xl border border-white/10 px-3 py-2 text-xs text-white/75 transition hover:bg-white/10"
                      >
                        Quitar imagen
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {mounted && pendingImage
        ? createPortal(
            <div
              className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-black/80 px-4 py-8 backdrop-blur-sm"
              onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                  setPendingImage(null);
                }
              }}
            >
              <div className="my-auto w-full max-w-lg rounded-[28px] border border-white/15 bg-[#121212] p-6 shadow-2xl">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.28em] text-amber-300">
                      PDF editorial
                    </div>

                    <h3 className="mt-2 text-xl font-medium text-white">
                      Asignar fotografía
                    </h3>

                    <p className="mt-2 text-sm text-white/50">
                      Selecciona la página donde se utilizará esta imagen.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setPendingImage(null)}
                    className="rounded-full border border-white/10 px-3 py-2 text-sm text-white/60 hover:bg-white/10"
                  >
                    Cerrar
                  </button>
                </div>

                <div className="mt-5 grid gap-2 sm:grid-cols-2">
                  {PDF_PAGE_OPTIONS.map((option) => {
                    const selected =
                      pdfAssignments[pendingImage] === option.value;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          onSetPdfAssignment(pendingImage, option.value);
                          setPendingImage(null);
                        }}
                        className={`rounded-2xl border px-4 py-3 text-left text-sm transition ${
                          selected
                            ? "border-amber-300/60 bg-amber-300/10 text-amber-200"
                            : "border-white/10 text-white/75 hover:bg-white/10"
                        }`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>

                {pdfGallery.includes(pendingImage) ? (
                  <button
                    type="button"
                    onClick={() => {
                      onTogglePdfImage(pendingImage);
                      setPendingImage(null);
                    }}
                    className="mt-5 w-full rounded-2xl border border-red-300/20 px-4 py-3 text-sm text-red-200/80 transition hover:bg-red-300/10"
                  >
                    Quitar del PDF
                  </button>
                ) : null}
              </div>
            </div>,
            document.body
          )
        : null}
    </div>
  );
}
