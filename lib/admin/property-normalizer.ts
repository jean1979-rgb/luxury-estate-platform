import type { AdminScene360 } from "@/types/admin";

export function normalizeScenes(
  scenes: AdminScene360[],
  slugify: (v: string) => string
) {
  const normalizedScenes = scenes.map((scene, index) => ({
    ...scene,
    id: slugify(scene.id || scene.title || `scene-${index + 1}`),
    title: scene.title?.trim() || `Escena ${index + 1}`,
    thumbnail: scene.thumbnail || scene.image,
  }));

  const sceneIdAliases = new Map<string, string>();

  normalizedScenes.forEach((scene) => {
    const realId = scene.id;
    const imageName = String(scene.image || "").split("/").pop() || "";
    const imageBase = imageName.replace(/\.[^.]+$/, "");

    [
      realId,
      imageBase,
    ]
      .filter(Boolean)
      .forEach((key) => sceneIdAliases.set(String(key), realId));
  });

  return { normalizedScenes, sceneIdAliases };
}
