import { prisma } from "@/lib/prisma";
import { promises as fs } from "fs";
import path from "path";

export type PropertyZone = "playa" | "real-diamante" | "las-brisas";

type CatalogProperty = {
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

export type PropertyUnified = {
  id: string;
  title: string;
  location: string;
  coverImage: string;
  tagline?: string;

  price?: number;
  operation: "sale" | "rent";
  isLuxury: boolean;
  isLuxuryRental: boolean;

  featured?: boolean;
  published?: boolean;
  zone?: PropertyZone | null;
};

function parsePrice(value: any): number | null {
  if (!value) return null;
  if (typeof value === "number") return value;

  const cleaned = String(value).replace(/[^\d]/g, "");
  return cleaned ? Number(cleaned) : null;
}

function isLuxuryPrice(price: number | null) {
  if (!price) return false;
  return price >= 15000000;
}

function normalizeText(value: any) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function resolveAcapulcoZone(input: {
  location?: string;
  title?: string;
  tagline?: string;
}): PropertyZone | null {
  const text = normalizeText(
    [input.location, input.title, input.tagline].filter(Boolean).join(" | ")
  );

  if (!text.includes("acapulco")) return null;

  if (
    text.includes("real diamante") ||
    text.includes("cima real") ||
    text.includes("puerto marques")
  ) {
    return "real-diamante";
  }

  if (
    text.includes("las brisas") ||
    text.includes("brisas del marques") ||
    text.includes("brisas") ||
    text.includes("guitarron") ||
    text.includes("pichilingue")
  ) {
    return "las-brisas";
  }

  if (
    text.includes("playa diamante") ||
    text.includes("plan de los amates") ||
    text.includes("alfredo v bonfil") ||
    text.includes("barra diamante") ||
    text.includes("barra vieja") ||
    text.includes("playa encantada") ||
    text.includes("granjas del marquez") ||
    text.includes("granjas del marquiz") ||
    text.includes("mayan island") ||
    text.includes("la sanja") ||
    text.includes("la zanja") ||
    text.includes("bonfil") ||
    text.includes("marina diamante") ||
    text.includes("vidanta") ||
    text.includes("playamar") ||
    text.includes("peninsula") ||
    text.includes("peninsula acapulco diamante") ||
    text.includes("ocean front")
  ) {
    return "playa";
  }

  return null;
}







function inferZone(value: string): PropertyZone {
  const v = value.toLowerCase();
  if (v.includes("real diamante")) return "real-diamante";
  if (v.includes("brisas")) return "las-brisas";
  return "playa";
}

function inferOperation(property: {
  title?: string | null;
  source?: string | null;
  propertyType?: string | null;
}) {
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
      operation: inferOperation(row) as "sale" | "rental",
      featured: row.featured,
      source: row.source ?? undefined,
    };
  }).filter((item) => item.coverImage.trim().length > 0);
}

export function getPropertyBadge(property: PropertyUnified | CatalogProperty) {
  if (property.operation === "rent" || property.operation === "rental") {
    return "Private Rental";
  }

  const rawPrice = property.price;
  const numericPrice =
    typeof rawPrice === "number"
      ? rawPrice
      : typeof rawPrice === "string"
        ? Number(String(rawPrice).replace(/[^\d]/g, ""))
        : null;

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

  if (typeof rawPrice === "string" && rawPrice.trim().length > 0) {
    return rawPrice;
  }

  return "Luxury Listing";
}

export async function getCasaDePlayaProperties(): Promise<CatalogProperty[]> {
  const properties = await getCatalogPropertiesFromPrisma();

  return properties
    .filter((item) => item.operation === "sale")
    .filter((item) => item.zone === "playa" || item.zone === "real-diamante" || item.zone === "las-brisas")
    .sort((a, b) => {
      if (Number(b.featured) !== Number(a.featured)) {
        return Number(b.featured) - Number(a.featured);
      }
      return 0;
    });
}

export async function getAcapulcoRentalProperties(): Promise<CatalogProperty[]> {
  const properties = await getCatalogPropertiesFromPrisma();

  return properties
    .filter((item) => item.operation === "rental")
    .filter((item) => item.zone === "playa" || item.zone === "real-diamante" || item.zone === "las-brisas")
    .sort((a, b) => {
      if (Number(b.featured) !== Number(a.featured)) {
        return Number(b.featured) - Number(a.featured);
      }
      return 0;
    });
}
