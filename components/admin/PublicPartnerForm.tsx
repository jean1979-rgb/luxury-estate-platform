"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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
    websiteUrl: "",
    ctaLabel: "",
    ctaHref: "",
    isVisible: true,
    isFeatured: false,
    sortOrder: 0,
  });

  const [loading, setLoading] = useState(Boolean(id));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;

    fetch(`/api/admin/public/partners/${id}`)
      .then((r) => r.json())
      .then((data) =>
        setForm({
          ...form,
          ...data,
          isVisible: Boolean(data?.isVisible),
          isFeatured: Boolean(data?.isFeatured),
          sortOrder: Number(data?.sortOrder ?? 0),
        })
      )
      .finally(() => setLoading(false));
  }, [id]);

  function update(key: string, value: any) {
    setForm((p: any) => ({ ...p, [key]: value }));
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

  if (loading) return <div className="p-10 text-white">Loading...</div>;

  return (
    <div className="p-10 text-white max-w-3xl space-y-6">
      <h1 className="text-3xl font-light">{id ? "Edit Partner" : "New Partner"}</h1>

      <input className="w-full p-3 bg-black border border-white/20 rounded-xl" placeholder="Name" value={form.name} onChange={(e) => update("name", e.target.value)} />
      <input className="w-full p-3 bg-black border border-white/20 rounded-xl" placeholder="Slug" value={form.slug} onChange={(e) => update("slug", e.target.value)} />
      <input className="w-full p-3 bg-black border border-white/20 rounded-xl" placeholder="Category" value={form.category} onChange={(e) => update("category", e.target.value)} />
      <input className="w-full p-3 bg-black border border-white/20 rounded-xl" placeholder="Short description" value={form.shortDescription} onChange={(e) => update("shortDescription", e.target.value)} />
      <textarea className="w-full p-3 bg-black border border-white/20 rounded-xl min-h-28" placeholder="Long description" value={form.longDescription} onChange={(e) => update("longDescription", e.target.value)} />
      <input className="w-full p-3 bg-black border border-white/20 rounded-xl" placeholder="Logo URL" value={form.logoUrl} onChange={(e) => update("logoUrl", e.target.value)} />
      <input className="w-full p-3 bg-black border border-white/20 rounded-xl" placeholder="Cover image URL" value={form.coverImage} onChange={(e) => update("coverImage", e.target.value)} />
      <input className="w-full p-3 bg-black border border-white/20 rounded-xl" placeholder="Website URL" value={form.websiteUrl} onChange={(e) => update("websiteUrl", e.target.value)} />
      <input className="w-full p-3 bg-black border border-white/20 rounded-xl" placeholder="CTA label" value={form.ctaLabel} onChange={(e) => update("ctaLabel", e.target.value)} />
      <input className="w-full p-3 bg-black border border-white/20 rounded-xl" placeholder="CTA href" value={form.ctaHref} onChange={(e) => update("ctaHref", e.target.value)} />
      <input type="number" className="w-full p-3 bg-black border border-white/20 rounded-xl" placeholder="Sort order" value={form.sortOrder} onChange={(e) => update("sortOrder", Number(e.target.value))} />

      <label className="flex items-center gap-3 text-sm text-white/80">
        <input type="checkbox" checked={form.isVisible} onChange={(e) => update("isVisible", e.target.checked)} />
        Visible
      </label>

      <label className="flex items-center gap-3 text-sm text-white/80">
        <input type="checkbox" checked={form.isFeatured} onChange={(e) => update("isFeatured", e.target.checked)} />
        Featured
      </label>

      <div className="flex gap-4">
        <button onClick={save} className="bg-white text-black px-5 py-3 rounded-xl">
          {saving ? "Guardando..." : "Guardar"}
        </button>

        <button onClick={() => router.push("/admin/public/partners")} className="border border-white/20 px-5 py-3 rounded-xl">
          Volver
        </button>
      </div>
    </div>
  );
}
