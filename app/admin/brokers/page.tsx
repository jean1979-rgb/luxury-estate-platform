"use client";
export const dynamic = "force-dynamic";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type BrokerRow = {
  id: string;
  name: string | null;
  email: string;
  emailVerified?: string | null;
  role: "BROKER" | "ADMIN";
  status: "ACTIVE" | "PENDING" | "SUSPENDED";
  propertyCount?: number;
  brokerProfile: {
    approved: boolean;
    canPublish: boolean;
    tokkoEnabled: boolean;
    businessName?: string | null;
    city?: string | null;
    slug?: string | null;
  } | null;
};

type StatusFilter = "ALL" | "ACTIVE" | "PENDING" | "SUSPENDED";

function Badge({
  label,
  tone = "neutral",
}: {
  label: string;
  tone?: "neutral" | "green" | "yellow" | "red" | "blue";
}) {
  const toneClass =
    tone === "green"
      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-200"
      : tone === "yellow"
        ? "border-amber-500/20 bg-amber-500/10 text-amber-200"
        : tone === "red"
          ? "border-red-500/20 bg-red-500/10 text-red-200"
          : tone === "blue"
            ? "border-sky-500/20 bg-sky-500/10 text-sky-200"
            : "border-white/10 bg-white/[0.05] text-white/70";

  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] uppercase tracking-[0.18em] ${toneClass}`}>
      {label}
    </span>
  );
}


export default function AdminBrokersPage() {
  const [items, setItems] = useState<BrokerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");

  async function load() {
    try {
      setLoading(true);
      setError("");
      const res = await fetch("/api/admin/brokers", { cache: "no-store" });
      if (!res.ok) throw new Error("No se pudo cargar brokers");
      const data = await res.json();
      setItems(Array.isArray(data) ? data : Array.isArray(data.items) ? data.items : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error cargando brokers");
    } finally {
      setLoading(false);
    }
  }

  
  const deleteBroker = async (id: string) => {
    if (!confirm("¿Eliminar broker? Esto borra TODO.")) return;

    await fetch(`/api/admin/brokers/${id}`, {
      method: "DELETE",
    });

    window.location.reload();
  };

  useEffect(() => {
    load();
  }, []);

  async function toggle(id: string, field: "approved" | "canPublish" | "tokkoEnabled", value: boolean) {
    try {
      setError("");
      const res = await fetch(`/api/admin/brokers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });

      if (!res.ok) {
        throw new Error("No se pudo actualizar el permiso.");
      }

      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error actualizando permiso");
    }
  }

  const metrics = useMemo(() => {
    const total = items.length;
    const active = items.filter((item: any) => item.status === "ACTIVE").length;
    const pending = items.filter((item: any) => item.status === "PENDING").length;
    const publishEnabled = items.filter((item: any) => item.brokerProfile?.canPublish).length;
    const tokkoEnabled = items.filter((item: any) => item.brokerProfile?.tokkoEnabled).length;
    const properties = items.reduce((sum: any, item: any) => sum + (item.propertyCount ?? 0), 0);

    return { total, active, pending, publishEnabled, tokkoEnabled, properties };
  }, [items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return items.filter((item: any) => {
      const matchesQuery =
        !q ||
        [
          item.name ?? "",
          item.email,
          item.role,
          item.status,
          item.brokerProfile?.businessName ?? "",
          item.brokerProfile?.city ?? "",
          item.brokerProfile?.slug ?? "",
        ].some((v: any) => v.toLowerCase().includes(q));

      const matchesStatus =
        statusFilter === "ALL" ? true : item.status === statusFilter;

      return matchesQuery && matchesStatus;
    });
  }, [items, query, statusFilter]);

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-white/40">
              Admin
            </p>
            <h1 className="mt-2 text-3xl font-light tracking-[0.08em]">
              Brokers
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-white/55">
              Gestión central de brokers, permisos de publicación y estado operativo.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/properties"
              className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white transition hover:bg-white/[0.08]"
            >
              Propiedades
            </Link>
            <Link
              href="/admin/public"
              className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white transition hover:bg-white/[0.08]"
            >
              Capa pública
            </Link>
          </div>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-3 xl:grid-cols-6">
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <div className="text-[11px] uppercase tracking-[0.24em] text-white/35">Brokers</div>
            <div className="mt-3 text-3xl font-light text-white">{metrics.total}</div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <div className="text-[11px] uppercase tracking-[0.24em] text-white/35">Activos</div>
            <div className="mt-3 text-3xl font-light text-white">{metrics.active}</div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <div className="text-[11px] uppercase tracking-[0.24em] text-white/35">Pendientes</div>
            <div className="mt-3 text-3xl font-light text-white">{metrics.pending}</div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <div className="text-[11px] uppercase tracking-[0.24em] text-white/35">Can publish</div>
            <div className="mt-3 text-3xl font-light text-white">{metrics.publishEnabled}</div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <div className="text-[11px] uppercase tracking-[0.24em] text-white/35">Tokko on</div>
            <div className="mt-3 text-3xl font-light text-white">{metrics.tokkoEnabled}</div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <div className="text-[11px] uppercase tracking-[0.24em] text-white/35">Propiedades</div>
            <div className="mt-3 text-3xl font-light text-white">{metrics.properties}</div>
          </div>
        </div>

        <div className="mb-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto]">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar broker por nombre, correo, firma, ciudad o slug"
            className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-white/20"
          />

          <div className="flex flex-wrap gap-2">
            {(["ALL", "ACTIVE", "PENDING", "SUSPENDED"] as const).map((value: any) => (
              <button
                key={value}
                type="button"
                onClick={() => setStatusFilter(value)}
                className={`rounded-2xl border px-4 py-3 text-sm transition ${
                  statusFilter === value
                    ? "border-white bg-white text-black"
                    : "border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08]"
                }`}
              >
                {value === "ALL" ? "Todos" : value}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-sm text-white/60">
            Cargando brokers...
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-6 text-sm text-red-200">
            {error}
          </div>
        ) : (
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-white/10 bg-white/[0.03] text-white/45">
                  <tr>
                    <th className="px-4 py-4 font-medium">Broker</th>
                    <th className="px-4 py-4 font-medium">Firma</th>
                    <th className="px-4 py-4 font-medium">Estado</th>
                    <th className="px-4 py-4 font-medium">Permisos</th>
                    <th className="px-4 py-4 font-medium">Propiedades</th>
                    <th className="px-4 py-4 font-medium">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-white/45">
                        Sin resultados
                      </td>
                    </tr>
                  ) : (
                    filtered.map((item: any) => (
                      <tr key={item.id} className="border-b border-white/6 last:border-b-0">
                        <td className="px-4 py-4 align-top">
                          <div className="font-medium text-white">
                            {item.name || "Sin nombre"}
                          </div>
                          <div className="mt-1 text-xs text-white/45">{item.email}</div>
<div className="mt-2">
  {item.emailVerified ? (
    <span className="inline-flex rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-[10px] uppercase tracking-[0.15em] text-emerald-200">
      Email verified
    </span>
  ) : (
    <span className="inline-flex rounded-full border border-white/10 bg-white/[0.05] px-2 py-1 text-[10px] uppercase tracking-[0.15em] text-white/50">
      Email not verified
    </span>
  )}
</div>
                        </td>

                        <td className="px-4 py-4 align-top text-white/75">
                          <div>{item.brokerProfile?.businessName || "Sin perfil"}</div>
                          <div className="mt-1 text-xs text-white/45">
                            {item.brokerProfile?.city || "Sin ciudad"}
                          </div>
                        </td>

                        <td className="px-4 py-4 align-top">
                          {item.status === "ACTIVE" ? (
                            <Badge label="ACTIVE" tone="green" />
                          ) : item.status === "PENDING" ? (
                            <Badge label="PENDING" tone="yellow" />
                          ) : (
                            <Badge label="SUSPENDED" tone="red" />
                          )}
                        </td>

                        <td className="px-4 py-4 align-top">
                          <div className="flex flex-wrap gap-2">

                            <button
                              type="button"
                              onClick={() => toggle(item.id, "approved", !item.brokerProfile?.approved)}
                              className="cursor-pointer"
                            >
                              <Badge
                                label={item.brokerProfile?.approved ? "APPROVED" : "NO APPROVED"}
                                tone={item.brokerProfile?.approved ? "green" : "neutral"}
                              />
                            </button>

                            <button
                              type="button"
                              onClick={() => toggle(item.id, "canPublish", !item.brokerProfile?.canPublish)}
                              className="cursor-pointer"
                            >
                              <Badge
                                label={item.brokerProfile?.canPublish ? "CAN PUBLISH" : "NO PUBLISH"}
                                tone={item.brokerProfile?.canPublish ? "blue" : "neutral"}
                              />
                            </button>

                            <button
                              type="button"
                              onClick={() => toggle(item.id, "tokkoEnabled", !item.brokerProfile?.tokkoEnabled)}
                              className="cursor-pointer"
                            >
                              <Badge
                                label={item.brokerProfile?.tokkoEnabled ? "TOKKO ON" : "TOKKO OFF"}
                                tone={item.brokerProfile?.tokkoEnabled ? "green" : "neutral"}
                              />
                            </button>

                          </div>
                        </td>

                        <td className="px-4 py-4 text-white/75">
                          {item.propertyCount ?? 0}
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-2">
                            <Link
                              href={`/admin/brokers/${item.id}`}
                              className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white transition hover:bg-white/[0.08]"
                            >
                              Abrir
                            </Link>

                            <button
                              type="button"
                              onClick={() => deleteBroker(item.id)}
                              className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-200 transition hover:bg-red-500/20"
                            >
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
