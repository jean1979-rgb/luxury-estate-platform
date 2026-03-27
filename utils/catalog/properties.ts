import { promises as fs } from "fs";
import path from "path";

export type PropertyUnified = {
  id: string;
  title: string;
  location: string;
  coverImage: string;
  tagline?: string;

  price?: number | null;
  operation: "sale" | "rent";
  isLuxury: boolean;
  isLuxuryRental: boolean;

  featured?: boolean;
  published?: boolean;
  source?: "admin" | "tokko";
};

function parsePrice(value: any): number | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;

  const cleaned = String(value).replace(/[^\d]/g, "");
  return cleaned ? Number(cleaned) : null;
}

const MIN_LUXURY_SALE_PRICE = 15000000;
const MIN_LUXURY_RENT_NIGHT = 10000;
const MIN_LUXURY_RENT_MONTH = 60000;

function isLuxuryPrice(price: number | null) {
  return typeof price === "number" && price >= MIN_LUXURY_SALE_PRICE;
}

export async function getAllProperties(): Promise<PropertyUnified[]> {
  const adminPath = path.join(process.cwd(), "data/admin/properties.json");
  const tokkoPath = path.join(process.cwd(), "data/platform/properties.json");
  const visibilityPath = path.join(process.cwd(), "data/platform/visibility.json");

  let admin: any[] = [];
  let tokko: any[] = [];
  let hiddenIds = new Set<string>();

  try {
    admin = JSON.parse(await fs.readFile(adminPath, "utf8"));
  } catch {}

  try {
    tokko = JSON.parse(await fs.readFile(tokkoPath, "utf8"));
  } catch {}

  try {
    const visibility = JSON.parse(await fs.readFile(visibilityPath, "utf8"));
    hiddenIds = new Set(Array.isArray(visibility?.hiddenIds) ? visibility.hiddenIds : []);
  } catch {}

  const adminMapped: PropertyUnified[] = admin.map((item) => {
    const price = parsePrice(item.price);
    const isLuxurySale = isLuxuryPrice(price);

    return {
      id: item.id,
      title: item.title,
      location: item.location,
      coverImage: item.coverImage,
      tagline: item.tagline,

      price,
      operation: "sale",
      isLuxury: isLuxurySale,
      isLuxuryRental: false,

      featured: item.featured,
      published: item.published ?? true,
      source: "admin",
    };
  });

  const tokkoMapped: PropertyUnified[] = tokko
    .filter((item) => !hiddenIds.has(item.id))
    .map((item) => {
      const price = parsePrice(item.base?.price);
      const nightlyPrice = parsePrice(item.rental?.pricePerNight);
      const monthlyPrice = parsePrice(item.rental?.pricePerMonth);

      const isTemporaryRent =
        item.operationMode === "temporary_rent";

      const isRent =
        item.rental?.enabled === true ||
        item.operationMode === "rent" ||
        item.operationMode === "temporary_rent" ||
        item.operationMode === "sale_and_rent";

      const isSale = !isRent;

      const isLuxurySale =
        isSale &&
        isLuxuryPrice(price);

      const isLuxuryRental =
        isRent &&
        (
          (nightlyPrice !== null && nightlyPrice >= MIN_LUXURY_RENT_NIGHT) ||
          (monthlyPrice !== null && monthlyPrice >= MIN_LUXURY_RENT_MONTH)
        );

      return {
        id: item.id,
        title: item.editorial?.title || item.base?.title || "Propiedad",
        location: item.base?.locationLabel || "Ubicación premium",
        coverImage: item.base?.images?.[0] || "",
        tagline: item.editorial?.descriptionLuxury || item.base?.description || "",

        price,
        operation: isRent ? "rent" : "sale",
        isLuxury: isLuxurySale || isLuxuryRental,
        isLuxuryRental,

        featured: item.editorial?.featuredPlatform || false,
        published: item.status?.published ?? true,
        source: "tokko",
      };
    });

  return [...adminMapped, ...tokkoMapped].filter((p) => p.published);
}

export async function getLuxuryProperties() {
  const all = await getAllProperties();
  return all.filter((p) => p.isLuxury);
}

export async function getCasaDePlayaProperties() {
  const all = await getAllProperties();
  return all.filter((p) => p.isLuxury && p.operation === "sale");
}

export async function getAcapulcoRentalProperties() {
  const all = await getAllProperties();
  return all.filter((p) => p.isLuxuryRental && p.operation === "rent");
}

export function getPropertyBadge(property: PropertyUnified): string {
  if (property.isLuxuryRental) return "LUXURY RENTAL";
  if (property.operation === "rent") return "FOR RENT";
  return "FOR SALE";
}
