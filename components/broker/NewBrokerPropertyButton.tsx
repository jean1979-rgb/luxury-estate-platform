"use client";

import { useState } from "react";

function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export default function NewBrokerPropertyButton() {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (loading) return;
    setLoading(true);

    const now = Date.now();
    const id = `broker-${now}`;
    const title = "Nueva propiedad";
    const slug = `${slugify(title)}-${now}`;

    const payload = {
      id,
      title,
      slug,
      propertyType: "villa",
      location: "",
      price: "",
      currency: "MXN",
      bedrooms: 0,
      bathrooms: 0,
      areaInterior: "",
      areaTotal: "",
      tagline: "",
      description: "",
      coverImage: "",
      gallery: [],
      videoUrl: "",
      videoPoster: "",
      videoType: "upload",
      scenes360: [],
      source: { provider: "manual" },
      featured: false,
      published: false,
      luxuryScore: 85,
    };

    try {
      const res = await fetch("/api/broker/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data?.ok || !data?.property?.id) {
        throw new Error(data?.message || "No se pudo crear la propiedad.");
      }

      window.location.href = `/broker/properties/${data.property.id}/studio`;
    } catch (error) {
      alert(error instanceof Error ? error.message : "No se pudo crear la propiedad.");
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="inline-flex min-h-11 items-center justify-center border border-white/20 px-4 py-2 text-xs uppercase tracking-[0.22em] text-white transition hover:bg-white hover:text-black disabled:opacity-60"
    >
      {loading ? "Creando..." : "Nueva propiedad"}
    </button>
  );
}
