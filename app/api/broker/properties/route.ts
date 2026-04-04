import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, message: "No autenticado." }, { status: 401 });
  }

  const items = await prisma.brokerProperty.findMany({
    where: { ownerBrokerId: session.user.id },
    orderBy: { updatedAt: "desc" },
    include: {
      sceneItems: {
        include: {
          hotspots: {
            orderBy: { createdAt: "asc" },
          },
        },
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  const normalized = items.map((item) => ({
    id: item.id,
    title: item.title,
    slug: item.slug,
    status: item.status === "published" ? "published" : item.status === "archived" ? "archived" : "draft",
    propertyType: (item.propertyType || "villa") as
      | "villa"
      | "penthouse"
      | "residence"
      | "estate"
      | "condo"
      | "land",
    location: item.location || "",
    price: item.price || "",
    currency: item.currency || "MXN",
    bedrooms: item.bedrooms ?? 0,
    bathrooms: item.bathrooms ?? 0,
    areaInterior: item.areaInterior != null ? String(item.areaInterior) : "",
    areaTotal: item.areaTotal != null ? String(item.areaTotal) : "",
    tagline: item.tagline || "",
    coverImage: item.coverImage || "",
    gallery: Array.isArray(item.gallery) ? item.gallery : [],
    scenes360: item.sceneItems.map((scene) => ({
      id: scene.id,
      title: scene.title,
      image: scene.image,
      thumbnail: scene.thumbnail || scene.image,
      initialYaw: scene.initialYaw ?? 0,
      initialPitch: scene.initialPitch ?? 0,
      hotspots: scene.hotspots.map((h) => ({
        id: h.id,
        pitch: h.pitch,
        yaw: h.yaw,
        label: h.label || "",
        targetSceneId: h.targetSceneId || "",
        type: (h.type as
          | "nav"
          | "stairs-up"
          | "stairs-down"
          | "terrace"
          | "room"
          | "amenity"
          | "kitchen"
          | undefined) || "nav",
      })),
    })),
    source: item.source
      ? {
          provider:
            item.source === "TOKKO"
              ? "tokko"
              : item.source === "CSV"
                ? "csv"
                : item.source === "XML"
                  ? "xml"
                  : "manual",
          externalId: item.sourceExternalId || undefined,
        }
      : { provider: "manual" },
    featured: item.featured,
    published: item.published,
    luxuryScore: item.luxuryScore ?? 85,
    description: item.description || "",
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  }));

  return NextResponse.json({ ok: true, items: normalized });
}
