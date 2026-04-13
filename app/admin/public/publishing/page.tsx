"use client";
export const dynamic = "force-dynamic";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type DestinationItem = {
  id: string;
  name?: string;
  slug?: string;
  status?: string;
  isFeatured?: boolean;
};

type PartnerItem = {
  id: string;
  name?: string;
  slug?: string;
  isVisible?: boolean;
  isFeatured?: boolean;
};

type ExperienceItem = {
  id: string;
  name?: string;
  slug?: string;
  isVisible?: boolean;
  isFeatured?: boolean;
};

export default function PublicPublishingPage() {
  const [destinations, setDestinations] = useState<DestinationItem[]>([]);
  const [partners, setPartners] = useState<PartnerItem[]>([]);
  const [experiences, setExperiences] = useState<ExperienceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("");

  async function loadAll() {
    setLoading(true);
    setMessage("");

    const [dRes, pRes, eRes] = await Promise.all([
      fetch("/api/admin/public/destinations", { cache: "no-store" }),
      fetch("/api/admin/public/partners", { cache: "no-store" }),
      fetch("/api/admin/public/experiences", { cache: "no-store" }),
    ]);

    const [dData, pData, eData] = await Promise.all([
      dRes.json(),
      pRes.json(),
      eRes.json(),
    ]);

    setDestinations(Array.isArray(dData) ? dData : []);
    setPartners(Array.isArray(pData) ? pData : []);
    setExperiences(Array.isArray(eData) ? eData : []);
    setLoading(false);
  }

  useEffect(() => {
    loadAll();
  }, []);

  const counts = useMemo(() => {
    return {
      publishedDestinations: destinations.filter((item: any) => item.status === "published").length,
      visiblePartners: partners.filter((item: any) => item.isVisible).length,
      visibleExperiences: experiences.filter((item: any) => item.isVisible).length,
    };
  }, [destinations, partners, experiences]);

  async function updateDestinationStatus(id: string, status: string) {
    const key = `destination-status-${id}`;
    setBusyKey(key);
    setMessage("");

    const res = await fetch(`/api/admin/public/destinations/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (!res.ok) {
      setBusyKey(null);
      setMessage("No se pudo actualizar destination status");
      return;
    }

    setDestinations((prev) =>
      prev.map((item: any) => (item.id === id ? { ...item, status } : item))
    );
    setBusyKey(null);
    setMessage("Publishing actualizado");
  }

  async function updatePartner(id: string, patch: Partial<PartnerItem>) {
    const key = `partner-${id}`;
    setBusyKey(key);
    setMessage("");

    const res = await fetch(`/api/admin/public/partners/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });

    if (!res.ok) {
      setBusyKey(null);
      setMessage("No se pudo actualizar partner");
      return;
    }

    setPartners((prev) =>
      prev.map((item: any) => (item.id === id ? { ...item, ...patch } : item))
    );
    setBusyKey(null);
    setMessage("Partner actualizado");
  }

  async function updateExperience(id: string, patch: Partial<ExperienceItem>) {
    const key = `experience-${id}`;
    setBusyKey(key);
    setMessage("");

    const res = await fetch(`/api/admin/public/experiences/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });

    if (!res.ok) {
      setBusyKey(null);
      setMessage("No se pudo actualizar experience");
      return;
    }

    setExperiences((prev) =>
      prev.map((item: any) => (item.id === id ? { ...item, ...patch } : item))
    );
    setBusyKey(null);
    setMessage("Experience actualizado");
  }

  if (loading) {
    return <div className="p-10 text-white">Loading publishing dashboard...</div>;
  }

  return (
    <div className="min-h-screen bg-black p-10 text-white">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-[11px] uppercase tracking-[0.34em] text-white/40">
              Public CMS
            </div>
            <h1 className="mt-2 text-3xl font-light">Publishing</h1>
            <p className="mt-2 max-w-2xl text-sm text-white/60">
              Controla qué entra a la capa pública sin tocar el contenido editorial.
            </p>
          </div>

          <button
            type="button"
            onClick={loadAll}
            className="rounded-2xl border border-white/15 px-4 py-3 text-sm text-white transition hover:bg-white hover:text-black"
          >
            Recargar
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <div className="text-[11px] uppercase tracking-[0.26em] text-white/35">
              Destinations published
            </div>
            <div className="mt-2 text-3xl font-light text-white">
              {counts.publishedDestinations}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <div className="text-[11px] uppercase tracking-[0.26em] text-white/35">
              Partners visible
            </div>
            <div className="mt-2 text-3xl font-light text-white">
              {counts.visiblePartners}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <div className="text-[11px] uppercase tracking-[0.26em] text-white/35">
              Experiences visible
            </div>
            <div className="mt-2 text-3xl font-light text-white">
              {counts.visibleExperiences}
            </div>
          </div>
        </div>

        {message ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/75">
            {message}
          </div>
        ) : null}

        <section className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-light text-white">Destinations</h2>
              <p className="mt-1 text-sm text-white/50">
                Publicación basada en status.
              </p>
            </div>
            <Link href="/admin/public/destinations/new" className="rounded-2xl border border-white/15 px-4 py-3 text-sm text-white transition hover:bg-white hover:text-black">
              Nuevo destination
            </Link>
          </div>

          {destinations.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 p-6 text-sm text-white/50">
              No hay destinations todavía.
            </div>
          ) : (
            <div className="grid gap-4">
              {destinations.map((item: any) => {
                const busy = busyKey === `destination-status-${item.id}`;
                const title = item.name || item.slug || item.id;

                return (
                  <div
                    key={item.id}
                    className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-black/30 p-4 md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <div className="text-lg font-light text-white">{title}</div>
                      <div className="mt-1 text-xs uppercase tracking-[0.22em] text-white/35">
                        {item.slug || "sin-slug"}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <div className="text-sm text-white/55">Status actual: {item.status || "draft"}</div>

                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => updateDestinationStatus(item.id, "draft")}
                        className={`rounded-xl border px-4 py-2 text-sm transition ${
                          item.status === "draft"
                            ? "border-white bg-white text-black"
                            : "border-white/15 text-white hover:bg-white/10"
                        } ${busy ? "opacity-50" : ""}`}
                      >
                        Draft
                      </button>

                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => updateDestinationStatus(item.id, "published")}
                        className={`rounded-xl border px-4 py-2 text-sm transition ${
                          item.status === "published"
                            ? "border-white bg-white text-black"
                            : "border-white/15 text-white hover:bg-white/10"
                        } ${busy ? "opacity-50" : ""}`}
                      >
                        Published
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-light text-white">Partners</h2>
              <p className="mt-1 text-sm text-white/50">
                Control de visibilidad y destacado editorial.
              </p>
            </div>
            <Link href="/admin/public/partners/new" className="rounded-2xl border border-white/15 px-4 py-3 text-sm text-white transition hover:bg-white hover:text-black">
              Nuevo partner
            </Link>
          </div>

          {partners.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 p-6 text-sm text-white/50">
              No hay partners todavía.
            </div>
          ) : (
            <div className="grid gap-4">
              {partners.map((item: any) => {
                const busy = busyKey === `partner-${item.id}`;
                const title = item.name || item.slug || item.id;

                return (
                  <div
                    key={item.id}
                    className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-black/30 p-4 md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <div className="text-lg font-light text-white">{title}</div>
                      <div className="mt-1 text-xs uppercase tracking-[0.22em] text-white/35">
                        {item.slug || "sin-slug"}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-5">
                      <label className="flex items-center gap-2 text-sm text-white/70">
                        <input
                          type="checkbox"
                          checked={item.isVisible === true}
                          disabled={busy}
                          onChange={(e) => updatePartner(item.id, { isVisible: e.target.checked })}
                        />
                        Visible
                      </label>

                      <label className="flex items-center gap-2 text-sm text-white/70">
                        <input
                          type="checkbox"
                          checked={item.isFeatured === true}
                          disabled={busy}
                          onChange={(e) => updatePartner(item.id, { isFeatured: e.target.checked })}
                        />
                        Featured
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-light text-white">Experiences</h2>
              <p className="mt-1 text-sm text-white/50">
                Control de visibilidad y destacado editorial.
              </p>
            </div>
            <Link href="/admin/public/experiences/new" className="rounded-2xl border border-white/15 px-4 py-3 text-sm text-white transition hover:bg-white hover:text-black">
              Nueva experience
            </Link>
          </div>

          {experiences.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 p-6 text-sm text-white/50">
              No hay experiences todavía.
            </div>
          ) : (
            <div className="grid gap-4">
              {experiences.map((item: any) => {
                const busy = busyKey === `experience-${item.id}`;
                const title = item.name || item.slug || item.id;

                return (
                  <div
                    key={item.id}
                    className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-black/30 p-4 md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <div className="text-lg font-light text-white">{title}</div>
                      <div className="mt-1 text-xs uppercase tracking-[0.22em] text-white/35">
                        {item.slug || "sin-slug"}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-5">
                      <label className="flex items-center gap-2 text-sm text-white/70">
                        <input
                          type="checkbox"
                          checked={item.isVisible === true}
                          disabled={busy}
                          onChange={(e) => updateExperience(item.id, { isVisible: e.target.checked })}
                        />
                        Visible
                      </label>

                      <label className="flex items-center gap-2 text-sm text-white/70">
                        <input
                          type="checkbox"
                          checked={item.isFeatured === true}
                          disabled={busy}
                          onChange={(e) => updateExperience(item.id, { isFeatured: e.target.checked })}
                        />
                        Featured
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
