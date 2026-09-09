"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Viewer360 from "@/components/Viewer360";

type PartnerOption = {
  id: string;
  name: string;
  slug: string;
};

type Scene360 = {
  id: string;
  title: string;
  image: string;
  thumbnail?: string;
  initialYaw?: number;
  initialPitch?: number;
  hotspots: any[];
};

export default function PublicExperienceForm({ id }: { id?: string }) {
  const router = useRouter();

  const [form, setForm] = useState<any>({
    name: "",
    slug: "",
    category: "",
    shortDescription: "",
    longDescription: "",
    coverImage: "",
    heroVideoUrl: "",
    heroVideoPoster: "",
    gallery: [],
    scenes360: [],
    editorialEyebrow: "",
    editorialTitle: "",
    sideEyebrow: "",
    sideTitle: "",
    sideText: "",
    sideHighlights: [],
    partnerId: "",
    ctaLabel: "",
    ctaHref: "",
    isVisible: true,
    isFeatured: false,
    sortOrder: 0,
  });

  const [partners, setPartners] = useState<PartnerOption[]>([]);
  const [loading, setLoading] = useState(Boolean(id));
  const [saving, setSaving] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [uploading360, setUploading360] = useState(false);

  useEffect(() => {
    fetch("/api/admin/public/partners")
      .then((r) => r.json())
      .then((data) => {
        if (!Array.isArray(data)) return;

        setPartners(
          data
            .filter(
              (item: any) =>
                typeof item?.id === "string" &&
                typeof item?.name === "string"
            )
            .map((item: any) => ({
              id: item.id,
              name: item.name,
              slug: typeof item.slug === "string" ? item.slug : "",
            }))
        );
      })
      .catch(() => setPartners([]));
  }, []);

  useEffect(() => {
    if (!id) return;

    fetch(`/api/admin/public/experiences/${id}`)
      .then((r) => r.json())
      .then((data) =>
        setForm((prev: any) => ({
          ...prev,
          ...data,
          gallery: Array.isArray(data?.gallery) ? data.gallery : [],
          scenes360: Array.isArray(data?.scenes360) ? data.scenes360 : [],
          sideHighlights: Array.isArray(data?.sideHighlights)
            ? data.sideHighlights
            : [],
          partnerId:
            typeof data?.partnerId === "string" ? data.partnerId : "",
          isVisible: Boolean(data?.isVisible),
          isFeatured: Boolean(data?.isFeatured),
          sortOrder: Number(data?.sortOrder ?? 0),
        }))
      )
      .finally(() => setLoading(false));
  }, [id]);

  function update(key: string, value: any) {
    setForm((prev: any) => ({ ...prev, [key]: value }));
  }

  async function normalizeImage(file: File): Promise<File> {
    try {
      const bitmap = await createImageBitmap(file);

      const maxDimension = 2400;
      const scale = Math.min(
        1,
        maxDimension / Math.max(bitmap.width, bitmap.height)
      );

      const width = Math.round(bitmap.width * scale);
      const height = Math.round(bitmap.height * scale);

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");

      if (!ctx) {
        bitmap.close();
        return file;
      }

      ctx.drawImage(bitmap, 0, 0, width, height);
      bitmap.close();

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", 0.92)
      );

      if (!blob) return file;

      const baseName = file.name.replace(/\.[^.]+$/, "") || "image";

      return new File([blob], `${baseName}.jpg`, {
        type: "image/jpeg",
      });
    } catch {
      return file;
    }
  }

  async function uploadToR2(file: File, kind: string) {
    const presign = await fetch("/api/admin/upload/presign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileName: file.name,
        contentType: file.type || "application/octet-stream",
        kind,
      }),
    });

    const payload = await presign.json();

    if (!presign.ok || !payload?.uploadUrl || !payload?.url) {
      throw new Error(payload?.error || "No se pudo preparar la subida.");
    }

    const upload = await fetch(payload.uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": file.type || "application/octet-stream",
      },
      body: file,
    });

    if (!upload.ok) {
      throw new Error(`Error subiendo archivo (${upload.status}).`);
    }

    return String(payload.url);
  }

  async function uploadHeroVideo(file: File) {
    setUploadingVideo(true);

    try {
      const url = await uploadToR2(file, "experience-hero-videos");
      update("heroVideoUrl", url);
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "No se pudo subir el video."
      );
    } finally {
      setUploadingVideo(false);
    }
  }

  async function uploadGallery(files: File[]) {
    if (!files.length) return;

    setUploadingGallery(true);

    try {
      const uploaded: string[] = [];

      for (const original of files) {
        const file = await normalizeImage(original);
        const url = await uploadToR2(
          file,
          `experience-galleries-${form.slug || "experience"}`
        );
        uploaded.push(url);
      }

      setForm((prev: any) => ({
        ...prev,
        gallery: [
          ...(Array.isArray(prev.gallery) ? prev.gallery : []),
          ...uploaded,
        ],
      }));
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "No se pudieron subir las fotografías."
      );
    } finally {
      setUploadingGallery(false);
    }
  }

  async function upload360(file: File) {
    setUploading360(true);

    try {
      const normalized = await normalizeImage(file);
      const url = await uploadToR2(
        normalized,
        `experience-scenes360-${form.slug || "experience"}`
      );

      const scene: Scene360 = {
        id: `scene-${Date.now()}`,
        title: file.name.replace(/\.[^.]+$/, ""),
        image: url,
        thumbnail: url,
        initialYaw: 0,
        initialPitch: 0,
        hotspots: [],
      };

      setForm((prev: any) => ({
        ...prev,
        scenes360: [
          ...(Array.isArray(prev.scenes360) ? prev.scenes360 : []),
          scene,
        ],
      }));
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "No se pudo subir el panorama 360."
      );
    } finally {
      setUploading360(false);
    }
  }

  function moveGallery(index: number, direction: -1 | 1) {
    setForm((prev: any) => {
      const gallery = Array.isArray(prev.gallery)
        ? [...prev.gallery]
        : [];

      const target = index + direction;

      if (target < 0 || target >= gallery.length) return prev;

      [gallery[index], gallery[target]] = [
        gallery[target],
        gallery[index],
      ];

      return { ...prev, gallery };
    });
  }

  function removeGallery(index: number) {
    setForm((prev: any) => ({
      ...prev,
      gallery: Array.isArray(prev.gallery)
        ? prev.gallery.filter((_: string, i: number) => i !== index)
        : [],
    }));
  }

  function updateScene(index: number, key: string, value: any) {
    setForm((prev: any) => {
      const scenes = Array.isArray(prev.scenes360)
        ? [...prev.scenes360]
        : [];

      scenes[index] = {
        ...scenes[index],
        [key]: value,
      };

      return { ...prev, scenes360: scenes };
    });
  }

  function removeScene(index: number) {
    setForm((prev: any) => ({
      ...prev,
      scenes360: Array.isArray(prev.scenes360)
        ? prev.scenes360.filter((_: Scene360, i: number) => i !== index)
        : [],
    }));
  }

  async function save() {
    setSaving(true);

    try {
      const res = await fetch(
        id
          ? `/api/admin/public/experiences/${id}`
          : "/api/admin/public/experiences",
        {
          method: id ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data?.error || "Error guardando");
        return;
      }

      if (!id && data?.id) {
        router.push(`/admin/public/experiences/${data.id}`);
        router.refresh();
        return;
      }

      alert("Guardado");
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="p-10 text-white">Loading...</div>;
  }

  return (
    <div className="max-w-4xl space-y-6 p-10 text-white">
      <h1 className="text-3xl font-light">
        {id ? "Edit Experience" : "New Experience"}
      </h1>

      <section className="space-y-4 rounded-3xl border border-white/10 p-6">
        <div className="text-lg">Información principal</div>

        <input
          className="w-full rounded-xl border border-white/20 bg-black p-3"
          placeholder="Name"
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
        />

        <input
          className="w-full rounded-xl border border-white/20 bg-black p-3"
          placeholder="Slug"
          value={form.slug}
          onChange={(e) => update("slug", e.target.value)}
        />

        <input
          className="w-full rounded-xl border border-white/20 bg-black p-3"
          placeholder="Category"
          value={form.category}
          onChange={(e) => update("category", e.target.value)}
        />

        <select
          className="w-full rounded-xl border border-white/20 bg-black p-3"
          value={form.partnerId}
          onChange={(e) => update("partnerId", e.target.value)}
        >
          <option value="">Sin Partner anfitrión</option>

          {partners.map((partner) => (
            <option key={partner.id} value={partner.id}>
              {partner.name}
            </option>
          ))}
        </select>

        <input
          className="w-full rounded-xl border border-white/20 bg-black p-3"
          placeholder="Short description"
          value={form.shortDescription}
          onChange={(e) => update("shortDescription", e.target.value)}
        />

        <textarea
          className="min-h-32 w-full rounded-xl border border-white/20 bg-black p-3"
          placeholder="Long description"
          value={form.longDescription}
          onChange={(e) => update("longDescription", e.target.value)}
        />

        <input
          className="w-full rounded-xl border border-white/20 bg-black p-3"
          placeholder="Cover image URL"
          value={form.coverImage}
          onChange={(e) => update("coverImage", e.target.value)}
        />
      </section>

      <section className="space-y-4 rounded-3xl border border-white/10 p-6">
        <div>
          <div className="text-lg">Hero video</div>
          <div className="mt-1 text-xs text-white/45">
            Video principal de la Experience.
          </div>
        </div>

        <input
          className="w-full rounded-xl border border-white/20 bg-black p-3"
          placeholder="Hero video URL"
          value={form.heroVideoUrl}
          onChange={(e) => update("heroVideoUrl", e.target.value)}
        />

        <input
          className="w-full rounded-xl border border-white/20 bg-black p-3"
          placeholder="Hero poster URL"
          value={form.heroVideoPoster}
          onChange={(e) => update("heroVideoPoster", e.target.value)}
        />

        <label className="inline-flex cursor-pointer rounded-xl border border-white/20 px-4 py-3 text-sm">
          {uploadingVideo ? "Subiendo..." : "Subir video"}
          <input
            type="file"
            accept="video/*"
            className="hidden"
            disabled={uploadingVideo}
            onChange={async (e: ChangeEvent<HTMLInputElement>) => {
              const input = e.currentTarget;
              const file = input.files?.[0];
              if (file) await uploadHeroVideo(file);
              input.value = "";
            }}
          />
        </label>

        {form.heroVideoUrl ? (
          <video
            src={form.heroVideoUrl}
            poster={form.heroVideoPoster || undefined}
            controls
            muted
            playsInline
            className="aspect-video w-full rounded-2xl bg-black object-cover"
          />
        ) : null}
      </section>

      <section className="space-y-5 rounded-3xl border border-white/10 p-6">
        <div>
          <div className="text-lg">Galería editorial</div>
          <div className="mt-1 text-xs text-white/45">
            El orden de las fotografías será el orden público.
          </div>
        </div>

        <label className="inline-flex cursor-pointer rounded-xl border border-white/20 px-4 py-3 text-sm">
          {uploadingGallery ? "Subiendo..." : "Subir fotografías"}
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            disabled={uploadingGallery}
            onChange={async (e: ChangeEvent<HTMLInputElement>) => {
              const input = e.currentTarget;
              const files = Array.from(input.files || []);
              if (files.length) await uploadGallery(files);
              input.value = "";
            }}
          />
        </label>

        {Array.isArray(form.gallery) && form.gallery.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {form.gallery.map((url: string, index: number) => (
              <div
                key={`${url}-${index}`}
                className="overflow-hidden rounded-2xl border border-white/10"
              >
                <img
                  src={url}
                  alt=""
                  className="aspect-video w-full object-cover"
                />

                <div className="flex items-center gap-2 p-3">
                  <button
                    type="button"
                    onClick={() => moveGallery(index, -1)}
                    disabled={index === 0}
                    className="rounded-lg border border-white/15 px-3 py-2 disabled:opacity-30"
                  >
                    ←
                  </button>

                  <button
                    type="button"
                    onClick={() => moveGallery(index, 1)}
                    disabled={index === form.gallery.length - 1}
                    className="rounded-lg border border-white/15 px-3 py-2 disabled:opacity-30"
                  >
                    →
                  </button>

                  <button
                    type="button"
                    onClick={() => removeGallery(index)}
                    className="ml-auto rounded-lg border border-red-400/30 px-3 py-2 text-red-300"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-white/40">
            Aún no hay fotografías cargadas.
          </div>
        )}
      </section>

      <section className="space-y-5 rounded-3xl border border-white/10 p-6">
        <div>
          <div className="text-lg">Experiencia 360</div>
          <div className="mt-1 text-xs text-white/45">
            Carga panoramas equirectangulares para el visor 360.
          </div>
        </div>

        <label className="inline-flex cursor-pointer rounded-xl border border-white/20 px-4 py-3 text-sm">
          {uploading360 ? "Subiendo..." : "Subir panorama 360"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={uploading360}
            onChange={async (e: ChangeEvent<HTMLInputElement>) => {
              const input = e.currentTarget;
              const file = input.files?.[0];
              if (file) await upload360(file);
              input.value = "";
            }}
          />
        </label>

        {Array.isArray(form.scenes360) && form.scenes360.length ? (
          <div className="space-y-6">
            {form.scenes360.map((scene: Scene360, index: number) => (
              <div
                key={scene.id}
                className="space-y-4 rounded-2xl border border-white/10 p-4"
              >
                <input
                  className="w-full rounded-xl border border-white/20 bg-black p-3"
                  placeholder="Nombre de la escena"
                  value={scene.title || ""}
                  onChange={(e) =>
                    updateScene(index, "title", e.target.value)
                  }
                />

                <Viewer360
                  image={scene.image}
                  hotspots={scene.hotspots || []}
                  initialYaw={scene.initialYaw || 0}
                  initialPitch={scene.initialPitch || 0}
                />

                <button
                  type="button"
                  onClick={() => removeScene(index)}
                  className="rounded-xl border border-red-400/30 px-4 py-2 text-sm text-red-300"
                >
                  Eliminar panorama
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-white/40">
            Aún no hay panoramas 360 cargados.
          </div>
        )}
      </section>

      <section className="space-y-6 rounded-3xl border border-white/10 p-6">
        <div>
          <div className="text-lg">Contenido editorial</div>
          <div className="mt-1 text-xs text-white/45">
            Textos editoriales de la página pública.
          </div>
        </div>

        <input
          className="w-full rounded-xl border border-white/20 bg-black p-3"
          placeholder="Etiqueta de perspectiva editorial"
          value={form.editorialEyebrow}
          onChange={(e) => update("editorialEyebrow", e.target.value)}
        />

        <textarea
          className="min-h-24 w-full rounded-xl border border-white/20 bg-black p-3"
          placeholder="Titular de perspectiva editorial"
          value={form.editorialTitle}
          onChange={(e) => update("editorialTitle", e.target.value)}
        />

        <div className="h-px bg-white/10" />

        <input
          className="w-full rounded-xl border border-white/20 bg-black p-3"
          placeholder="Etiqueta de tarjeta lateral"
          value={form.sideEyebrow}
          onChange={(e) => update("sideEyebrow", e.target.value)}
        />

        <input
          className="w-full rounded-xl border border-white/20 bg-black p-3"
          placeholder="Título de tarjeta lateral"
          value={form.sideTitle}
          onChange={(e) => update("sideTitle", e.target.value)}
        />

        <textarea
          className="min-h-28 w-full rounded-xl border border-white/20 bg-black p-3"
          placeholder="Texto de tarjeta lateral"
          value={form.sideText}
          onChange={(e) => update("sideText", e.target.value)}
        />

        <textarea
          className="min-h-32 w-full rounded-xl border border-white/20 bg-black p-3"
          placeholder="Puntos destacados — uno por línea"
          value={
            Array.isArray(form.sideHighlights)
              ? form.sideHighlights.join("\n")
              : ""
          }
          onChange={(e) =>
            update(
              "sideHighlights",
              e.target.value
                .split("\n")
                .map((item) => item.trim())
                .filter(Boolean)
            )
          }
        />
      </section>

      <section className="space-y-4 rounded-3xl border border-white/10 p-6">
        <div className="text-lg">Publicación y CTA</div>

        <input
          className="w-full rounded-xl border border-white/20 bg-black p-3"
          placeholder="CTA label"
          value={form.ctaLabel}
          onChange={(e) => update("ctaLabel", e.target.value)}
        />

        <input
          className="w-full rounded-xl border border-white/20 bg-black p-3"
          placeholder="CTA href"
          value={form.ctaHref}
          onChange={(e) => update("ctaHref", e.target.value)}
        />

        <input
          type="number"
          className="w-full rounded-xl border border-white/20 bg-black p-3"
          placeholder="Sort order"
          value={form.sortOrder}
          onChange={(e) => update("sortOrder", Number(e.target.value))}
        />

        <label className="flex items-center gap-3 text-sm text-white/80">
          <input
            type="checkbox"
            checked={form.isVisible}
            onChange={(e) => update("isVisible", e.target.checked)}
          />
          Visible
        </label>

        <label className="flex items-center gap-3 text-sm text-white/80">
          <input
            type="checkbox"
            checked={form.isFeatured}
            onChange={(e) => update("isFeatured", e.target.checked)}
          />
          Featured
        </label>
      </section>

      <div className="flex gap-4">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="rounded-xl bg-white px-5 py-3 text-black disabled:opacity-50"
        >
          {saving ? "Guardando..." : "Guardar"}
        </button>

        <button
          type="button"
          onClick={() => router.push("/admin/public/experiences")}
          className="rounded-xl border border-white/20 px-5 py-3"
        >
          Volver
        </button>
      </div>
    </div>
  );
}
