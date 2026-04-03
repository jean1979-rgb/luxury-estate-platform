import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function normalizeText(value) {
  return String(value || "").trim();
}

function parseNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  const raw = String(value).replace(/[^0-9.-]/g, "");
  if (!raw) return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseInteger(value) {
  const parsed = parseNumber(value);
  if (parsed === null) return null;
  return Math.round(parsed);
}

function firstNonEmpty(...values) {
  for (const value of values) {
    const text = normalizeText(value);
    if (text) return text;
  }
  return "";
}

function extractImages(item) {
  const candidates = Array.isArray(item?.photos)
    ? item.photos
    : Array.isArray(item?.objects)
      ? item.objects
      : [];

  const images = candidates
    .map((photo) =>
      firstNonEmpty(
        photo?.image,
        photo?.url,
        photo?.original,
        photo?.big,
        photo?.medium,
        photo?.small
      )
    )
    .filter(Boolean);

  return Array.from(new Set(images));
}

function slugify(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function mapTokkoItem(item, brokerCity) {
  const externalId = String(
    item?.id ?? item?.id_property ?? item?.pk ?? ""
  ).trim();

  const title = firstNonEmpty(
    item?.publication_title,
    item?.title,
    item?.address,
    item?.location?.name,
    `Propiedad Tokko ${externalId || "sin-id"}`
  );

  const description = firstNonEmpty(
    item?.description,
    item?.public_description,
    item?.observations
  );

  const propertyType = firstNonEmpty(
    item?.type?.name,
    item?.type,
    item?.property_type?.name,
    item?.property_type
  );

  const location = firstNonEmpty(
    item?.location?.full_location,
    item?.location?.name,
    item?.address,
    item?.real_address
  );

  const priceValue =
    item?.operations?.[0]?.prices?.[0]?.price ??
    item?.operations?.[0]?.price ??
    item?.price ??
    item?.price_from ??
    "";

  const currency =
    firstNonEmpty(
      item?.operations?.[0]?.prices?.[0]?.currency,
      item?.operations?.[0]?.currency,
      item?.currency
    ) || "MXN";

  const bedrooms =
    parseInteger(item?.suite_amount) ??
    parseInteger(item?.room_amount) ??
    parseInteger(item?.bedrooms);

  const bathrooms =
    parseInteger(item?.bathroom_amount) ??
    parseInteger(item?.bathrooms);

  const areaTotal =
    parseNumber(item?.total_surface) ??
    parseNumber(item?.surface_total) ??
    parseNumber(item?.roofed_surface);

  const areaInterior =
    parseNumber(item?.roofed_surface) ??
    parseNumber(item?.covered_surface);

  const images = extractImages(item);
  const coverImage = images[0] || null;

  return {
    externalId,
    title,
    description: description || null,
    propertyType: propertyType || null,
    location: location || null,
    price: priceValue === null || priceValue === undefined ? null : String(priceValue),
    currency,
    bedrooms,
    bathrooms,
    areaInterior,
    areaTotal,
    coverImage,
    gallery: images,
    city: brokerCity,
  };
}

async function generateUniqueSlug(ownerBrokerId, title, currentId) {
  let baseSlug = slugify(title);
  if (!baseSlug) baseSlug = `property-${Date.now()}`;

  let candidate = baseSlug;
  let counter = 1;

  while (
    await prisma.brokerProperty.findFirst({
      where: {
        ownerBrokerId,
        slug: candidate,
        ...(currentId ? { NOT: { id: currentId } } : {}),
      },
      select: { id: true },
    })
  ) {
    counter += 1;
    candidate = `${baseSlug}-${counter}`;
  }

  return candidate;
}

const brokerUserId = process.env.BROKER_USER_ID;

if (!brokerUserId) {
  console.error("Falta BROKER_USER_ID");
  process.exit(1);
}

const user = await prisma.user.findUnique({
  where: { id: brokerUserId },
  include: { brokerProfile: true },
});

if (!user?.brokerProfile) {
  console.error("Broker no encontrado");
  process.exit(1);
}

const profile = user.brokerProfile;

if (!profile.tokkoEnabled) {
  console.error("Tokko no habilitado por admin");
  process.exit(1);
}

if (!profile.tokkoApiKey) {
  console.error("Broker sin tokkoApiKey");
  process.exit(1);
}

const url = `https://www.tokkobroker.com/api/v1/property/?lang=es_ar&format=json&limit=200&key=${profile.tokkoApiKey}`;
const res = await fetch(url, { cache: "no-store" });

if (!res.ok) {
  console.error(`Tokko HTTP ${res.status}`);
  process.exit(1);
}

const data = await res.json();
const objects = Array.isArray(data?.objects) ? data.objects : [];

let created = 0;
let updated = 0;
let skipped = 0;

for (const rawItem of objects) {
  const mapped = mapTokkoItem(rawItem, profile.city);

  if (!mapped.externalId || !mapped.title) {
    skipped += 1;
    continue;
  }

  const existing = await prisma.brokerProperty.findFirst({
    where: {
      ownerBrokerId: user.id,
      sourceProvider: "TOKKO",
      sourceExternalId: mapped.externalId,
    },
  });

  if (existing) {
    const nextSlug =
      existing.title === mapped.title
        ? existing.slug
        : await generateUniqueSlug(user.id, mapped.title, existing.id);

    await prisma.brokerProperty.update({
      where: { id: existing.id },
      data: {
        title: mapped.title,
        slug: nextSlug,
        source: "TOKKO",
        sourceProvider: "TOKKO",
        sourceExternalId: mapped.externalId,
        propertyType: mapped.propertyType,
        city: mapped.city,
        location: mapped.location,
        price: mapped.price,
        currency: mapped.currency,
        bedrooms: mapped.bedrooms,
        bathrooms: mapped.bathrooms,
        areaInterior: mapped.areaInterior,
        areaTotal: mapped.areaTotal,
        coverImage: mapped.coverImage,
        gallery: mapped.gallery,
        description: mapped.description,
      },
    });

    updated += 1;
    continue;
  }

  const slug = await generateUniqueSlug(user.id, mapped.title);

  await prisma.brokerProperty.create({
    data: {
      ownerBrokerId: user.id,
      title: mapped.title,
      slug,
      status: "draft",
      publicationStatus: "DRAFT",
      source: "TOKKO",
      sourceProvider: "TOKKO",
      sourceExternalId: mapped.externalId,
      propertyType: mapped.propertyType,
      city: mapped.city,
      location: mapped.location,
      price: mapped.price,
      currency: mapped.currency,
      bedrooms: mapped.bedrooms,
      bathrooms: mapped.bathrooms,
      areaInterior: mapped.areaInterior,
      areaTotal: mapped.areaTotal,
      coverImage: mapped.coverImage,
      gallery: mapped.gallery,
      scenes360: [],
      description: mapped.description,
      featured: false,
      published: false,
    },
  });

  created += 1;
}

await prisma.brokerProfile.update({
  where: { id: profile.id },
  data: { tokkoLastSyncAt: new Date() },
});

console.log(JSON.stringify({
  ok: true,
  brokerUserId: user.id,
  brokerProfileId: profile.id,
  fetched: objects.length,
  created,
  updated,
  skipped,
}, null, 2));

await prisma.$disconnect();
