"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  id?: string;
};

type FormState = {
  name: string;
  slug: string;
  status: string;
  isFeatured: boolean;
  sortOrder: number;
  heroEyebrow: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  overviewTitle: string;
  overviewBody: string;
  thesisTitle: string;
  thesisBody: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
  seoTitle: string;
  seoDescription: string;
  ogImage: string;
};

const EMPTY_FORM: FormState = {
  name: "",
  slug: "",
  status: "coming_soon",
  isFeatured: false,
  sortOrder: 0,
  heroEyebrow: "",
  heroTitle: "",
  heroSubtitle: "",
  heroImage: "",
  overviewTitle: "",
  overviewBody: "",
  thesisTitle: "",
  thesisBody: "",
  primaryCtaLabel: "",
  primaryCtaHref: "",
  secondaryCtaLabel: "",
  secondaryCtaHref: "",
  seoTitle: "",
  seoDescription: "",
  ogImage: "",
};

export default function PublicDestinationForm({ id }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [loading, setLoading] = useState(Boolean(id));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;

    fetch(`/api/admin/public/destinations/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setForm({
          ...EMPTY_FORM,
          ...data,
          sortOrder: Number(data?.sortOrder ?? 0),
          isFeatured: Boolean(data?.isFeatured),
        });
      })
      .finally(() => setLoading(false));
  }, [id]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);

    const res = await fetch(
      id ? `/api/admin/public/destinations/${id}` : "/api/admin/public/destinations",
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
      router.push(`/admin/public/destinations/${data.id}`);
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
    <div className="p-10 text-white max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-light">
          {id ? "Edit Destination" : "New Destination"}
        </h1>
      </div>

      <section className="space-y-4 border border-white/10 rounded-2xl p-6">
        <h2 className="text-xl font-light">Base</h2>

        <input className="w-full p-3 bg-black border border-white/20 rounded-xl" placeholder="Name" value={form.name} onChange={(e) => update("name", e.target.value)} />
        <input className="w-full p-3 bg-black border border-white/20 rounded-xl" placeholder="Slug" value={form.slug} onChange={(e) => update("slug", e.target.value)} />

        <select className="w-full p-3 bg-black border border-white/20 rounded-xl" value={form.status} onChange={(e) => update("status", e.target.value)}>
          <option value="live">live</option>
          <option value="coming_soon">coming_soon</option>
          <option value="hidden">hidden</option>
        </select>

        <input type="number" className="w-full p-3 bg-black border border-white/20 rounded-xl" placeholder="Sort order" value={form.sortOrder} onChange={(e) => update("sortOrder", Number(e.target.value))} />

        <label className="flex items-center gap-3 text-sm text-white/80">
          <input type="checkbox" checked={form.isFeatured} onChange={(e) => update("isFeatured", e.target.checked)} />
          Featured destination
        </label>
      </section>

      <section className="space-y-4 border border-white/10 rounded-2xl p-6">
        <h2 className="text-xl font-light">Hero</h2>

        <input className="w-full p-3 bg-black border border-white/20 rounded-xl" placeholder="Hero eyebrow" value={form.heroEyebrow} onChange={(e) => update("heroEyebrow", e.target.value)} />
        <input className="w-full p-3 bg-black border border-white/20 rounded-xl" placeholder="Hero title" value={form.heroTitle} onChange={(e) => update("heroTitle", e.target.value)} />
        <textarea className="w-full p-3 bg-black border border-white/20 rounded-xl min-h-28" placeholder="Hero subtitle" value={form.heroSubtitle} onChange={(e) => update("heroSubtitle", e.target.value)} />
        <input className="w-full p-3 bg-black border border-white/20 rounded-xl" placeholder="Hero image URL" value={form.heroImage} onChange={(e) => update("heroImage", e.target.value)} />
      </section>

      <section className="space-y-4 border border-white/10 rounded-2xl p-6">
        <h2 className="text-xl font-light">Overview</h2>

        <input className="w-full p-3 bg-black border border-white/20 rounded-xl" placeholder="Overview title" value={form.overviewTitle} onChange={(e) => update("overviewTitle", e.target.value)} />
        <textarea className="w-full p-3 bg-black border border-white/20 rounded-xl min-h-32" placeholder="Overview body" value={form.overviewBody} onChange={(e) => update("overviewBody", e.target.value)} />
      </section>

      <section className="space-y-4 border border-white/10 rounded-2xl p-6">
        <h2 className="text-xl font-light">Thesis</h2>

        <input className="w-full p-3 bg-black border border-white/20 rounded-xl" placeholder="Thesis title" value={form.thesisTitle} onChange={(e) => update("thesisTitle", e.target.value)} />
        <textarea className="w-full p-3 bg-black border border-white/20 rounded-xl min-h-32" placeholder="Thesis body" value={form.thesisBody} onChange={(e) => update("thesisBody", e.target.value)} />
      </section>

      <section className="space-y-4 border border-white/10 rounded-2xl p-6">
        <h2 className="text-xl font-light">CTAs</h2>

        <input className="w-full p-3 bg-black border border-white/20 rounded-xl" placeholder="Primary CTA label" value={form.primaryCtaLabel} onChange={(e) => update("primaryCtaLabel", e.target.value)} />
        <input className="w-full p-3 bg-black border border-white/20 rounded-xl" placeholder="Primary CTA href" value={form.primaryCtaHref} onChange={(e) => update("primaryCtaHref", e.target.value)} />
        <input className="w-full p-3 bg-black border border-white/20 rounded-xl" placeholder="Secondary CTA label" value={form.secondaryCtaLabel} onChange={(e) => update("secondaryCtaLabel", e.target.value)} />
        <input className="w-full p-3 bg-black border border-white/20 rounded-xl" placeholder="Secondary CTA href" value={form.secondaryCtaHref} onChange={(e) => update("secondaryCtaHref", e.target.value)} />
      </section>

      <section className="space-y-4 border border-white/10 rounded-2xl p-6">
        <h2 className="text-xl font-light">SEO</h2>

        <input className="w-full p-3 bg-black border border-white/20 rounded-xl" placeholder="SEO title" value={form.seoTitle} onChange={(e) => update("seoTitle", e.target.value)} />
        <textarea className="w-full p-3 bg-black border border-white/20 rounded-xl min-h-28" placeholder="SEO description" value={form.seoDescription} onChange={(e) => update("seoDescription", e.target.value)} />
        <input className="w-full p-3 bg-black border border-white/20 rounded-xl" placeholder="OG image URL" value={form.ogImage} onChange={(e) => update("ogImage", e.target.value)} />
      </section>

      <div className="flex gap-4">
        <button onClick={handleSave} className="bg-white text-black px-5 py-3 rounded-xl">
          {saving ? "Guardando..." : "Guardar"}
        </button>

        <button onClick={() => router.push("/admin/public/destinations")} className="border border-white/20 px-5 py-3 rounded-xl">
          Volver
        </button>
      </div>
    </div>
  );
}
