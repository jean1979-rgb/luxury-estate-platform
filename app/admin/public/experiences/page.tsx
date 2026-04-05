"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Page() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/public/experiences")
      .then((r) => r.json())
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-10 text-white space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-light">Experiences</h1>
        <Link href="/admin/public/experiences/new" className="bg-white text-black px-4 py-2 rounded-xl">
          New Experience
        </Link>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : items.length === 0 ? (
        <div className="text-white/60">No experiences yet.</div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <Link
              key={item.id}
              href={`/admin/public/experiences/${item.id}`}
              className="block border border-white/10 rounded-2xl p-5 hover:border-white/30 transition"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-xl font-light">{item.name}</div>
                  <div className="text-sm text-white/55">
                    /{item.slug} · {item.category || "uncategorized"}
                    {item.isFeatured ? " · featured" : ""}
                    {!item.isVisible ? " · hidden" : ""}
                  </div>
                </div>

                <div className="text-sm text-white/50">
                  order {item.sortOrder}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
