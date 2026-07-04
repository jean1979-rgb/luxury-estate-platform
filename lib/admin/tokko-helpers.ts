import type { AdminPropertyInput } from "@/types/admin";

export type TokkoAdminItem = {
  id: string;
  title?: string;
  operationMode?: string;
  price?: string | number;
  location?: string;
  coverImage?: string;
  base?: {
    title?: string;
    price?: string | number;
    currency?: string;
    locationLabel?: string;
    images?: string[];
    description?: string;
  };
  editorial?: {
    title?: string;
    tagline?: string;
    descriptionLuxury?: string;
  };
};

export function isTokkoAdminItem(value: unknown): value is TokkoAdminItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return typeof item.id === "string" || typeof item.id === "number";
}

export function mapTokkoToAdminProperty(item: TokkoAdminItem): AdminPropertyInput {
  return {
    id: `admin-${item.id}`,
    title: item.editorial?.title || item.base?.title || "Propiedad",
    slug: "",
    status: "draft",
    propertyType: "residence",
    location: item.base?.locationLabel || "",
    zoneSlug: "",
    zoneLabel: "",
    price: item.base?.price != null ? String(item.base.price) : "",
    currency: item.base?.currency || "MXN",
    bedrooms: 0,
    bathrooms: 0,
    halfBathrooms: 0,
    areaInterior: "",
    areaTotal: "",
    tagline: item.editorial?.tagline || item.editorial?.descriptionLuxury || "",
    coverImage: item.base?.images?.[0] || "",
    gallery: Array.isArray(item.base?.images) ? item.base.images : [],
    pdfGallery: [],
    videoUrl: "",
    videoPoster: "",
    videoType: "upload",
    scenes360: [],
    featured: false,
    published: false,
    luxuryScore: 80,
    pemFactors: {},
    description: item.editorial?.descriptionLuxury || item.base?.description || "",
  };
}
