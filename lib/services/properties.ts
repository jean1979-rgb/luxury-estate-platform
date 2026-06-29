import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slugify";

type PropertyUpdateInput = Record<string, unknown>;

function asTrimmedString(value: unknown): string {
  return String(value ?? "").trim();
}

function asOptionalString(value: unknown): string | null {
  const trimmed = asTrimmedString(value);
  return trimmed ? trimmed : null;
}

function asBoolean(value: unknown): boolean {
  return value === true;
}

function asOptionalInt(value: unknown): number | null {
  if (value === "" || value === undefined || value === null) return null;
  const parsed = Number.parseInt(String(value), 10);
  return Number.isNaN(parsed) ? null : parsed;
}

function asOptionalFloat(value: unknown): number | null {
  if (value === "" || value === undefined || value === null) return null;
  const parsed = Number.parseFloat(String(value));
  return Number.isNaN(parsed) ? null : parsed;
}

function asJsonObject(value: unknown): Prisma.InputJsonObject | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Prisma.InputJsonObject;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

async function getBrokerContext(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { brokerProfile: true },
  });

  if (!user) return null;

  return {
    user,
    profile: user.brokerProfile,
    isAdmin: user.role === "ADMIN",
  };
}

export async function getBrokerProperty(userId: string, id: string) {
  return prisma.brokerProperty.findFirst({
    where: {
      id,
      ownerBrokerId: userId,
    },
    include: {
      sceneItems: true,
    },
  });
}

export async function deleteBrokerProperty(userId: string, id: string) {
  const existing = await getBrokerProperty(userId, id);
  if (!existing) return null;

  await prisma.brokerProperty.delete({
    where: { id: existing.id },
  });

  return existing.id;
}

export async function updateBrokerProperty(userId: string, id: string, body: PropertyUpdateInput, authRole?: string) {
  const ctx = await getBrokerContext(userId);
  const isAdminOverride = authRole === "ADMIN";
  const effectiveIsAdmin = Boolean(isAdminOverride || ctx?.isAdmin);

  if (!effectiveIsAdmin && (!ctx || !ctx.profile)) {
    throw new Error("BROKER_NOT_FOUND");
  }

  const existing = effectiveIsAdmin
    ? await prisma.brokerProperty.findUnique({
        where: { id },
        include: { sceneItems: true },
      })
    : await getBrokerProperty(userId, id);
  if (!existing) return null;

  const isTokko = existing.sourceProvider === "TOKKO";

  const title = asTrimmedString(body.title);
  if (!title) {
    throw new Error("TITLE_REQUIRED");
  }

  const description = asTrimmedString(body.description);
  const tagline = asTrimmedString(body.tagline);
  const location = asTrimmedString(body.location);
  const propertyType = asTrimmedString(body.propertyType);
  const price = asTrimmedString(body.price);
  const currency = asTrimmedString(body.currency ?? existing.currency ?? "MXN") || "MXN";
  const coverImage = asTrimmedString(body.coverImage);
  const gallery = body.gallery !== undefined ? asStringArray(body.gallery) : Array.isArray(existing.gallery) ? existing.gallery.filter((item): item is string => typeof item === "string") : [];
  const zoneSlug = asTrimmedString(body.zoneSlug);
  const zoneLabel = asTrimmedString(body.zoneLabel);

  const bedrooms = asOptionalInt(body.bedrooms);
  const bathrooms = asOptionalInt(body.bathrooms);
  const halfBathrooms = asOptionalInt(body.halfBathrooms);
  const areaInterior = asOptionalFloat(body.areaInterior);
  const areaTotal = asOptionalFloat(body.areaTotal);

  const featured = asBoolean(body.featured);
  const published = asBoolean(body.published);
  const luxuryScore = asOptionalInt(body.luxuryScore) ?? existing.luxuryScore ?? 85;
  const pemFactors: Prisma.InputJsonObject =
    asJsonObject(body.pemFactors) ?? asJsonObject(existing.pemFactors) ?? {};
  const status = published ? "published" : "draft";
  const publicationStatus = published ? "PUBLISHED" : "DRAFT";

  let slug = existing.slug;

  if (title !== existing.title) {
    let baseSlug = slugify(title);
    if (!baseSlug) baseSlug = `property-${Date.now()}`;

    let candidate = baseSlug;
    let counter = 1;

    while (
      await prisma.brokerProperty.findFirst({
        where: {
          ownerBrokerId: userId,
          slug: candidate,
          NOT: { id: existing.id },
        },
        select: { id: true },
      })
    ) {
      counter += 1;
      candidate = `${baseSlug}-${counter}`;
    }

    slug = candidate;
  }

  return prisma.brokerProperty.update({
    where: { id: existing.id },
    data: {
      title,
      slug,
      status: published ? "published" : "draft",
      publicationStatus,
      propertyType: propertyType || null,
      city: effectiveIsAdmin ? (location || existing.city || "") : ctx!.profile!.city,
      location: location || null,
      zoneSlug: zoneSlug || null,
      zoneLabel: zoneLabel || null,
      price: price || null,
      currency,
      bedrooms,
      bathrooms,
      halfBathrooms,
      areaInterior,
      areaTotal,
      coverImage: coverImage || null,
      gallery,
      tagline: tagline || null,
      description: description || null,

      videoUrl: body.videoUrl !== undefined ? asOptionalString(body.videoUrl) : undefined,
      videoPoster: body.videoPoster !== undefined ? asOptionalString(body.videoPoster) : undefined,
      videoType: body.videoType !== undefined ? asTrimmedString(body.videoType || "upload") : undefined,

      featured,
      published,
      luxuryScore,
      pemFactors,
    },
    include: { sceneItems: true },
  });
}
