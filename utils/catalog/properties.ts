import { prisma } from "@/lib/prisma";

export type PropertyZone = "playa" | "real-diamante" | "las-brisas";

export type CatalogProperty = {
  id: string;
  slug: string;
  title: string;
  location: string;
  coverImage: string;
  price: string;
  zone: PropertyZone;
  operation: "sale" | "rental";
  featured?: boolean;
  source?: string;
};

function inferZone(value: string): PropertyZone {
  const v = value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (v.includes("real diamante") || v.includes("diamante")) {
    return "real-diamante";
  }

  if (v.includes("brisas")) {
    return "las-brisas";
  }

  return "playa";
}

function inferOperation(property: {
  title?: string | null;
  source?: string | null;
  propertyType?: string | null;
}): "sale" | "rental" {
  const text = `${property.title ?? ""} ${property.source ?? ""} ${property.propertyType ?? ""}`.toLowerCase();
  return text.includes("renta") || text.includes("rental") ? "rental" : "sale";
}

function safeJsonArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
  }
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed)
        ? parsed.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
        : [];
    } catch {
      return [];
    }
  }
  return [];
}

async function getCatalogPropertiesFromPrisma(): Promise<CatalogProperty[]> {
  const rows = await prisma.brokerProperty.findMany({
    where: { published: true },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      slug: true,
      title: true,
      location: true,
      coverImage: true,
      gallery: true,
      price: true,
      source: true,
      propertyType: true,
      featured: true,
    },
  });

  return rows.map((row) => {
    const gallery = safeJsonArray(row.gallery);
    const fallbackImage = gallery[0] ?? "";
    const image = row.coverImage ?? fallbackImage;

    return {
      id: row.id,
      slug: row.slug,
      title: row.title,
      location: row.location ?? "Ubicación premium",
      coverImage: image,
      price: row.price ?? "Precio disponible bajo solicitud",
      zone: inferZone(`${row.title} ${row.location ?? ""}`),
      operation: inferOperation(row),
      featured: row.featured,
      source: row.source ?? undefined,
    };
  }).filter((item) => item.coverImage.trim().length > 0);
}

export function getPropertyBadge(property: CatalogProperty) {
  if (property.operation === "rental") {
    return "Private Rental";
  }

  const rawPrice = property.price;

  const numericPrice = Number(String(rawPrice).replace(/[^\d]/g, ""));

  if (numericPrice && Number.isFinite(numericPrice)) {
    try {
      return new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
        maximumFractionDigits: 0,
      }).format(numericPrice);
    } catch {
      return "Luxury Listing";
    }
  }

  return rawPrice || "Luxury Listing";
}

export async function getCasaDePlayaProperties(): Promise<CatalogProperty[]> {
  const properties = await getCatalogPropertiesFromPrisma();

  return properties
    .filter((item) => item.operation === "sale")
    .filter((item) => ["playa", "real-diamante", "las-brisas"].includes(item.zone))
    .sort((a, b) => Number(b.featured) - Number(a.featured));
}

export async function getAcapulcoRentalProperties(): Promise<CatalogProperty[]> {
  const properties = await getCatalogPropertiesFromPrisma();

  return properties
    .filter((item) => item.operation === "rental")
    .filter((item) => ["playa", "real-diamante", "las-brisas"].includes(item.zone))
    .sort((a, b) => Number(b.featured) - Number(a.featured));
}
