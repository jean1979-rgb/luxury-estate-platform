import type { AdminScene360, AdminHotspot } from "@/types/admin";

export function buildScene(title = "", image = "", slugify: (v: string) => string): AdminScene360 {
  const base = slugify(title || `scene-${Date.now()}`);
  return {
    id: base || `scene-${Date.now()}`,
    title: title || "Nueva escena",
    image,
    thumbnail: image,
    initialYaw: 0,
    initialPitch: 0,
    hotspots: [],
  };
}

export function buildHotspot(index: number, pitch: number, yaw: number): AdminHotspot {
  return {
    id: `hotspot-${Date.now()}-${index + 1}`,
    pitch,
    yaw,
    label: "Destino",
    targetSceneId: "",
    type: "nav",
  };
}

export function addScene(scenes: AdminScene360[], scene: AdminScene360) {
  return [...scenes, scene];
}

export function removeScene(scenes: AdminScene360[], index: number) {
  return scenes.filter((_, i) => i !== index);
}

export function updateScene(
  scenes: AdminScene360[],
  index: number,
  patch: Partial<AdminScene360>,
  slugify: (v: string) => string
) {
  return scenes.map((scene, i) => {
    if (i !== index) return scene;

    const nextTitle = patch.title ?? scene.title;
    const nextImage = patch.image ?? scene.image;

    return {
      ...scene,
      ...patch,
      id: patch.id ? slugify(patch.id) : scene.id,
      title: nextTitle,
      image: nextImage,
      thumbnail: patch.thumbnail ?? nextImage ?? scene.thumbnail,
      hotspots: Array.isArray(patch.hotspots) ? patch.hotspots : scene.hotspots,
    };
  });
}

export function addHotspot(
  scenes: AdminScene360[],
  sceneIndex: number,
  hotspot: AdminHotspot
) {
  return scenes.map((scene, i) => {
    if (i !== sceneIndex) return scene;
    return {
      ...scene,
      hotspots: [...scene.hotspots, hotspot],
    };
  });
}

export function updateHotspot(
  scenes: AdminScene360[],
  sceneIndex: number,
  hotspotIndex: number,
  patch: Partial<AdminHotspot>,
  slugify: (v: string) => string
) {
  return scenes.map((scene, i) => {
    if (i !== sceneIndex) return scene;

    return {
      ...scene,
      hotspots: scene.hotspots.map((hotspot, j) => {
        if (j !== hotspotIndex) return hotspot;

        return {
          ...hotspot,
          ...patch,
          id: patch.id ? slugify(patch.id) : hotspot.id,
          pitch:
            patch.pitch !== undefined
              ? Number(patch.pitch)
              : hotspot.pitch,
          yaw:
            patch.yaw !== undefined
              ? Number(patch.yaw)
              : hotspot.yaw,
        };
      }),
    };
  });
}

export function removeHotspot(
  scenes: AdminScene360[],
  sceneIndex: number,
  hotspotIndex: number
) {
  return scenes.map((scene, i) => {
    if (i !== sceneIndex) return scene;
    return {
      ...scene,
      hotspots: scene.hotspots.filter((_, j) => j !== hotspotIndex),
    };
  });
}
