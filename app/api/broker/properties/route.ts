export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slugify";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, message: "No autenticado." }, { status: 401 });
  }

  const items = await prisma.brokerProperty.findMany({
    where: session.user.role === "ADMIN" ? {} : { ownerBrokerId: session.user.id },
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

  const normalized = items.map((item: any) => ({
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
    zoneSlug: item.zoneSlug || "",
    zoneLabel: item.zoneLabel || "",
    price: item.price || "",
    currency: item.currency || "MXN",
    bedrooms: item.bedrooms ?? 0,
    bathrooms: item.bathrooms ?? 0,
    areaInterior: item.areaInterior != null ? String(item.areaInterior) : "",
    areaTotal: item.areaTotal != null ? String(item.areaTotal) : "",
    tagline: item.tagline || "",
    coverImage: item.coverImage || "",
    gallery: Array.isArray(item.gallery) ? item.gallery : [],
    videoUrl: item.videoUrl || "",
    videoPoster: item.videoPoster || "",
    videoType: item.videoType || "upload",
    scenes360: item.sceneItems.map((scene: any) => ({
      id: scene.id,
      title: scene.title,
      image: scene.image,
      thumbnail: scene.thumbnail || scene.image,
      initialYaw: scene.initialYaw ?? 0,
      initialPitch: scene.initialPitch ?? 0,
      hotspots: scene.hotspots.map((h: any) => ({
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
          | "living"
          | "bedroom"
          | "bathroom"
          | "pool"
          | "beach"
          | "view"
          | "garden"
          | "parking"
          | "elevator"
          | "gym"
          | "spa"
          | "lobby"
          | "dining"
          | undefined) || "nav",
        size: h.size || "md",
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


export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, message: "No autenticado." }, { status: 401 });
  }

  try {
    const body = await req.json();

    const { updateBrokerProperty } = await import("@/lib/services/properties");

    const id = body.id;

    if (!id) {
      return NextResponse.json({ ok: false, message: "ID requerido" }, { status: 400 });
    }

    let updated = await updateBrokerProperty(session.user.id, id, body, session.user.role);

    if (!updated) {
      const existingById = await prisma.brokerProperty.findUnique({
        where: { id },
        include: { sceneItems: true },
      });

      if (existingById) {
        return NextResponse.json(
          {
            ok: false,
            message:
              existingById.ownerBrokerId === session.user.id
                ? "La propiedad ya existe pero no pudo actualizarse con el flujo actual."
                : "Ya existe una propiedad con ese ID asignada a otro broker.",
          },
          { status: 409 }
        );
      }

      let createSlugBase = slugify(String(body.slug || body.title || id).trim() || id);
      if (!createSlugBase) createSlugBase = String(id);

      let createSlug = createSlugBase;
      let createSlugCounter = 1;

      while (
        await prisma.brokerProperty.findFirst({
          where: {
            ownerBrokerId: session.user.id,
            slug: createSlug,
          },
          select: { id: true },
        })
      ) {
        createSlug = `${createSlugBase}-${createSlugCounter}`;
        createSlugCounter += 1;
      }

      updated = await prisma.brokerProperty.create({
        data: {
          id,
          ownerBrokerId: session.user.id,
          title: String(body.title || "Propiedad").trim() || "Propiedad",
          slug: createSlug,
          status: body.published ? "published" : "draft",
          publicationStatus: body.published ? "PUBLISHED" : "DRAFT",
          propertyType: body.propertyType ? String(body.propertyType).trim() : null,
          city: body.location ? String(body.location).trim() : "",
          location: body.location ? String(body.location).trim() : null,
          zoneSlug: body.zoneSlug ? String(body.zoneSlug).trim() : null,
          zoneLabel: body.zoneLabel ? String(body.zoneLabel).trim() : null,
          price: body.price ? String(body.price).trim() : null,
          currency: String(body.currency || "MXN").trim() || "MXN",
          bedrooms:
            typeof body.bedrooms === "number"
              ? body.bedrooms
              : Number.parseInt(String(body.bedrooms || ""), 10) || 0,
          bathrooms:
            typeof body.bathrooms === "number"
              ? body.bathrooms
              : Number.parseInt(String(body.bathrooms || ""), 10) || 0,
          areaInterior:
            body.areaInterior === "" || body.areaInterior === undefined || body.areaInterior === null
              ? null
              : Number.parseFloat(String(body.areaInterior)),
          areaTotal:
            body.areaTotal === "" || body.areaTotal === undefined || body.areaTotal === null
              ? null
              : Number.parseFloat(String(body.areaTotal)),
          coverImage: body.coverImage ? String(body.coverImage).trim() : null,
          gallery: Array.isArray(body.gallery) ? body.gallery : [],
          tagline: body.tagline ? String(body.tagline).trim() : null,
          description: body.description ? String(body.description).trim() : null,
          videoUrl: body.videoUrl ? String(body.videoUrl).trim() : null,
          videoPoster: body.videoPoster ? String(body.videoPoster).trim() : null,
          videoType: String(body.videoType || "upload").trim() || "upload",
          featured: body.featured === true,
          published: body.published === true,
          luxuryScore:
            typeof body.luxuryScore === "number"
              ? body.luxuryScore
              : Number.parseInt(String(body.luxuryScore || ""), 10) || 85,
          sourceProvider:
            String(body.source?.provider || "").toLowerCase() === "tokko" || String(id).startsWith("admin-")
              ? "TOKKO"
              : null,
          sourceExternalId:
            typeof body.source?.externalId === "string" && body.source.externalId.trim()
              ? body.source.externalId.trim()
              : String(id).startsWith("admin-")
                ? String(id).replace(/^admin-/, "")
                : null,
        },
    include: { sceneItems: true },
  });
    }

    const normalized = {
      id: updated.id,
      title: updated.title,
      slug: updated.slug,
      status: updated.status,
      propertyType: updated.propertyType || "villa",
      location: updated.location || "",
      zoneSlug: updated.zoneSlug || "",
      zoneLabel: updated.zoneLabel || "",
      price: updated.price || "",
      currency: updated.currency || "MXN",
      bedrooms: updated.bedrooms ?? 0,
      bathrooms: updated.bathrooms ?? 0,
      areaInterior: updated.areaInterior != null ? String(updated.areaInterior) : "",
      areaTotal: updated.areaTotal != null ? String(updated.areaTotal) : "",
      tagline: updated.tagline || "",
      coverImage: updated.coverImage || "",
      gallery: Array.isArray(updated.gallery) ? updated.gallery : [],
      videoUrl: updated.videoUrl || "",
      videoPoster: updated.videoPoster || "",
      videoType: updated.videoType || "upload",
      scenes360: Array.isArray((updated as any).sceneItems) ? (updated as any).sceneItems.sort((a: any, b: any) => a.sortOrder - b.sortOrder) : [],
      source: updated.sourceProvider
        ? {
            provider:
              updated.sourceProvider === "TOKKO"
                ? "tokko"
                : updated.sourceProvider === "CSV"
                  ? "csv"
                  : updated.sourceProvider === "XML"
                    ? "xml"
                    : "manual",
            externalId: updated.sourceExternalId || undefined,
          }
        : { provider: "manual" },
      featured: updated.featured,
      published: updated.published,
      luxuryScore: updated.luxuryScore ?? 85,
      description: updated.description || "",
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    };

    return NextResponse.json({
      ok: true,
      property: normalized,
    });
  } catch (err) {
    return NextResponse.json({
      ok: false,
      message: err instanceof Error ? err.message : "Error inesperado",
    }, { status: 500 });
  }
}
