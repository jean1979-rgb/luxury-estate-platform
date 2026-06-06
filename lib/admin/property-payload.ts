import type { AdminPropertyInput } from "@/types/admin";

type BuildPropertyPayloadParams = {
  form: AdminPropertyInput;
  normalizedScenes?: AdminPropertyInput["scenes360"];
  sceneIdAliases?: Map<string, string>;
  slugify: (value: string) => string;
};

function asNumber(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function normalizeTargetSceneId(
  value: unknown,
  sceneIdAliases?: Map<string, string>
): string {
  const raw = typeof value === "string" ? value.trim() : "";
  if (!raw) return "";
  return sceneIdAliases?.get(raw) || raw;
}

export function buildPropertyPayload({
  form,
  normalizedScenes,
  sceneIdAliases,
  slugify,
}: BuildPropertyPayloadParams): AdminPropertyInput {
  const scenes = Array.isArray(normalizedScenes) ? normalizedScenes : Array.isArray(form.scenes360) ? form.scenes360 : [];

  return {
    ...form,
    slug: slugify(form.slug || form.title || form.id || "propiedad"),
    zoneSlug: String(form.zoneSlug || "").trim(),
    zoneLabel: String(form.zoneLabel || "").trim(),
    scenes360: scenes.map((scene, index) => ({
      ...scene,
      id: scene.id ? slugify(scene.id) : `scene-${index + 1}`,
      title: scene.title || `Escena ${index + 1}`,
      image: scene.image || "",
      thumbnail: scene.thumbnail || scene.image || "",
      initialYaw: asNumber(scene.initialYaw, 0),
      initialPitch: asNumber(scene.initialPitch, 0),
      hotspots: Array.isArray(scene.hotspots)
        ? scene.hotspots.map((hotspot, hotspotIndex) => ({
            ...hotspot,
            id: hotspot.id ? slugify(hotspot.id) : `hotspot-${index + 1}-${hotspotIndex + 1}`,
            label: hotspot.label || `Hotspot ${hotspotIndex + 1}`,
            targetSceneId: normalizeTargetSceneId(hotspot.targetSceneId, sceneIdAliases),
            type: hotspot.type || "nav",
            pitch: asNumber(hotspot.pitch, 0),
            yaw: asNumber(hotspot.yaw, 0),
          }))
        : [],
    })),
  };
}
