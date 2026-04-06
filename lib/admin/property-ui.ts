import type { AdminPropertyInput, AdminPropertyRecord } from "@/types/admin";

export function applyPropertyResult(params: {
  saved: AdminPropertyRecord;
  setItems: (fn: (prev: AdminPropertyRecord[]) => AdminPropertyRecord[]) => void;
  setSelectedId: (id: string) => void;
  setForm: (value: AdminPropertyInput) => void;
  setMessage: (msg: string) => void;
}) {
  const { saved, setItems, setSelectedId, setForm, setMessage } = params;

  setItems((prev) => {
    const exists = prev.some((item) => item.id === saved.id);
    const next = exists
      ? prev.map((item) => (item.id === saved.id ? saved : item))
      : [saved, ...prev];

    return next.sort((a, b) => {
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  });

  setSelectedId(saved.id);

  setForm({
    id: saved.id,
    title: saved.title,
    slug: saved.slug,
    status: saved.status,
    propertyType: saved.propertyType,
    location: saved.location,
    price: saved.price,
    currency: saved.currency,
    bedrooms: saved.bedrooms,
    bathrooms: saved.bathrooms,
    areaInterior: saved.areaInterior,
    areaTotal: saved.areaTotal,
    tagline: saved.tagline,
    coverImage: saved.coverImage,
    gallery: saved.gallery,
    scenes360: saved.scenes360,
    featured: saved.featured,
    published: saved.published,
    luxuryScore: saved.luxuryScore,
    description: saved.description,
  });

  setMessage("Propiedad guardada correctamente en Prisma.");
}
