import type { AdminHotspot, AdminHotspotType, AdminScene360 } from "@/types/admin";

export type SceneHotspotApi = {
  id?: string;
  pitch?: number;
  yaw?: number;
  label?: string;
  targetSceneId?: string;
  type?: string;
};

export type SceneApi = {
  id?: string;
  title?: string;
  image?: string;
  thumbnail?: string;
  initialYaw?: number;
  initialPitch?: number;
  hotspots?: SceneHotspotApi[];
};

export function isSceneApi(value: unknown): value is SceneApi {
  if (!value || typeof value !== "object") return false;
  return true;
}

export function isSceneHotspotApi(value: unknown): value is SceneHotspotApi {
  if (!value || typeof value !== "object") return false;
  return true;
}

function normalizeHotspotType(_value: unknown): AdminHotspotType {
  return "nav";
}

function mapHotspotFromApi(hotspot: SceneHotspotApi): AdminHotspot {
  return {
    id: hotspot.id || "",
    pitch: typeof hotspot.pitch === "number" ? hotspot.pitch : 0,
    yaw: typeof hotspot.yaw === "number" ? hotspot.yaw : 0,
    label: hotspot.label || "",
    targetSceneId: hotspot.targetSceneId || "",
    type: normalizeHotspotType(hotspot.type),
  };
}

export function mapScenesFromApi(input: unknown): AdminScene360[] {
  const scenes = Array.isArray(input) ? input : [];

  return scenes.filter(isSceneApi).map((scene) => ({
    id: scene.id || "",
    title: scene.title || "",
    image: scene.image || "",
    thumbnail: scene.thumbnail || scene.image || "",
    initialYaw: typeof scene.initialYaw === "number" ? scene.initialYaw : 0,
    initialPitch: typeof scene.initialPitch === "number" ? scene.initialPitch : 0,
    hotspots: Array.isArray(scene.hotspots)
      ? scene.hotspots.filter(isSceneHotspotApi).map(mapHotspotFromApi)
      : [],
  }));
}
