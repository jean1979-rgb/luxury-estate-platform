"use client";

import { useMemo, useState } from "react";

type BrokerPropertyFormData = {
  id?: string;
  title?: string | null;
  tagline?: string | null;
  description?: string | null;
  propertyType?: string | null;
  location?: string | null;
  price?: string | null;
  currency?: string | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  areaInterior?: number | null;
  areaTotal?: number | null;
  coverImage?: string | null;
  featured?: boolean | null;
  published?: boolean | null;
  sourceProvider?: string | null;
};

export default function BrokerPropertyForm({
  mode = "create",
  initialData,
}: {
  mode?: "create" | "edit";
  initialData?: BrokerPropertyFormData;
}) {
  const isTokko = initialData?.sourceProvider === "TOKKO";

  const initialForm = useMemo(
    () => ({
      title: initialData?.title ?? "",
      tagline: initialData?.tagline ?? "",
      description: initialData?.description ?? "",
      propertyType: initialData?.propertyType ?? "",
      location: initialData?.location ?? "",
      price: initialData?.price ?? "",
      currency: initialData?.currency ?? "MXN",
      bedrooms:
        initialData?.bedrooms === null || initialData?.bedrooms === undefined
          ? ""
          : String(initialData.bedrooms),
      bathrooms:
        initialData?.bathrooms === null || initialData?.bathrooms === undefined
          ? ""
          : String(initialData.bathrooms),
      areaInterior:
        initialData?.areaInterior === null || initialData?.areaInterior === undefined
          ? ""
          : String(initialData.areaInterior),
      areaTotal:
        initialData?.areaTotal === null || initialData?.areaTotal === undefined
          ? ""
          : String(initialData.areaTotal),
      coverImage: initialData?.coverImage ?? "",
      featured: initialData?.featured === true,
      published: initialData?.published === true,
    }),
    [initialData]
  );

  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const isEdit = mode === "edit" && initialData?.id;
      const res = await fetch(
        isEdit ? `/api/broker/properties/${initialData.id}` : "/api/broker/properties",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );

      const data = await res.json();

      if (!res.ok || !data?.ok) {
        setMessage(data?.message || "No se pudo guardar la propiedad.");
        setSaving(false);
        return;
      }

      window.location.href = "/broker/properties";
    } catch {
      setMessage("Ocurrió un error al guardar.");
      setSaving(false);
      return;
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      {isTokko ? (
        <div className="border border-sky-400/20 bg-sky-400/10 px-4 py-3 text-sm text-sky-100">
          Esta propiedad está sincronizada desde Tokko. Algunos campos informativos son de solo lectura.
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <input
          value={form.title}
          onChange={(e) => update("title", e.target.value)}
          placeholder="Título"
          className="w-full border border-white/15 bg-black/30 px-4 py-3 text-white"
          required
        />

        <input
          value={form.tagline}
          onChange={(e) => update("tagline", e.target.value)}
          placeholder="Tagline"
          className="w-full border border-white/15 bg-black/30 px-4 py-3 text-white"
        />

        <input
          value={form.propertyType}
          onChange={(e) => update("propertyType", e.target.value)}
          placeholder="Tipo de propiedad"
          className="w-full border border-white/15 bg-black/30 px-4 py-3 text-white disabled:cursor-not-allowed disabled:opacity-60"
          readOnly={isTokko}
          disabled={isTokko}
        />

        <input
          value={form.location}
          onChange={(e) => update("location", e.target.value)}
          placeholder="Ubicación"
          className="w-full border border-white/15 bg-black/30 px-4 py-3 text-white disabled:cursor-not-allowed disabled:opacity-60"
          readOnly={isTokko}
          disabled={isTokko}
        />

        <input
          value={form.price}
          onChange={(e) => update("price", e.target.value)}
          placeholder="Precio"
          className="w-full border border-white/15 bg-black/30 px-4 py-3 text-white disabled:cursor-not-allowed disabled:opacity-60"
          readOnly={isTokko}
          disabled={isTokko}
        />

        <input
          value={form.currency}
          onChange={(e) => update("currency", e.target.value)}
          placeholder="Moneda"
          className="w-full border border-white/15 bg-black/30 px-4 py-3 text-white"
        />

        <input
          value={form.bedrooms}
          onChange={(e) => update("bedrooms", e.target.value)}
          placeholder="Recámaras"
          className="w-full border border-white/15 bg-black/30 px-4 py-3 text-white disabled:cursor-not-allowed disabled:opacity-60"
          readOnly={isTokko}
          disabled={isTokko}
        />

        <input
          value={form.bathrooms}
          onChange={(e) => update("bathrooms", e.target.value)}
          placeholder="Baños"
          className="w-full border border-white/15 bg-black/30 px-4 py-3 text-white disabled:cursor-not-allowed disabled:opacity-60"
          readOnly={isTokko}
          disabled={isTokko}
        />

        <input
          value={form.areaInterior}
          onChange={(e) => update("areaInterior", e.target.value)}
          placeholder="Área interior"
          className="w-full border border-white/15 bg-black/30 px-4 py-3 text-white"
        />

        <input
          value={form.areaTotal}
          onChange={(e) => update("areaTotal", e.target.value)}
          placeholder="Área total"
          className="w-full border border-white/15 bg-black/30 px-4 py-3 text-white"
        />

        <input
          value={form.coverImage}
          onChange={(e) => update("coverImage", e.target.value)}
          placeholder="URL imagen portada"
          className="w-full border border-white/15 bg-black/30 px-4 py-3 text-white md:col-span-2"
        />
      </div>

      <textarea
        value={form.description}
        onChange={(e) => update("description", e.target.value)}
        placeholder="Descripción"
        className="min-h-40 w-full border border-white/15 bg-black/30 px-4 py-3 text-white"
      />

      <div className="flex flex-wrap gap-6 text-sm text-white/80">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(e) => update("featured", e.target.checked)}
          />
          Destacada
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.published}
            onChange={(e) => update("published", e.target.checked)}
          />
          Publicar
        </label>
      </div>

      {message ? (
        <div className="border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {message}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={saving}
        className="inline-flex min-h-12 items-center justify-center border border-white/20 bg-white px-4 py-3 text-xs uppercase tracking-[0.24em] text-black disabled:opacity-60"
      >
        {saving
          ? "Guardando..."
          : mode === "edit"
            ? "Guardar cambios"
            : "Guardar propiedad"}
      </button>
    </form>
  );
}
