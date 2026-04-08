"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

type Destination = {
  id: string;
  name: string;
  slug: string;
  status: string;
  isFeatured: boolean;
  sortOrder: number;
  updatedAt: string;
  featuredProperties?: {
    propertyId: string;
  }[];
};

function DestinationsPageContent() {
  const searchParams = useSearchParams();
  const propertyId = searchParams.get("propertyId") ?? "";

  const [items, setItems] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError("");

        const res = await fetch("/api/admin/public/destinations", {
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error("No se pudo cargar destinos");
        }

        const data = await res.json();
        if (!cancelled) {
          setItems(Array.isArray(data) ? data : []);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Error cargando destinos");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (!propertyId) return true;
      if (!item.featuredProperties?.length) return false;
      return item.featuredProperties.some((p) => p.propertyId === propertyId);
    });
  }, [items, propertyId]);

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-white/40">
              CMS público
            </p>
            <h1 className="mt-2 text-3xl font-light tracking-[0.08em]">
              Destinations
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-white/55">
              Administra destinos y su relación con propiedades destacadas.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/public"
              className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white transition hover:bg-white/[0.08]"
            >
              Volver
            </Link>
            <Link
              href="/admin/public/destinations/new"
              className="rounded-2xl border border-white/10 bg-white px-4 py-3 text-sm text-black transition hover:opacity-90"
            >
              Nuevo destino
            </Link>
          </div>
        </div>

        {propertyId ? (
          <div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/70">
            Filtrando por propertyId: <span className="text-white">{propertyId}</span>
          </div>
        ) : null}

        {loading ? (
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-sm text-white/60">
            Cargando destinos...
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
                    <th className="px-4 py-4 font-medium">Nombre</th>
                    <th className="px-4 py-4 font-medium">Slug</th>
                    <th className="px-4 py-4 font-medium">Status</th>
                    <th className="px-4 py-4 font-medium">Featured</th>
                    <th className="px-4 py-4 font-medium">Sort</th>
                    <th className="px-4 py-4 font-medium">Properties</th>
                    <th className="px-4 py-4 font-medium">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-white/45">
                        Sin resultados
                      </td>
                    </tr>
                  ) : (
                    filtered.map((item) => (
                      <tr key={item.id} className="border-b border-white/6 last:border-b-0">
                        <td className="px-4 py-4 align-top">
                          <div className="font-medium text-white">{item.name}</div>
                        </td>
                        <td className="px-4 py-4 text-white/75">{item.slug}</td>
                        <td className="px-4 py-4 text-white/75">{item.status}</td>
                        <td className="px-4 py-4 text-white/75">
                          {item.isFeatured ? "Sí" : "No"}
                        </td>
                        <td className="px-4 py-4 text-white/75">{item.sortOrder}</td>
                        <td className="px-4 py-4 text-white/75">
                          {item.featuredProperties?.length ?? 0}
                        </td>
                        <td className="px-4 py-4">
                          <Link
                            href={`/admin/public/destinations/${item.id}`}
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

export default function DestinationsPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-neutral-500">Loading...</div>}>
      <DestinationsPageContent />
    </Suspense>
  );
}
