import type { AdminPropertyInput, AdminScene360 } from "@/types/admin";

export function buildPropertyPayload(params: {
  form: AdminPropertyInput;
  normalizedScenes: AdminScene360[];
  sceneIdAliases: Map<string, string>;
  slugify: (value: string) => string;
}): AdminPropertyInput {
  const { form, normalizedScenes, sceneIdAliases, slugify } = params;

  return {
    source: { provider: "manual" },
    ...form,
    videoType: "upload",
    id: form.id ? slugify(form.id) : slugify(form.slug || form.title),
    slug: slugify(form.slug || form.title),
    title: form.title.trim(),
    scenes360: normalizedScenes.map((scene, index) => ({
      ...scene,
      id: scene.id,
      title: scene.title,
      thumbnail: scene.thumbnail || scene.image,
      hotspots: (Array.isArray(scene.hotspots) ? scene.hotspots : []).map((hotspot, hotspotIndex) => {
        const rawTarget = String(hotspot.targetSceneId || "").trim();
        const normalizedTarget =
          sceneIdAliases.get(rawTarget) ||
          sceneIdAliases.get(slugify(rawTarget)) ||
          rawTarget;

        return {
          id: slugify(hotspot.id || `hotspot-${hotspotIndex + 1}`),
          pitch: Number.isFinite(Number(hotspot.pitch)) ? Number(hotspot.pitch) : 0,
          yaw: Number.isFinite(Number(hotspot.yaw)) ? Number(hotspot.yaw) : 0,
          label: String(hotspot.label || `Hotspot ${hotspotIndex + 1}`).trim(),
          targetSceneId: normalizedTarget || "",
          type: hotspot.type || "nav",
        };
      }),
    })),
  };
}
