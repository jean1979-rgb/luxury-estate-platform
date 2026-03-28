import { promises as fs } from "fs";
import path from "path";
import type {
  AdminPropertyInput,
  AdminPropertyRecord,
  AdminPropertySource,
} from "@/types/admin";

const ADMIN_DIR = path.join(process.cwd(), "data", "admin");
const ADMIN_PROPERTIES_PATH = path.join(ADMIN_DIR, "properties.json");

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function safeNumber(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

async function ensureStore() {
  await fs.mkdir(ADMIN_DIR, { recursive: true });

  try {
    await fs.access(ADMIN_PROPERTIES_PATH);
  } catch {
    await fs.writeFile(ADMIN_PROPERTIES_PATH, "[]", "utf8");
  }
}

function normalizeSource(input: AdminPropertyInput): AdminPropertySource {
  const provider = input.source?.provider;

  if (
    provider === "manual" ||
    provider === "tokko" ||
    provider === "csv" ||
    provider === "xml"
  ) {
    return {
      provider,
      externalId:
        typeof input.source?.externalId === "string" && input.source.externalId.trim()
          ? input.source.externalId.trim()
          : undefined,
    };
  }

  return { provider: "manual" };
}

function normalizeRecord(
  input: AdminPropertyInput,
  existingCreatedAt?: string
): AdminPropertyRecord {
  const now = new Date().toISOString();
  const title = String(input.title || "").trim();
  const computedSlug = slugify(input.slug || title || input.id || "property");
  const computedId = slugify(input.id || computedSlug || title || `property-${Date.now()}`);

  return {
    id: computedId,
    title,
    slug: computedSlug,
    status: input.status ?? "draft",
    propertyType: input.propertyType ?? "villa",
    location: String(input.location || "").trim(),
    price: String(input.price || "").trim(),
    currency: String(input.currency || "MXN").trim() || "MXN",
    bedrooms: safeNumber(input.bedrooms, 0),
    bathrooms: safeNumber(input.bathrooms, 0),
    areaInterior: String(input.areaInterior || "").trim(),
    areaTotal: String(input.areaTotal || "").trim(),
    tagline: String(input.tagline || "").trim(),
    coverImage: String(input.coverImage || "").trim(),
    gallery: Array.isArray(input.gallery) ? input.gallery : [],
    scenes360: Array.isArray(input.scenes360) ? input.scenes360 : [],
    source: normalizeSource(input),
    featured: Boolean(input.featured),
    published: Boolean(input.published),
    luxuryScore: safeNumber(input.luxuryScore, 85),
    description: String(input.description || "").trim(),
    createdAt: existingCreatedAt || now,
    updatedAt: now,
  };
}

export async function readAdminProperties(): Promise<AdminPropertyRecord[]> {
  await ensureStore();

  const raw = await fs.readFile(ADMIN_PROPERTIES_PATH, "utf8");
  const parsed = JSON.parse(raw) as AdminPropertyRecord[];

  return parsed.sort((a, b) => {
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
}

export async function writeAdminProperties(records: AdminPropertyRecord[]) {
  await ensureStore();

  const sorted = [...records].sort((a, b) => {
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  await fs.writeFile(ADMIN_PROPERTIES_PATH, JSON.stringify(sorted, null, 2), "utf8");
}

export async function upsertAdminProperty(input: AdminPropertyInput) {
  const current = await readAdminProperties();

  const existing = current.find(
    (item) => item.id === input.id || item.slug === input.slug
  );

  const normalized = normalizeRecord(input, existing?.createdAt);

  const next = existing
    ? current.map((item) => (item.id === existing.id ? normalized : item))
    : [normalized, ...current];

  await writeAdminProperties(next);

  return normalized;
}
