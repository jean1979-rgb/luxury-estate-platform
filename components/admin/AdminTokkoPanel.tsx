"use client";

import { useMemo, useState } from "react";

type TokkoAdminItem = {
  id: string;
  title?: string;
  price?: string | number;
  location?: string;
  coverImage?: string;
  base?: {
    title?: string;
    price?: string | number;
    currency?: string;
    locationLabel?: string;
    images?: string[];
  };
};

function money(value?: string | number | null, currency = "MXN") {
  const numericValue = typeof value === "string" ? Number(value) : value;
  if (!numericValue || !Number.isFinite(numericValue)) return "Sin precio";
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(numericValue);
}

export default function AdminTokkoPanel({
  items,
  hiddenIds,
  onToggleVisibility,
  onImport,
}: {
  items: TokkoAdminItem[];
  hiddenIds: string[];
  onToggleVisibility: (id: string) => void;
  onImport: (item: TokkoAdminItem) => void;
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;

    return items.filter((item) => {
      const text = [
        item.id,
        item.title,
        item.location,
        item.base?.title,
        item.base?.locationLabel,
        item.price,
        item.base?.price,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return text.includes(q);
    });
  }, [items, query]);

  return (
    <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035]">
      <div className="shrink-0 border-b border-white/10 p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-[11px] uppercase tracking-[0.3em] text-white/45">
            Tokko Feed
          </div>
          <div className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-white/70">
            {filtered.length}/{items.length}
          </div>
        </div>

        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar propiedad..."
          className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-white/30"
        />
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
        {filtered.map((item) => {
          const hidden = hiddenIds.includes(item.id);
          const title = item.title || item.base?.title || item.id;
          const price = item.price || item.base?.price || null;
          const currency = item.base?.currency || "MXN";
          const location = item.location || item.base?.locationLabel || "";
          const image = item.coverImage || item.base?.images?.[0] || "";

          return (
            <article
              key={item.id}
              className="rounded-2xl border border-white/10 bg-white/[0.045] p-3"
            >
              <div className="flex gap-3">
                <div className="h-24 w-28 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
                  {image ? (
                    <img src={image} alt={title} className="h-full w-full object-cover" />
                  ) : null}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="line-clamp-2 text-sm font-semibold leading-5 text-white">
                    {title}
                  </div>
                  <div className="mt-1 text-sm font-semibold text-white/80">
                    {money(price, currency)}
                  </div>
                  {location ? (
                    <div className="mt-1 line-clamp-1 text-xs text-white/45">
                      {location}
                    </div>
                  ) : null}

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => onToggleVisibility(item.id)}
                      className={[
                        "rounded-xl px-2 py-2 text-[11px] font-semibold uppercase transition",
                        hidden
                          ? "bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25"
                          : "bg-red-500/15 text-red-300 hover:bg-red-500/25",
                      ].join(" ")}
                    >
                      {hidden ? "Mostrar" : "Ocultar"}
                    </button>

                    <button
                      type="button"
                      onClick={() => onImport(item)}
                      className="rounded-xl bg-white/10 px-2 py-2 text-[11px] font-semibold uppercase text-white transition hover:bg-white/20"
                    >
                      Importar
                    </button>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
