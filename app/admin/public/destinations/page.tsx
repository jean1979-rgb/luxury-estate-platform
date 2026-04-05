"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Destination = {
  id: string;
  name: string;
  slug: string;
  status: string;
  isFeatured: boolean;
  sortOrder: number;
  updatedAt: string;
};

export default function DestinationsPage() {
  const [items, setItems] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/public/destinations")
      .then((res) => res.json())
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-10 text-white space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-light">Destinations</h1>
        <Link href="/admin/public/destinations/new" className="bg-white text-black px-4 py-2 rounded-xl">
          New Destination
        </Link>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : items.length === 0 ? (
        <div className="text-white/60">No destinations yet.</div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <Link
              key={item.id}
              href={`/admin/public/destinations/${item.id}`}
              className="block border border-white/10 rounded-2xl p-5 hover:border-white/30 transition"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-xl font-light">{item.name}</div>
                  <div className="text-sm text-white/55">
                    /{item.slug} · {item.status}
                    {item.isFeatured ? " · featured" : ""}
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
