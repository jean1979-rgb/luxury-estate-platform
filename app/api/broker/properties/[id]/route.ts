import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  getBrokerProperty,
  updateBrokerProperty,
  deleteBrokerProperty,
} from "@/lib/services/properties";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, message: "No autenticado." }, { status: 401 });
  }

  const { id } = await context.params;
  const item = await getBrokerProperty(session.user.id, id);

  if (!item) {
    return NextResponse.json({ ok: false, message: "Propiedad no encontrada." }, { status: 404 });
  }

  return NextResponse.json({ ok: true, item });
}

export async function PATCH(req: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, message: "No autenticado." }, { status: 401 });
  }

  const { id } = await context.params;
  const body = await req.json();

  try {
    const item = await updateBrokerProperty(session.user.id, id, body);

    if (!item) {
      return NextResponse.json({ ok: false, message: "Propiedad no encontrada." }, { status: 404 });
    }

    const hydrated = await prisma.brokerProperty.findFirst({
      where: {
        id,
        ownerBrokerId: session.user.id,
      },
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

    if (!hydrated) {
      return NextResponse.json({ ok: false, message: "Propiedad no encontrada tras guardar." }, { status: 404 });
    }

    const normalized = {
      id: hydrated.id,
      title: hydrated.title,
      slug: hydrated.slug,
      status: hydrated.status === "published" ? "published" : hydrated.status === "archived" ? "archived" : "draft",
      propertyType: hydrated.propertyType || "villa",
      location: hydrated.location || "",
      price: hydrated.price || "",
      currency: hydrated.currency || "MXN",
      bedrooms: hydrated.bedrooms ?? 0,
      bathrooms: hydrated.bathrooms ?? 0,
      areaInterior: hydrated.areaInterior != null ? String(hydrated.areaInterior) : "",
      areaTotal: hydrated.areaTotal != null ? String(hydrated.areaTotal) : "",
      tagline: hydrated.tagline || "",
      coverImage: hydrated.coverImage || "",
      gallery: Array.isArray(hydrated.gallery) ? hydrated.gallery : [],
      videoUrl: hydrated.videoUrl || "",
      videoPoster: hydrated.videoPoster || "",
      videoType: hydrated.videoType || "upload",
      scenes360: hydrated.sceneItems.map((scene) => ({
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
          type: h.type || "nav",
        })),
      })),
      source: hydrated.sourceProvider
        ? {
            provider:
              hydrated.sourceProvider === "TOKKO"
                ? "tokko"
                : hydrated.sourceProvider === "CSV"
                  ? "csv"
                  : hydrated.sourceProvider === "XML"
                    ? "xml"
                    : "manual",
            externalId: hydrated.sourceExternalId || undefined,
          }
        : { provider: "manual" },
      featured: hydrated.featured,
      published: hydrated.published,
      luxuryScore: hydrated.luxuryScore ?? 85,
      description: hydrated.description || "",
      createdAt: hydrated.createdAt.toISOString(),
      updatedAt: hydrated.updatedAt.toISOString(),
    };

    return NextResponse.json({ ok: true, item: normalized });
  } catch (error) {
    const message = error instanceof Error ? error.message : "PATCH_FAILED";
    return NextResponse.json({ ok: false, message }, { status: 400 });
  }
}

export async function DELETE(_: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, message: "No autenticado." }, { status: 401 });
  }

  const { id } = await context.params;
  const deletedId = await deleteBrokerProperty(session.user.id, id);

  if (!deletedId) {
    return NextResponse.json({ ok: false, message: "Propiedad no encontrada." }, { status: 404 });
  }

  return NextResponse.json({ ok: true, deletedId });
}
