"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Viewer360 from "@/components/Viewer360";

type PartnerScene360 = {
  id: string;
  title: string;
  image: string;
  thumbnail?: string;
  initialYaw?: number;
  initialPitch?: number;
  hotspots: [];
};

function sceneIdFromFileName(name: string) {
  return name
    .replace(/\.[^.]+$/, "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

async function normalizeImage(file: File) {
  const isImage =
    file.type.startsWith("image/") ||
    /\.(jpg|jpeg|png|webp)$/i.test(file.name);

  if (!isImage) return file;

  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");

  canvas.width = bitmap.width;
  canvas.height = bitmap.height;

  const ctx = canvas.getContext("2d");

  if (!ctx) {
    bitmap.close();
    return file;
  }

  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/jpeg", 0.92);
  });

  if (!blob) return file;

  return new File(
    [blob],
    `${file.name.replace(/\.[^.]+$/, "")}.jpg`,
    {
      type: "image/jpeg",
      lastModified: Date.now(),
    }
  );
}

export default function PublicPartnerForm({ id }: { id?: string }) {
  const router = useRouter();

  const [form, setForm] = useState<any>({
    name: "",
    slug: "",
    category: "",
    shortDescription: "",
    longDescription: "",
    logoUrl: "",
    coverImage: "",
    heroVideoUrl: "",
    heroVideoPoster: "",
    gallery: [],
    scenes360: [],
    websiteUrl: "",
    ctaLabel: "",
    ctaHref: "",
    isVisible: true,
    isFeatured: false,
    sortOrder: 0,
  });

  const [loading, setLoading] = useState(Boolean(id));
  const [saving, setSaving] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [uploading360, setUploading360] = useState(false);

  useEffect(() => {
    if (!id) return;

    fetch(`/api/admin/public/partners/${id}`)
      .then((r) => r.json())
      .then((data) =>
        setForm((current: any) => ({
          ...current,
          ...data,
          gallery: Array.isArray(data?.gallery) ? data.gallery : [],
          scenes360: Array.isArray(data?.scenes360) ? data.scenes360 : [],
          isVisible: Boolean(data?.isVisible),
          isFeatured: Boolean(data?.isFeatured),
          sortOrder: Number(data?.sortOrder ?? 0),
        }))
      )
      .finally(() => setLoading(false));
  }, [id]);

  function update(key: string, value: any) {
    setForm((p: any) => ({ ...p, [key]: value }));
  }

  async function uploadToR2(file: File, kind: string) {
    const uploadFile = await normalizeImage(file);
    const contentType = uploadFile.type || "application/octet-stream";

    const res = await fetch("/api/admin/upload/presign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileName: uploadFile.name,
        contentType,
        kind,
      }),
    });

    const data = await res.json();

    if (!res.ok || !data.uploadUrl || !data.url) {
      throw new Error(data.error || "No se pudo preparar la subida.");
    }

    const upload = await fetch(data.uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": contentType },
      body: uploadFile,
    });

    if (!upload.ok) {
      const message = await upload.text().catch(() => "");
      throw new Error(
        `Upload R2 falló: ${upload.status}. ${message.slice(0, 150)}`
      );
    }

    return {
      url: String(data.url),
      file: uploadFile,
    };
  }

  async function uploadHeroVideo(file: File) {
    setUploadingVideo(true);

    try {
      const { url } = await uploadToR2(file, "partner-hero-videos");
      update("heroVideoUrl", url);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Error subiendo video");
    } finally {
      setUploadingVideo(false);
    }
  }

  async function uploadGallery(files: FileList | File[]) {
    const selected = Array.from(files);
    if (!selected.length) return;

    setUploadingGallery(true);

    try {
      const urls: string[] = [];

      for (const file of selected) {
        const result = await uploadToR2(
          file,
          `partner-galleries/${form.slug || "partner"}`
        );
        urls.push(result.url);
      }

      setForm((prev: any) => ({
        ...prev,
        gallery: [...(Array.isArray(prev.gallery) ? prev.gallery : []), ...urls],
      }));
    } catch (error) {
      alert(
        error instanceof Error ? error.message : "Error subiendo fotografías"
      );
    } finally {
      setUploadingGallery(false);
    }
  }

  async function upload360(file: File) {
    setUploading360(true);

    try {
      const result = await uploadToR2(
        file,
        `partner-scenes360/${form.slug || "partner"}`
      );

      const baseId =
        sceneIdFromFileName(result.file.name) || `scene-${Date.now()}`;

      const scene: PartnerScene360 = {
        id: `${baseId}-${Date.now()}`,
        title: result.file.name.replace(/\.[^.]+$/, ""),
        image: result.url,
        thumbnail: result.url,
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
        error instanceof Error ? error.message : "Error subiendo panorama 360"
      );
    } finally {
      setUploading360(false);
    }
  }

  function moveGallery(index: number, direction: -1 | 1) {
    setForm((prev: any) => {
      const next = [...prev.gallery];
      const target = index + direction;

      if (target < 0 || target >= next.length) return prev;

      [next[index], next[target]] = [next[target], next[index]];

      return { ...prev, gallery: next };
    });
  }

  function removeGallery(index: number) {
    setForm((prev: any) => ({
      ...prev,
      gallery: prev.gallery.filter((_: string, i: number) => i !== index),
    }));
  }

  function removeScene(index: number) {
    setForm((prev: any) => ({
      ...prev,
      scenes360: prev.scenes360.filter((_: any, i: number) => i !== index),
    }));
  }

  async function save() {
    setSaving(true);

    const res = await fetch(
      id ? `/api/admin/public/partners/${id}` : "/api/admin/public/partners",
      {
        method: id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      }
    );

    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      alert(data?.error || "Error guardando");
      return;
    }

    if (!id && data?.id) {
      router.push(`/admin/public/partners/${data.id}`);
      router.refresh();
      return;
    }

    alert("Guardado");
    router.refresh();
  }

  if (loading) {
    return <div className="p-10 text-white">Loading...</div>;
  }

  return (
    <div className="max-w-5xl space-y-8 p-10 text-white">
      <h1 className="text-3xl font-light">
        {id ? "Edit Partner" : "New Partner"}
      </h1>

      <div className="grid gap-4">
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
          placeholder="Logo URL"
          value={form.logoUrl}
          onChange={(e) => update("logoUrl", e.target.value)}
        />

        <input
          className="w-full rounded-xl border border-white/20 bg-black p-3"
          placeholder="Cover image URL"
          value={form.coverImage}
          onChange={(e) => update("coverImage", e.target.value)}
        />
      </div>

      <section className="space-y-4 rounded-3xl border border-white/10 p-6">
        <div>
          <div className="text-lg">Hero video</div>
          <div className="mt-1 text-xs text-white/45">
            Video principal del Partner.
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
          placeholder="Hero video poster"
          value={form.heroVideoPoster}
          onChange={(e) => update("heroVideoPoster", e.target.value)}
        />

        <input
          type="file"
          accept="video/mp4,video/webm"
          disabled={uploadingVideo}
          onChange={async (e) => {
            const input = e.currentTarget;
            const file = input.files?.[0];
            if (file) await uploadHeroVideo(file);
            input.value = "";
          }}
          className="block w-full text-sm text-white/70"
        />

        {uploadingVideo ? (
          <div className="text-sm text-white/60">Subiendo video...</div>
        ) : null}

        {form.heroVideoUrl ? (
          <video
            src={form.heroVideoUrl}
            controls
            playsInline
            className="max-h-[420px] w-full rounded-2xl bg-black"
          />
        ) : null}
      </section>

      <section className="space-y-5 rounded-3xl border border-white/10 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-lg">Galería editorial</div>
            <div className="mt-1 text-xs text-white/45">
              El orden aquí será el orden de la página pública.
            </div>
          </div>

          <label className="cursor-pointer rounded-xl border border-white/20 px-5 py-3 text-sm hover:bg-white/10">
            <input
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              disabled={uploadingGallery}
              onChange={async (e) => {
                const input = e.currentTarget;
                if (input.files) await uploadGallery(input.files);
                input.value = "";
              }}
            />
            {uploadingGallery ? "Subiendo..." : "Subir fotografías"}
          </label>
        </div>

        {form.gallery.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {form.gallery.map((image: string, index: number) => (
              <div
                key={`${image}-${index}`}
                className="overflow-hidden rounded-2xl border border-white/10 bg-black"
              >
                <div
                  className="aspect-[16/10] bg-cover bg-center"
                  style={{ backgroundImage: `url("${image}")` }}
                />

                <div className="flex flex-wrap gap-2 p-3">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => moveGallery(index, -1)}
                    className="rounded-lg border border-white/15 px-3 py-2 text-xs disabled:opacity-25"
                  >
                    ←
                  </button>

                  <button
                    type="button"
                    disabled={index === form.gallery.length - 1}
                    onClick={() => moveGallery(index, 1)}
                    className="rounded-lg border border-white/15 px-3 py-2 text-xs disabled:opacity-25"
                  >
                    →
                  </button>

                  <button
                    type="button"
                    onClick={() => removeGallery(index)}
                    className="rounded-lg border border-red-400/20 px-3 py-2 text-xs text-red-200"
                  >
                    Eliminar
                  </button>

                  <span className="ml-auto self-center text-xs text-white/35">
                    Foto {index + 1}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-white/10 py-12 text-center text-sm text-white/35">
            Aún no hay fotografías cargadas.
          </div>
        )}
      </section>

      <section className="space-y-5 rounded-3xl border border-white/10 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-lg">Experiencia 360</div>
            <div className="mt-1 text-xs text-white/45">
              Sube panoramas equirectangulares.
            </div>
          </div>

          <label className="cursor-pointer rounded-xl border border-white/20 px-5 py-3 text-sm hover:bg-white/10">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              disabled={uploading360}
              onChange={async (e) => {
                const input = e.currentTarget;
                const file = input.files?.[0];
                if (file) await upload360(file);
                input.value = "";
              }}
            />
            {uploading360 ? "Subiendo..." : "Subir panorama 360"}
          </label>
        </div>

        {form.scenes360.length ? (
          <div className="space-y-6">
            {form.scenes360.map((scene: PartnerScene360, index: number) => (
              <div
                key={scene.id}
                className="rounded-2xl border border-white/10 bg-black/30 p-4"
              >
                <div className="mb-4 flex items-center justify-between gap-3">
                  <input
                    value={scene.title || ""}
                    onChange={(e) => {
                      const title = e.target.value;

                      setForm((prev: any) => ({
                        ...prev,
                        scenes360: prev.scenes360.map(
                          (item: PartnerScene360, i: number) =>
                            i === index ? { ...item, title } : item
                        ),
                      }));
                    }}
                    className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black px-3 py-2 text-sm"
                    placeholder="Título del panorama"
                  />

                  <button
                    type="button"
                    onClick={() => removeScene(index)}
                    className="rounded-xl border border-red-400/20 px-4 py-2 text-xs text-red-200"
                  >
                    Eliminar
                  </button>
                </div>

                <div className="h-[420px] overflow-hidden rounded-2xl border border-white/10">
                  <Viewer360
                    image={scene.image}
                    hotspots={[]}
                    initialYaw={scene.initialYaw ?? 0}
                    initialPitch={scene.initialPitch ?? 0}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-white/10 py-12 text-center text-sm text-white/35">
            Aún no hay panoramas 360.
          </div>
        )}
      </section>

      <div className="grid gap-4">
        <input
          className="w-full rounded-xl border border-white/20 bg-black p-3"
          placeholder="Website URL"
          value={form.websiteUrl}
          onChange={(e) => update("websiteUrl", e.target.value)}
        />

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
      </div>

      <div className="flex gap-4">
        <button
          onClick={save}
          disabled={saving}
          className="rounded-xl bg-white px-5 py-3 text-black disabled:opacity-50"
        >
          {saving ? "Guardando..." : "Guardar"}
        </button>

        <button
          onClick={() => router.push("/admin/public/partners")}
          className="rounded-xl border border-white/20 px-5 py-3"
        >
          Volver
        </button>
      </div>
    </div>
  );
}
