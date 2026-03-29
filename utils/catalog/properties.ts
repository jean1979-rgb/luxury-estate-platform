import { promises as fs } from "fs";
import path from "path";

export type PropertyZone = "playa" | "real-diamante" | "las-brisas";

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

async function readAdminRaw(): Promise<any[]> {
  const adminPath = path.join(process.cwd(), "data/admin/properties.json");

  try {
    return JSON.parse(await fs.readFile(adminPath, "utf8"));
  } catch {
    return [];
  }
}

async function readTokkoRaw(): Promise<any[]> {
  const tokkoPath = path.join(process.cwd(), "data/platform/properties.json");

  try {
    return JSON.parse(await fs.readFile(tokkoPath, "utf8"));
  } catch {
    return [];
  }
}

function mapAdminProperty(item: any): PropertyUnified {
  const price = parsePrice(item.price);
  const location = String(item.location || "").trim();
  const title = String(item.title || "Propiedad").trim();
  const tagline = String(item.tagline || item.description || "").trim();

  return {
    id: item.id,
    title,
    location,
    coverImage: item.coverImage || "",
    tagline,

    price: price ?? undefined,
    operation: "sale",
    isLuxury: isLuxuryPrice(price),
    isLuxuryRental: false,

    featured: Boolean(item.featured),
    published: item.published ?? true,
    zone: resolveAcapulcoZone({ location, title, tagline }),
  };
}

function mapTokkoProperty(item: any): PropertyUnified {
  const location = String(
    item.locationLabel || item.base?.locationLabel || item.base?.location || ""
  ).trim();

  const title = String(
    item.editorial?.title || item.base?.title || "Propiedad"
  ).trim();

  const tagline = String(
    item.editorial?.descriptionLuxury || item.base?.description || ""
  ).trim();

  const price =
    parsePrice(item.price) ??
    parsePrice(item.base?.price) ??
    parsePrice(item.pricing?.price) ??
    parsePrice(item.operations?.[0]?.prices?.[0]?.price);

  const operationText = normalizeText(
    item.operationMode ||
      item.operation ||
      item.operations?.map((op: any) => op?.type || op?.operation_type || "").join(" | ")
  );

  const isRent =
    item.rental?.enabled === true ||
    operationText.includes("rent") ||
    operationText.includes("renta") ||
    operationText.includes("alquiler");

  return {
    id: item.id,
    title,
    location,
    coverImage: item.base?.images?.[0] || "",
    tagline,

    price: price ?? undefined,
    operation: isRent ? "rent" : "sale",
    isLuxury: isRent ? false : isLuxuryPrice(price),
    isLuxuryRental: isRent,

    featured: Boolean(item.editorial?.featuredPlatform),
    published: item.status?.published ?? true,
    zone: resolveAcapulcoZone({ location, title, tagline }),
  };
}

export async function getAllProperties(): Promise<PropertyUnified[]> {
  const admin = await readAdminRaw();
  const tokko = await readTokkoRaw();

  const adminMapped = admin.map(mapAdminProperty);
  const tokkoMapped = tokko.map(mapTokkoProperty);

  return [...adminMapped, ...tokkoMapped].filter((item) => item?.published);
}

async function getAdminPublishedProperties(): Promise<PropertyUnified[]> {
  const admin = await readAdminRaw();

  return admin
    .map(mapAdminProperty)
    .filter((item) => item?.published);
}

export function getPropertyBadge(property: PropertyUnified) {
  if (property.operation === "rent") return "Private Rental";
  if (property.price) {
    try {
      return new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
        maximumFractionDigits: 0,
      }).format(property.price);
    } catch {
      return "Luxury Listing";
    }
  }
  return "Luxury Listing";
}

export async function getCasaDePlayaProperties(): Promise<PropertyUnified[]> {
  const properties = await getAdminPublishedProperties();

  const demo = properties.find((p) => p.id === "sample-villa-diamante");

  return demo ? [demo] : [];
}


export async function getAcapulcoRentalProperties(): Promise<PropertyUnified[]> {
  return [];
}

