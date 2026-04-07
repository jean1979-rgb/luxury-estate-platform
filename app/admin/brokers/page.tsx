"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type BrokerRow = {
  id: string;
  name: string | null;
  email: string;
  role: "BROKER" | "ADMIN";
  status: "ACTIVE" | "PENDING" | "SUSPENDED";
  brokerProfile: {
    approved: boolean;
    canPublish: boolean;
    tokkoEnabled: boolean;
  } | null;
  _count?: {
    properties?: number;
  };
};

export default function AdminBrokersPage() {
  const [items, setItems] = useState<BrokerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

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

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => {
      return [
        item.name ?? "",
        item.email,
        item.role,
        item.status,
      ].some((v) => v.toLowerCase().includes(q));
    });
  }, [items, query]);

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

          <div className="flex gap-3">
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

        <div className="mb-6">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar broker por nombre, correo, rol o estatus"
            className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-white/20"
          />
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
                    <th className="px-4 py-4 font-medium">Rol</th>
                    <th className="px-4 py-4 font-medium">Estatus</th>
                    <th className="px-4 py-4 font-medium">Approved</th>
                    <th className="px-4 py-4 font-medium">Can publish</th>
                    <th className="px-4 py-4 font-medium">Tokko</th>
                    <th className="px-4 py-4 font-medium">Propiedades</th>
                    <th className="px-4 py-4 font-medium">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-white/45">
                        Sin resultados
                      </td>
                    </tr>
                  ) : (
                    filtered.map((item) => (
                      <tr key={item.id} className="border-b border-white/6 last:border-b-0">
                        <td className="px-4 py-4 align-top">
                          <div className="font-medium text-white">
                            {item.name || "Sin nombre"}
                          </div>
                          <div className="mt-1 text-xs text-white/45">{item.email}</div>
                        </td>
                        <td className="px-4 py-4 text-white/75">{item.role}</td>
                        <td className="px-4 py-4 text-white/75">{item.status}</td>
                        <td className="px-4 py-4 text-white/75">
                          {item.brokerProfile?.approved ? "Sí" : "No"}
                        </td>
                        <td className="px-4 py-4 text-white/75">
                          {item.brokerProfile?.canPublish ? "Sí" : "No"}
                        </td>
                        <td className="px-4 py-4 text-white/75">
                          {item.brokerProfile?.tokkoEnabled ? "Activo" : "Off"}
                        </td>
                        <td className="px-4 py-4 text-white/75">
                          {item._count?.properties ?? 0}
                        </td>
                        <td className="px-4 py-4">
                          <Link
                            href={`/admin/brokers/${item.id}`}
                            className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white transition hover:bg-white/[0.08]"
                          >
                            Abrir
                          </Link>
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
