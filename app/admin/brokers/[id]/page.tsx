"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type BrokerResponse = {
  id: string;
  name: string | null;
  email: string;
  role: "BROKER" | "ADMIN";
  status: "ACTIVE" | "PENDING" | "SUSPENDED";
  brokerProfile: {
    businessName: string;
    slug: string;
    city: string;
    approved: boolean;
    canPublish: boolean;
    tokkoEnabled: boolean;
    tokkoApiKey: string | null;
  } | null;
};

export default function AdminBrokerDetailPage() {
  const params = useParams<{ id: string }>();
  const id = typeof params?.id === "string" ? params.id : "";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"BROKER" | "ADMIN">("BROKER");

  const [status, setStatus] = useState<"ACTIVE" | "PENDING" | "SUSPENDED">("PENDING");
  const [businessName, setBusinessName] = useState("");
  const [slug, setSlug] = useState("");
  const [city, setCity] = useState("");
  const [approved, setApproved] = useState(false);
  const [canPublish, setCanPublish] = useState(false);
  const [tokkoEnabled, setTokkoEnabled] = useState(false);
  const [tokkoApiKey, setTokkoApiKey] = useState("");

  async function load() {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      const res = await fetch(`/api/admin/brokers/${id}`, {
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error("No se pudo cargar broker");
      }

      const data: BrokerResponse = await res.json();

      setName(data.name ?? "");
      setEmail(data.email);
      setRole(data.role);
      setStatus(data.status);
      setBusinessName(data.brokerProfile?.businessName ?? "");
      setSlug(data.brokerProfile?.slug ?? "");
      setCity(data.brokerProfile?.city ?? "");
      setApproved(Boolean(data.brokerProfile?.approved));
      setCanPublish(Boolean(data.brokerProfile?.canPublish));
      setTokkoEnabled(Boolean(data.brokerProfile?.tokkoEnabled));
      setTokkoApiKey(data.brokerProfile?.tokkoApiKey ?? "");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error cargando broker");
    } finally {
      setLoading(false);
    }
  }

  async function save() {
    try {
      setSaving(true);
      setError("");
      setMessage("");

      const res = await fetch(`/api/admin/brokers/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
          businessName: businessName.trim() || null,
          slug: slug.trim() || null,
          city: city.trim() || null,
          approved,
          canPublish,
          tokkoEnabled,
          tokkoApiKey: tokkoApiKey.trim() || null,
        }),
      });

      if (!res.ok) {
        throw new Error("No se pudo guardar broker");
      }

      await res.json();
      setMessage("Broker actualizado");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error guardando broker");
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    if (!id) return;
    load();
  }, [id]);

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-white/40">
              Admin
            </p>
            <h1 className="mt-2 text-3xl font-light tracking-[0.08em]">
              Broker
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-white/55">
              Control operativo de publicación, estatus y Tokko.
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/admin/brokers"
              className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white transition hover:bg-white/[0.08]"
            >
              Volver a brokers
            </Link>
            <button
              type="button"
              onClick={save}
              disabled={saving || loading}
              className="rounded-2xl border border-white/10 bg-white px-4 py-3 text-sm text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-sm text-white/60">
            Cargando broker...
          </div>
        ) : (
          <div className="space-y-6">
            {error ? (
              <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            ) : null}

            {message ? (
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                {message}
              </div>
            ) : null}

            <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
              <h2 className="text-lg font-medium text-white">Identidad</h2>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-[11px] uppercase tracking-[0.24em] text-white/35">
                    Nombre
                  </span>
                  <input
                    value={name}
                    readOnly
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/70 outline-none"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-[11px] uppercase tracking-[0.24em] text-white/35">
                    Email
                  </span>
                  <input
                    value={email}
                    readOnly
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/70 outline-none"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-[11px] uppercase tracking-[0.24em] text-white/35">
                    Role
                  </span>
                  <input
                    value={role}
                    readOnly
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/70 outline-none"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-[11px] uppercase tracking-[0.24em] text-white/35">
                    Status
                  </span>
                  <select
                    value={status}
                    onChange={(e) =>
                      setStatus(e.target.value as "ACTIVE" | "PENDING" | "SUSPENDED")
                    }
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="SUSPENDED">SUSPENDED</option>
                  </select>
                </label>
              </div>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
              <h2 className="text-lg font-medium text-white">Broker profile</h2>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <label className="space-y-2">
                  <span className="text-[11px] uppercase tracking-[0.24em] text-white/35">
                    Business name
                  </span>
                  <input
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-white/25"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-[11px] uppercase tracking-[0.24em] text-white/35">
                    Slug
                  </span>
                  <input
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-white/25"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-[11px] uppercase tracking-[0.24em] text-white/35">
                    City
                  </span>
                  <input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-white/25"
                  />
                </label>
              </div>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
              <h2 className="text-lg font-medium text-white">Permisos</h2>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <button
                  type="button"
                  onClick={() => setApproved((v) => !v)}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left transition hover:bg-white/[0.08]"
                >
                  <div className="text-[11px] uppercase tracking-[0.24em] text-white/35">
                    Approved
                  </div>
                  <div className="mt-2 text-base text-white">
                    {approved ? "Sí" : "No"}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setCanPublish((v) => !v)}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left transition hover:bg-white/[0.08]"
                >
                  <div className="text-[11px] uppercase tracking-[0.24em] text-white/35">
                    Can publish
                  </div>
                  <div className="mt-2 text-base text-white">
                    {canPublish ? "Sí" : "No"}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setTokkoEnabled((v) => !v)}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left transition hover:bg-white/[0.08]"
                >
                  <div className="text-[11px] uppercase tracking-[0.24em] text-white/35">
                    Tokko enabled
                  </div>
                  <div className="mt-2 text-base text-white">
                    {tokkoEnabled ? "Activo" : "Off"}
                  </div>
                </button>
              </div>

              <div className="mt-6">
                <label className="space-y-2">
                  <span className="text-[11px] uppercase tracking-[0.24em] text-white/35">
                    Tokko API key
                  </span>
                  <input
                    value={tokkoApiKey}
                    onChange={(e) => setTokkoApiKey(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-white/25"
                  />
                </label>
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
