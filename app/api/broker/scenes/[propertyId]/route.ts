import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ propertyId: string }> | { propertyId: string };
};

export async function GET(_: NextRequest, context: RouteContext) {
  const resolvedParams = await context.params;
  const propertyId = String(resolvedParams?.propertyId || "").trim();

  if (!propertyId) {
    return NextResponse.json(
      { ok: false, message: "propertyId inválido" },
      { status: 400 }
    );
  }

  const scenes = await prisma.propertyScene360.findMany({
    where: { propertyId },
    include: { hotspots: true },
    orderBy: { sortOrder: "asc" },
  });

  return NextResponse.json({ ok: true, scenes });
}

export async function POST(req: NextRequest, context: RouteContext) {
  const resolvedParams = await context.params;
  const propertyId = String(resolvedParams?.propertyId || "").trim();

  if (!propertyId) {
    return NextResponse.json(
      { ok: false, message: "propertyId inválido" },
      { status: 400 }
    );
  }

  const body = await req.json();
  const scenes = Array.isArray(body?.scenes) ? body.scenes : [];

  await prisma.sceneHotspot.deleteMany({
    where: {
      scene: { propertyId },
    },
  });

  await prisma.propertyScene360.deleteMany({
    where: { propertyId },
  });

  let sortOrder = 0;

  for (const scene of scenes) {
    const created = await prisma.propertyScene360.create({
      data: {
        propertyId,
        title: String(scene?.title || "Scene").trim(),
        image: String(scene?.image || "").trim(),
        thumbnail: String(scene?.thumbnail || scene?.image || "").trim() || null,
        initialYaw: typeof scene?.initialYaw === "number" ? scene.initialYaw : 0,
        initialPitch: typeof scene?.initialPitch === "number" ? scene.initialPitch : 0,
        sortOrder,
      },
    });

    sortOrder += 1;

    const hotspots = Array.isArray(scene?.hotspots) ? scene.hotspots : [];

    for (const h of hotspots) {
      await prisma.sceneHotspot.create({
        data: {
          sceneId: created.id,
          pitch: typeof h?.pitch === "number" ? h.pitch : 0,
          yaw: typeof h?.yaw === "number" ? h.yaw : 0,
          label: typeof h?.label === "string" ? h.label : "",
          targetSceneId:
            typeof h?.targetSceneId === "string" && h.targetSceneId.trim()
              ? h.targetSceneId.trim()
              : null,
          type: typeof h?.type === "string" && h.type.trim() ? h.type.trim() : "nav",
        },
      });
    }
  }

  return NextResponse.json({ ok: true, count: scenes.length });
}
