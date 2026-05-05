"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type RequestRow = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  businessName?: string | null;
  city?: string | null;
  message?: string | null;
  status: string;
  createdAt: string;
};

export default function AdminBrokerRequestsPage() {
  const [items, setItems] = useState<RequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    try {
      setLoading(true);
      setError("");
      const res = await fetch("/api/admin/broker-requests", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "No se pudieron cargar solicitudes");
      setItems(Array.isArray(data.items) ? data.items : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error cargando solicitudes");
    } finally {
      setLoading(false);
    }
  }

  async function updateRequest(id: string, action: "approve" | "reject") {
    try {
      const res = await fetch(`/api/admin/broker-requests/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "No se pudo actualizar");

      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Error actualizando solicitud");
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-white/40">Admin</p>
            <h1 className="mt-2 text-3xl font-light tracking-[0.08em]">Solicitudes broker</h1>
            <p className="mt-3 text-sm text-white/55">
              Tracking de interesados antes de crear cuenta en la plataforma.
            </p>
          </div>

          <Link href="/admin/brokers" className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm">
            Volver a brokers
          </Link>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-white/60">
            Cargando solicitudes...
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-6 text-red-200">
            {error}
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-white/50">
            No hay solicitudes todavía.
          </div>
        ) : (
          <div className="grid gap-4">
            {items.map((item) => (
              <section key={item.id} className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
                <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-xl font-light">{item.name}</h2>
                      <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white/60">
                        {item.status}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-2 text-sm text-white/60 md:grid-cols-2">
                      <p><span className="text-white/35">Email:</span> {item.email}</p>
                      <p><span className="text-white/35">Teléfono:</span> {item.phone || "—"}</p>
                      <p><span className="text-white/35">Firma:</span> {item.businessName || "—"}</p>
                      <p><span className="text-white/35">Ciudad:</span> {item.city || "—"}</p>
                    </div>

                    {item.message && (
                      <p className="mt-4 max-w-3xl text-sm leading-6 text-white/55">{item.message}</p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={item.status !== "PENDING"}
                      onClick={() => updateRequest(item.id, "approve")}
                      className="rounded-2xl bg-white px-4 py-3 text-sm text-black disabled:opacity-40"
                    >
                      Aprobar
                    </button>
                    <button
                      type="button"
                      disabled={item.status !== "PENDING"}
                      onClick={() => updateRequest(item.id, "reject")}
                      className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200 disabled:opacity-40"
                    >
                      Rechazar
                    </button>
                  </div>
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
