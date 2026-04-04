"use client";

type TokkoAdminItem = {
  id: string;
  title?: string;
};

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
  return (
    <div className="border-t border-white/10 p-4">
      <div className="mb-3 text-[11px] uppercase tracking-[0.3em] text-white/35">
        Tokko Feed
      </div>

      <div className="space-y-3 max-h-[300px] overflow-y-auto">
        {items.map((item) => {
          const hidden = hiddenIds.includes(item.id);

          return (
            <div
              key={item.id}
              className="rounded-xl border border-white/10 bg-white/[0.03] p-3"
            >
              <div className="text-sm text-white">{item.title}</div>

              <div className="mt-2 grid grid-cols-2 gap-2">
                <button
                  onClick={() => onToggleVisibility(item.id)}
                  className={[
                    "w-full rounded-lg px-3 py-2 text-xs uppercase",
                    hidden
                      ? "bg-emerald-500/20 text-emerald-300"
                      : "bg-red-500/20 text-red-300",
                  ].join(" ")}
                >
                  {hidden ? "Mostrar" : "Ocultar"}
                </button>

                <button
                  onClick={() => onImport(item)}
                  className="w-full rounded-lg bg-white/10 px-3 py-2 text-xs uppercase text-white hover:bg-white/20"
                >
                  Importar
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
