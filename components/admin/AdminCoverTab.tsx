"use client";

import Image from "next/image";
import type { ChangeEvent } from "react";

type Props = {
  coverImage: string;
  description: string;
  uploadingCover: boolean;
  onCoverImageChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onUploadCover: (file: File) => Promise<void> | void;
};

export default function AdminCoverTab({
  coverImage,
  description,
  uploadingCover,
  onCoverImageChange,
  onDescriptionChange,
  onUploadCover,
}: Props) {
  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      await onUploadCover(file);
    }
    event.currentTarget.value = "";
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(360px,0.7fr)]">
      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <div className="text-sm font-medium text-white">Cover image</div>
            <div className="mt-1 text-xs text-white/45">
              Imagen principal editorial de la propiedad.
            </div>
          </div>

          <label className="inline-flex cursor-pointer items-center rounded-2xl border border-white/15 px-4 py-3 text-sm text-white transition hover:bg-white/10">
            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              className="hidden"
              onChange={handleFileChange}
            />
            {uploadingCover ? "Subiendo..." : "Reemplazar portada"}
          </label>
        </div>

        <input
          value={coverImage}
          onChange={(e) => onCoverImageChange(e.target.value)}
          className="mb-4 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-white/25"
          placeholder="/uploads/properties/mi-propiedad/cover/imagen.jpg"
        />

        <div className="relative aspect-[16/9] overflow-hidden rounded-[24px] border border-white/10 bg-black/30">
          {coverImage ? (
            <Image
              src={coverImage}
              alt="Cover preview"
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-white/35">
              Sin cover image
            </div>
          )}
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
        <div className="mb-4">
          <div className="text-sm font-medium text-white">Editorial</div>
          <div className="mt-1 text-xs text-white/45">
            Descripción larga y narrativa comercial principal.
          </div>
        </div>

        <textarea
          rows={18}
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          className="min-h-[420px] w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4 text-sm leading-7 text-white outline-none transition placeholder:text-white/25 focus:border-white/25"
          placeholder="Describe la propiedad con tono editorial premium..."
        />
      </section>
    </div>
  );
}
