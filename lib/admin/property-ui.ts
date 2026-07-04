import type { AdminPropertyInput, AdminPropertyRecord } from "@/types/admin";

export function applyPropertyResult(params: {
  saved: AdminPropertyRecord;
  setItems: (fn: (prev: AdminPropertyRecord[]) => AdminPropertyRecord[]) => void;
  setSelectedId: (id: string) => void;
  getSelectedId?: () => string;
  setForm: (value: AdminPropertyInput) => void;
  setMessage: (msg: string) => void;
}) {
  const { saved, setItems, setSelectedId, getSelectedId, setForm, setMessage } = params;

  setItems((prev) => {
    const exists = saved?.id ? prev.some((item) => item.id === saved.id) : false;
    const next = exists
      ? prev.map((item) => (saved?.id && item.id === saved.id ? saved : item))
      : [saved, ...prev];

    return next.sort((a, b) => {
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  });

  const currentSelectedId = typeof getSelectedId === "function" ? getSelectedId() : saved.id;
  const shouldHydrateEditor = currentSelectedId === saved.id;

  if (shouldHydrateEditor && saved?.id) {
    setSelectedId(saved.id);

    setForm({
      id: saved.id,
      title: saved.title,
      slug: saved.slug,
      status: saved.status,
      propertyType: saved.propertyType,
      location: saved.location,
      zoneSlug: saved.zoneSlug || "",
      zoneLabel: saved.zoneLabel || "",
      price: saved.price,
      currency: saved.currency,
      bedrooms: saved.bedrooms,
      bathrooms: saved.bathrooms,
      halfBathrooms: saved.halfBathrooms ?? 0,
      areaInterior: saved.areaInterior,
      areaTotal: saved.areaTotal,
      tagline: saved.tagline,
      coverImage: saved.coverImage,
      gallery: saved.gallery,
      pdfGallery: Array.isArray((saved as any).pdfGallery) ? (saved as any).pdfGallery : [],
      videoUrl: saved.videoUrl || "",
      videoPoster: saved.videoPoster || "",
      videoType: saved.videoType || "upload",
      scenes360: saved.scenes360,
      featured: saved.featured,
      published: saved.published,
      luxuryScore: saved.luxuryScore,
      pemFactors: saved.pemFactors || {},
      description: saved.description,
    });
  }

  setMessage("Propiedad guardada correctamente en Prisma.");
}
