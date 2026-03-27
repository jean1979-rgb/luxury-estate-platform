import { promises as fs } from "fs";
import path from "path";
import { AdminPropertyInput, AdminPropertyRecord } from "@/types/admin";

const ADMIN_PROPERTIES_PATH = path.join(process.cwd(), "data", "admin", "properties.json");

function normalizeSlug(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .trim();
}

function normalizeRecord(input: AdminPropertyInput, existingCreatedAt?: string): AdminPropertyRecord {
  const now = new Date().toISOString();

  const slug = normalizeSlug(input.slug || input.title || input.id || "propiedad");
  const id =
    input.id?.trim() ||
    `prop_${slug || "item"}_${Math.random().toString(36).slice(2, 8)}`;

  return {
    id,
    title: input.title?.trim() || "Nueva propiedad",
    slug,
    status: input.status || "draft",
    propertyType: input.propertyType || "villa",
    location: input.location?.trim() || "",
    price: input.price?.trim() || "",
    currency: input.currency?.trim() || "MXN",
    bedrooms: Number.isFinite(Number(input.bedrooms)) ? Number(input.bedrooms) : 0,
    bathrooms: Number.isFinite(Number(input.bathrooms)) ? Number(input.bathrooms) : 0,
    areaInterior: input.areaInterior?.trim() || "",
    areaTotal: input.areaTotal?.trim() || "",
    tagline: input.tagline?.trim() || "",
    coverImage: input.coverImage?.trim() || "",
    gallery: Array.isArray(input.gallery) ? input.gallery : [],
    scenes360: Array.isArray(input.scenes360) ? input.scenes360 : [],
    featured: Boolean(input.featured),
    published: Boolean(input.published),
    luxuryScore: Number.isFinite(Number(input.luxuryScore)) ? Number(input.luxuryScore) : 85,
    description: input.description?.trim() || "",
    createdAt: existingCreatedAt || now,
    updatedAt: now,
  };
}

export async function readAdminProperties(): Promise<AdminPropertyRecord[]> {
  const raw = await fs.readFile(ADMIN_PROPERTIES_PATH, "utf8");
  const parsed = JSON.parse(raw);

  if (!Array.isArray(parsed)) return [];

  return parsed as AdminPropertyRecord[];
}

export async function writeAdminProperties(records: AdminPropertyRecord[]) {
  const sorted = [...records].sort((a, b) => {
    const left = new Date(b.updatedAt).getTime();
    const right = new Date(a.updatedAt).getTime();
    return left - right;
  });

  await fs.writeFile(ADMIN_PROPERTIES_PATH, JSON.stringify(sorted, null, 2), "utf8");
}

export async function upsertAdminProperty(input: AdminPropertyInput) {
  const current = await readAdminProperties();
  const existing = current.find((item) => item.id === input.id || item.slug === input.slug);

  const normalized = normalizeRecord(input, existing?.createdAt);

  const next = existing
    ? current.map((item) => (item.id === existing.id ? normalized : item))
    : [normalized, ...current];

  await writeAdminProperties(next);

  return normalized;
}
