import { prisma } from "@/lib/prisma";

type SceneHotspotInput = {
  pitch?: number;
  yaw?: number;
  label?: string;
  targetSceneId?: string | null;
  type?: string;
};

type SceneInput = {
  id?: string;
  title?: string;
  image?: string;
  thumbnail?: string | null;
  initialYaw?: number;
  initialPitch?: number;
  hotspots?: SceneHotspotInput[];
};

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value.trim() : fallback;
}

export async function getScenes(propertyId: string) {
  return prisma.propertyScene360.findMany({
    where: { propertyId },
    include: { hotspots: true },
    orderBy: { sortOrder: "asc" },
  });
}

export async function replaceScenes(propertyId: string, scenes: SceneInput[]) {
  await prisma.sceneHotspot.deleteMany({
    where: { scene: { propertyId } },
  });

  await prisma.propertyScene360.deleteMany({
    where: { propertyId },
  });

  let sortOrder = 0;

  for (const scene of scenes) {
    const sceneId = asString(scene.id, "");
    const title = asString(scene.title, "Scene");
    const image = asString(scene.image, "");
    const thumbnail = asString(scene.thumbnail, image) || null;
    const initialYaw = asNumber(scene.initialYaw, 0);
    const initialPitch = asNumber(scene.initialPitch, 0);

    const created = await prisma.propertyScene360.create({
      data: {
        ...(sceneId ? { id: sceneId } : {}),
        propertyId,
        title,
        image,
        thumbnail,
        initialYaw,
        initialPitch,
        sortOrder,
      },
    });

    sortOrder += 1;

    const hotspots = Array.isArray(scene.hotspots) ? scene.hotspots : [];

    for (const hotspot of hotspots) {
      const rawTarget = asString(hotspot.targetSceneId, "").trim();

      const validTarget =
        rawTarget && scenes.some((s) => asString(s.id, "") === rawTarget)
          ? rawTarget
          : null;

      await prisma.sceneHotspot.create({
        data: {
          sceneId: created.id,
          pitch: asNumber(hotspot.pitch, 0),
          yaw: asNumber(hotspot.yaw, 0),
          label: asString(hotspot.label, ""),
          targetSceneId: validTarget,
          type: asString(hotspot.type, "nav"),
        },
      });
    }
  }

  return scenes.length;
}
