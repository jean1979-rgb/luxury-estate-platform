"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

type FormState = {
  heroEyebrow: string;
  heroTitle: string;
  heroSubtitle: string;
  heroPrimaryCtaLabel: string;
  heroPrimaryCtaHref: string;
  heroSecondaryCtaLabel: string;
  heroSecondaryCtaHref: string;
  heroBackgroundImage: string;
  destinationsTitle: string;
  destinationsSubtitle: string;
  partnersTitle: string;
  partnersSubtitle: string;
  experiencesTitle: string;
  experiencesSubtitle: string;
};

const EMPTY_FORM: FormState = {
  heroEyebrow: "",
  heroTitle: "",
  heroSubtitle: "",
  heroPrimaryCtaLabel: "",
  heroPrimaryCtaHref: "",
  heroSecondaryCtaLabel: "",
  heroSecondaryCtaHref: "",
  heroBackgroundImage: "",
  destinationsTitle: "",
  destinationsSubtitle: "",
  partnersTitle: "",
  partnersSubtitle: "",
  experiencesTitle: "",
  experiencesSubtitle: "",
};

export default function PublicHomeEditor() {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/public/home")
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setForm({
            ...EMPTY_FORM,
            ...data,
          });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);

    await fetch("/api/admin/public/home", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setSaving(false);
    alert("Guardado");
  }

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  if (loading) {
    return <div className="p-10 text-white">Loading...</div>;
  }

  return (
    <div className="p-10 text-white max-w-4xl space-y-8">
      <h1 className="text-3xl font-light">Home Editor</h1>

      <section className="space-y-4 border border-white/10 rounded-2xl p-6">
        <h2 className="text-xl font-light">Hero</h2>

        <input className="w-full p-3 bg-black border border-white/20 rounded-xl" placeholder="Hero eyebrow" value={form.heroEyebrow} onChange={(e) => update("heroEyebrow", e.target.value)} />
        <input className="w-full p-3 bg-black border border-white/20 rounded-xl" placeholder="Hero title" value={form.heroTitle} onChange={(e) => update("heroTitle", e.target.value)} />
        <textarea className="w-full p-3 bg-black border border-white/20 rounded-xl min-h-28" placeholder="Hero subtitle" value={form.heroSubtitle} onChange={(e) => update("heroSubtitle", e.target.value)} />
        <input className="w-full p-3 bg-black border border-white/20 rounded-xl" placeholder="Primary CTA label" value={form.heroPrimaryCtaLabel} onChange={(e) => update("heroPrimaryCtaLabel", e.target.value)} />
        <input className="w-full p-3 bg-black border border-white/20 rounded-xl" placeholder="Primary CTA href" value={form.heroPrimaryCtaHref} onChange={(e) => update("heroPrimaryCtaHref", e.target.value)} />
        <input className="w-full p-3 bg-black border border-white/20 rounded-xl" placeholder="Secondary CTA label" value={form.heroSecondaryCtaLabel} onChange={(e) => update("heroSecondaryCtaLabel", e.target.value)} />
        <input className="w-full p-3 bg-black border border-white/20 rounded-xl" placeholder="Secondary CTA href" value={form.heroSecondaryCtaHref} onChange={(e) => update("heroSecondaryCtaHref", e.target.value)} />
        <input className="w-full p-3 bg-black border border-white/20 rounded-xl" placeholder="Background image URL" value={form.heroBackgroundImage} onChange={(e) => update("heroBackgroundImage", e.target.value)} />
      </section>

      <section className="space-y-4 border border-white/10 rounded-2xl p-6">
        <h2 className="text-xl font-light">Destinations Section</h2>

        <input className="w-full p-3 bg-black border border-white/20 rounded-xl" placeholder="Destinations title" value={form.destinationsTitle} onChange={(e) => update("destinationsTitle", e.target.value)} />
        <textarea className="w-full p-3 bg-black border border-white/20 rounded-xl min-h-28" placeholder="Destinations subtitle" value={form.destinationsSubtitle} onChange={(e) => update("destinationsSubtitle", e.target.value)} />
      </section>

      <section className="space-y-4 border border-white/10 rounded-2xl p-6">
        <h2 className="text-xl font-light">Partners Section</h2>

        <input className="w-full p-3 bg-black border border-white/20 rounded-xl" placeholder="Partners title" value={form.partnersTitle} onChange={(e) => update("partnersTitle", e.target.value)} />
        <textarea className="w-full p-3 bg-black border border-white/20 rounded-xl min-h-28" placeholder="Partners subtitle" value={form.partnersSubtitle} onChange={(e) => update("partnersSubtitle", e.target.value)} />
      </section>

      <section className="space-y-4 border border-white/10 rounded-2xl p-6">
        <h2 className="text-xl font-light">Experiences Section</h2>

        <input className="w-full p-3 bg-black border border-white/20 rounded-xl" placeholder="Experiences title" value={form.experiencesTitle} onChange={(e) => update("experiencesTitle", e.target.value)} />
        <textarea className="w-full p-3 bg-black border border-white/20 rounded-xl min-h-28" placeholder="Experiences subtitle" value={form.experiencesSubtitle} onChange={(e) => update("experiencesSubtitle", e.target.value)} />
      </section>

      <button onClick={handleSave} className="bg-white text-black px-5 py-3 rounded-xl">
        {saving ? "Guardando..." : "Guardar"}
      </button>
    </div>
  );
}
