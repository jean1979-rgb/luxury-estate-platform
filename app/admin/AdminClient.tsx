"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type {
  AdminHotspot,
  AdminPropertyInput,
  AdminPropertyRecord,
  AdminScene360,
} from "@/types/admin";
import { EMPTY_ADMIN_PROPERTY } from "@/types/admin";
import AdminMediaTabs from "@/components/admin/AdminMediaTabs";

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function formatUpdatedAt(value?: string) {
  if (!value) return "Sin fecha";
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function yawToPercent(yaw: number) {
  return ((yaw + 180) / 360) * 100;
}

function pitchToPercent(pitch: number) {
  return ((90 - pitch) / 180) * 100;
}

function percentToYaw(xPercent: number) {
  return xPercent * 3.6 - 180;
}

function percentToPitch(yPercent: number) {
  return 90 - yPercent * 1.8;
}

type UploadFolder = "cover" | "gallery" | "scenes360";

function buildScene(title = "", image = ""): AdminScene360 {
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

function buildHotspot(index: number, pitch: number, yaw: number): AdminHotspot {
  return {
    id: `hotspot-${Date.now()}-${index + 1}`,
    pitch,
    yaw,
    label: `Hotspot ${index + 1}`,
    targetSceneId: "",
    type: "nav",
  };
}

export default function AdminClient({ forcedPropertyId }: { forcedPropertyId?: string } = {}) {
  const searchParams = useSearchParams();
  const propertyIdFromUrl = forcedPropertyId || searchParams.get("propertyId");
  const [activeHotspotScene, setActiveHotspotScene] = useState<string | null>(null);
  const [items, setItems] = useState<AdminPropertyRecord[]>([]);
  
  async function handleTokkoSync() {
    try {
      const res = await fetch("/api/admin/tokko", { method: "GET" });
      const data = await res.json();

      if (!res.ok) {
        alert("Error al sincronizar Tokko");
        return;
      }

      alert("Tokko actualizado");

      // refrescar lista admin
      const refreshed = await fetch("/api/admin/properties", { cache: "no-store" });
      const json = await refreshed.json();
      setItems(json.properties || []);

    } catch (err) {
      console.error(err);
      alert("Error en sync");
    }
  }

  const [form, setForm] = useState<AdminPropertyInput>(EMPTY_ADMIN_PROPERTY);
  const [selectedId, setSelectedId] = useState<string>("new");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [uploadingScenes, setUploadingScenes] = useState(false);
  const [message, setMessage] = useState<string>("");

  const [tokkoItems, setTokkoItems] = useState<any[]>([]);
  const [hiddenIds, setHiddenIds] = useState<string[]>([]);


  async function loadProperties() {
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/admin/properties", { cache: "no-store" });
      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.message || "No se pudo cargar el admin.");
      }

      setItems(data.properties || []);

      if ((data.properties || []).length > 0 && selectedId === "new") {
        const first = data.properties[0] as AdminPropertyRecord;
        setSelectedId(first.id);
        setForm({
          id: first.id,
          title: first.title,
          slug: first.slug,
          status: first.status,
          propertyType: first.propertyType,
          location: first.location,
          price: first.price,
          currency: first.currency,
          bedrooms: first.bedrooms,
          bathrooms: first.bathrooms,
          areaInterior: first.areaInterior,
          areaTotal: first.areaTotal,
          tagline: first.tagline,
          coverImage: first.coverImage,
          gallery: first.gallery,
          scenes360: first.scenes360,
          featured: first.featured,
          published: first.published,
          luxuryScore: first.luxuryScore,
          description: first.description,
        });
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Error inesperado.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProperties();
    loadTokko();
  }, []);

  useEffect(() => {
    if (!propertyIdFromUrl) return;
    if (!items.length) return;

    const target = items.find((item) => item.id === propertyIdFromUrl);
    if (!target) return;

    handleSelect(target);
  }, [propertyIdFromUrl, items]);

  async function loadTokko() {
    try {
      const res = await fetch("/api/admin/tokko", { cache: "no-store" });
      const data = await res.json();
      setTokkoItems(data.items || []);

      const vis = await fetch("/api/admin/visibility", { cache: "no-store" });
      const vjson = await vis.json();
      setHiddenIds(vjson.hiddenIds || []);
    } catch (e) {
      console.error("Tokko load error", e);
    }
  }


  async function handleDelete() {
  if (!selectedId || selectedId === "new") return;

  const confirmDelete = confirm(
    "¿Seguro que quieres eliminar esta propiedad? Esta acción no se puede deshacer."
  );

  if (!confirmDelete) return;

  try {
    setSaving(true);

    const res = await fetch(`/api/admin/properties/${selectedId}`, {
      method: "DELETE",
    });

    const data = await res.json();

    if (!res.ok || !data.ok) {
      throw new Error(data.message || "Error al eliminar");
    }

    const refreshed = await fetch("/api/admin/properties", {
      cache: "no-store",
    });

    const json = await refreshed.json();

    setItems(json.properties || []);
    setSelectedId("new");
    setForm(EMPTY_ADMIN_PROPERTY);

    setMessage("Propiedad eliminada correctamente");
  } catch (err: any) {
    console.error(err);
    setMessage(err.message || "Error eliminando propiedad");
  } finally {
    setSaving(false);
  }
}

  const selectedRecord = useMemo(() => {
    return items.find((item) => item.id === selectedId) || null;
  }, [items, selectedId]);

  
  async function toggleVisibility(id: string) {
    try {
      const res = await fetch("/api/admin/visibility", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ id })
      });

      const data = await res.json();
      setHiddenIds(data.hiddenIds || []);
    } catch (e) {
      console.error(e);
    }
  }

  async function importFromTokko(item: any) {
    try {
      if (items.some((p) => p.id === `admin-${item.id}`)) {
        alert("Ya importada");
        return;
      }

      const payload: AdminPropertyInput = {
                id: `admin-${item.id}`,
        title: item.editorial?.title || item.base?.title || "Propiedad",
        slug: slugify(item.editorial?.title || item.base?.title || item.id || "propiedad"),
        status: "draft",
        propertyType: "residence",
        location: item.base?.locationLabel || "",
        price: item.base?.price || "",
        currency: item.base?.currency || "MXN",
        bedrooms: 0,
        bathrooms: 0,
        areaInterior: "",
        areaTotal: "",
        tagline: item.editorial?.tagline || item.editorial?.descriptionLuxury || "",
        coverImage: item.base?.images?.[0] || "",
        gallery: Array.isArray(item.base?.images) ? item.base.images : [],
        scenes360: [],
        featured: false,
        published: false,
        luxuryScore: 80,
        description: item.editorial?.descriptionLuxury || item.base?.description || "",
      };

      const res = await fetch("/api/admin/properties", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.message || "No se pudo importar la propiedad.");
      }

      const saved = data.property as AdminPropertyRecord;

      setItems((prev) => {
        const exists = prev.some((entry) => entry.id === saved.id);
        const next = exists
          ? prev.map((entry) => (entry.id === saved.id ? saved : entry))
          : [saved, ...prev];

        return next.sort((a, b) => {
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        });
      });

      setSelectedId(saved.id);
      setForm({
        id: saved.id,
        title: saved.title,
        slug: saved.slug,
        status: saved.status,
        propertyType: saved.propertyType,
        location: saved.location,
        price: saved.price,
        currency: saved.currency,
        bedrooms: saved.bedrooms,
        bathrooms: saved.bathrooms,
        areaInterior: saved.areaInterior,
        areaTotal: saved.areaTotal,
        tagline: saved.tagline,
        coverImage: saved.coverImage,
        gallery: saved.gallery,
        scenes360: saved.scenes360,
        source: saved.source || { provider: "manual" },
        featured: saved.featured,
        published: saved.published,
        luxuryScore: saved.luxuryScore,
        description: saved.description,
      });

      setMessage("Propiedad importada a draft correctamente.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Error importando desde Tokko.");
    }
  }


function handleChange<K extends keyof AdminPropertyInput>(key: K, value: AdminPropertyInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleNew() {
    setSelectedId("new");
    setMessage("");
    setForm({
      ...EMPTY_ADMIN_PROPERTY,
      id: "",
      title: "",
      slug: "",
    });
  }

  function handleSelect(item: AdminPropertyRecord) {
    setSelectedId(item.id);
    setMessage("");
    setForm({
      id: `admin-${item.id}`,
      title: item.title,
      slug: item.slug,
      status: item.status,
      propertyType: item.propertyType,
      location: item.location,
      price: item.price,
      currency: item.currency,
      bedrooms: item.bedrooms,
      bathrooms: item.bathrooms,
      areaInterior: item.areaInterior,
      areaTotal: item.areaTotal,
      tagline: item.tagline,
      coverImage: item.coverImage,
      gallery: item.gallery,
      scenes360: item.scenes360,
      featured: item.featured,
      published: item.published,
      luxuryScore: item.luxuryScore,
      description: item.description,
    });
  }

  async function handleSave() {
    setSaving(true);
    setMessage("");

    try {
      const payload: AdminPropertyInput = {
        source: { provider: "manual" },
        ...form,
        id: form.id ? slugify(form.id) : slugify(form.slug || form.title),
        slug: slugify(form.slug || form.title),
        title: form.title.trim(),
        scenes360: form.scenes360.map((scene, index) => ({
          ...scene,
          id: slugify(scene.id || scene.title || `scene-${index + 1}`),
          title: scene.title?.trim() || `Escena ${index + 1}`,
          thumbnail: scene.thumbnail || scene.image,
          hotspots: (Array.isArray(scene.hotspots) ? scene.hotspots : []).map((hotspot, hotspotIndex) => ({
            id: slugify(hotspot.id || `hotspot-${hotspotIndex + 1}`),
            pitch: Number.isFinite(Number(hotspot.pitch)) ? Number(hotspot.pitch) : 0,
            yaw: Number.isFinite(Number(hotspot.yaw)) ? Number(hotspot.yaw) : 0,
            label: String(hotspot.label || `Hotspot ${hotspotIndex + 1}`).trim(),
            targetSceneId: hotspot.targetSceneId ? slugify(hotspot.targetSceneId) : "",
            type: hotspot.type || "nav",
          })),
        })),
      };

      const res = await fetch("/api/admin/properties", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.message || "No se pudo guardar.");
      }

      const saved = data.property as AdminPropertyRecord;

      setItems((prev) => {
        const exists = prev.some((item) => item.id === saved.id);
        const next = exists
          ? prev.map((item) => (item.id === saved.id ? saved : item))
          : [saved, ...prev];

        return next.sort((a, b) => {
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        });
      });

      setSelectedId(saved.id);
      setForm({
        id: saved.id,
        title: saved.title,
        slug: saved.slug,
        status: saved.status,
        propertyType: saved.propertyType,
        location: saved.location,
        price: saved.price,
        currency: saved.currency,
        bedrooms: saved.bedrooms,
        bathrooms: saved.bathrooms,
        areaInterior: saved.areaInterior,
        areaTotal: saved.areaTotal,
        tagline: saved.tagline,
        coverImage: saved.coverImage,
        gallery: saved.gallery,
        scenes360: saved.scenes360,
        featured: saved.featured,
        published: saved.published,
        luxuryScore: saved.luxuryScore,
        description: saved.description,
      });

      setMessage("Propiedad guardada correctamente en JSON local.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Error inesperado al guardar.");
    } finally {
      setSaving(false);
    }
  }

  async function handleUpload(file: File, folder: UploadFolder) {
    const computedEntityId = slugify(
      form.slug ||
      form.id ||
      (selectedId !== "new" ? selectedId : "") ||
      form.title ||
      "temp-property"
    );

    if (folder === "cover") setUploadingCover(true);
    if (folder === "gallery") setUploadingGallery(true);
    if (folder === "scenes360") setUploadingScenes(true);

    setMessage("");

    try {
      const body = new FormData();
      body.append("file", file);
      body.append("entityType", "property");
      body.append("entityId", computedEntityId);
      body.append("folder", folder);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body,
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.message || "No se pudo subir el archivo.");
      }

      const uploadedUrl = data.file.url as string;

      if (folder === "cover") {
        setForm((prev) => ({
          ...prev,
          id: prev.id || computedEntityId,
          slug: prev.slug || prev.id || computedEntityId,
          coverImage: uploadedUrl,
        }));
      }

      if (folder === "gallery") {
        setForm((prev) => ({
          ...prev,
          id: prev.id || computedEntityId,
          slug: prev.slug || computedEntityId,
          gallery: [...prev.gallery, uploadedUrl],
        }));
      }

      if (folder === "scenes360") {
        const cleanName = file.name.replace(/\.[^/.]+$/, "");
        const scene = buildScene(cleanName, uploadedUrl);

        setForm((prev) => ({
          ...prev,
          id: prev.id || computedEntityId,
          slug: prev.slug || computedEntityId,
          scenes360: [...prev.scenes360, scene],
        }));
      }

      setMessage("Archivo subido correctamente. Guarda la propiedad para persistir la ruta en JSON.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Error inesperado al subir archivo.");
    } finally {
      if (folder === "cover") setUploadingCover(false);
      if (folder === "gallery") setUploadingGallery(false);
      if (folder === "scenes360") setUploadingScenes(false);
    }
  }

  function removeGalleryImage(index: number) {
    setForm((prev) => ({
      ...prev,
      gallery: prev.gallery.filter((_, i) => i !== index),
    }));
  }

  function addEmptyScene() {
    setForm((prev) => ({
      ...prev,
      scenes360: [...prev.scenes360, buildScene(`escena-${prev.scenes360.length + 1}`, "")],
    }));
  }

  function updateScene(index: number, patch: Partial<AdminScene360>) {
    setForm((prev) => ({
      ...prev,
      scenes360: prev.scenes360.map((scene, i) => {
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
      }),
    }));
  }

  function removeScene(index: number) {
    setForm((prev) => ({
      ...prev,
      scenes360: prev.scenes360.filter((_, i) => i !== index),
    }));
  }

  function addHotspotAtCoords(
    sceneIndex: number,
    coords: { pitch: number; yaw: number }
  ) {
    const scene = form.scenes360[sceneIndex];
    if (!scene) return;
    if (!scene.image) {
      setMessage("Primero sube o define una imagen panorámica para esta escena.");
      return;
    }

    const pitch = Number(clamp(Number(coords.pitch), -90, 90).toFixed(2));
    const yaw = Number(clamp(Number(coords.yaw), -180, 180).toFixed(2));
    const hotspot = buildHotspot(scene.hotspots.length, pitch, yaw);

    setForm((prev) => ({
      ...prev,
      scenes360: prev.scenes360.map((currentScene, i) => {
        if (i !== sceneIndex) return currentScene;
        return {
          ...currentScene,
          hotspots: [...currentScene.hotspots, hotspot],
        };
      }),
    }));

    setMessage("Hotspot creado en el visor 360. Ajusta label y destino antes de guardar.");
  }

  function updateHotspot(
    sceneIndex: number,
    hotspotIndex: number,
    patch: Partial<AdminHotspot>
  ) {
    setForm((prev) => ({
      ...prev,
      scenes360: prev.scenes360.map((scene, i) => {
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
                  ? Number(clamp(Number(patch.pitch), -90, 90).toFixed(2))
                  : hotspot.pitch,
              yaw:
                patch.yaw !== undefined
                  ? Number(clamp(Number(patch.yaw), -180, 180).toFixed(2))
                  : hotspot.yaw,
              label: patch.label !== undefined ? patch.label : hotspot.label,
              targetSceneId:
                patch.targetSceneId !== undefined
                  ? slugify(patch.targetSceneId)
                  : hotspot.targetSceneId,
              type:
                patch.type !== undefined
                  ? patch.type
                  : hotspot.type || "nav",
            };
          }),
        };
      }),
    }));
  }

  function removeHotspot(sceneIndex: number, hotspotIndex: number) {
    setForm((prev) => ({
      ...prev,
      scenes360: prev.scenes360.map((scene, i) => {
        if (i !== sceneIndex) return scene;
        return {
          ...scene,
          hotspots: scene.hotspots.filter((_, j) => j !== hotspotIndex),
        };
      }),
    }));
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-[1600px] gap-6 px-6 py-6">
        <aside className="flex w-[360px] shrink-0 flex-col overflow-hidden rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-xl">
          <div className="border-b border-white/10 px-6 py-6">
            <div className="mb-2 text-[11px] uppercase tracking-[0.35em] text-white/45">
              Private Admin

<button
  onClick={handleTokkoSync}
  style={{
    background: "#111",
    color: "#fff",
    padding: "10px 16px",
    borderRadius: "8px",
    marginBottom: "16px",
    cursor: "pointer"
  }}
>
  Actualizar desde Tokko
</button>

            </div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Luxury Property Console
            </h1>
            <p className="mt-2 text-sm leading-6 text-white/60">
              Base local premium para crear, editar media, escenas 360 y hotspots.
            </p>
          </div>

          <div className="border-b border-white/10 p-4">
            <button
              onClick={handleNew}
              className="w-full rounded-2xl border border-white/15 bg-white px-4 py-3 text-sm font-medium text-black transition hover:opacity-90"
            >
              + Nueva propiedad
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <div className="mb-3 text-[11px] uppercase tracking-[0.3em] text-white/35">
              Inventario local
            </div>

            {loading ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/60">
                Cargando propiedades...
              </div>
            ) : items.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/60">
                Aún no hay propiedades guardadas.
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item) => {
                  const active = item.id === selectedId;

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item)}
                      className={[
                        "w-full rounded-2xl border p-4 text-left transition",
                        active
                          ? "border-white/30 bg-white/12"
                          : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]",
                      ].join(" ")}
                    >
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <span className="text-xs uppercase tracking-[0.25em] text-white/40">
                          {item.propertyType}
                        </span>
                        <span
                          className={[
                            "rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[0.25em]",
                            item.published
                              ? "bg-emerald-500/15 text-emerald-300"
                              : "bg-amber-500/15 text-amber-300",
                          ].join(" ")}
                        >
                          {item.published ? "published" : "draft"}
                        </span>
                      </div>

                      <div className="text-base font-medium leading-6 text-white">
                        {item.title}
                      </div>

                      <div className="mt-1 text-sm text-white/55">{item.location}</div>

                      <div className="mt-3 flex items-center justify-between text-xs text-white/40">
                        <span>{item.price || "Sin precio"}</span>
                        <span>{formatUpdatedAt(item.updatedAt)}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        
          <div className="border-t border-white/10 p-4">
            <div className="mb-3 text-[11px] uppercase tracking-[0.3em] text-white/35">
              Tokko Feed
            </div>

            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {tokkoItems.map((item) => {
                const hidden = hiddenIds.includes(item.id);

                return (
                  <div
                    key={item.id}
                    className="rounded-xl border border-white/10 bg-white/[0.03] p-3"
                  >
                    <div className="text-sm text-white">{item.title}</div>

                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <button
                        onClick={() => toggleVisibility(item.id)}
                        className={[
                          "w-full rounded-lg px-3 py-2 text-xs uppercase",
                          hidden
                            ? "bg-emerald-500/20 text-emerald-300"
                            : "bg-red-500/20 text-red-300"
                        ].join(" ")}
                      >
                        {hidden ? "Mostrar" : "Ocultar"}
                      </button>

                      <button
                        onClick={() => importFromTokko(item)}
                        className="w-full rounded-lg bg-white/10 px-3 py-2 text-xs uppercase text-white hover:bg-white/20"
                      >
                        Importar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

</aside>

        <main className="flex-1">
          <div className="overflow-hidden rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-xl">
            <div className="border-b border-white/10 px-8 py-7">
              <div className="mb-2 text-[11px] uppercase tracking-[0.35em] text-white/45">
                Step 4
              </div>

              <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <h2 className="text-3xl font-semibold tracking-tight">
                    {selectedRecord ? "Editar propiedad" : "Nueva propiedad"}
                  </h2>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-white/60">
                    Ahora el admin ya puede crear hotspots visuales sobre el panorama,
                    con coordenadas listas para tu viewer 360 propio.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleChange("slug", slugify(form.title))}
                    className="rounded-2xl border border-white/15 px-4 py-3 text-sm text-white/80 transition hover:bg-white/10"
                  >
                    Generar slug
                  </button>

                  {selectedId !== "new" && (

                    <button

                      type="button"

                      onClick={handleDelete}

                      className="rounded-2xl border border-red-500/40 bg-red-600/20 px-4 py-3 text-sm font-medium text-red-100 transition hover:bg-red-600/30"

                    >

                      Eliminar propiedad

                    </button>

                  )}

                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="rounded-2xl bg-white px-5 py-3 text-sm font-medium text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? "Guardando..." : "Guardar propiedad"}
                  </button>
                </div>
              </div>

              {message ? (
                <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/75">
                  {message}
                </div>
              ) : null}
            </div>

            <div className="grid gap-6 p-8 xl:grid-cols-[1.15fr_0.85fr]">
              <section className="space-y-6">
                <div className="rounded-[28px] border border-white/10 bg-black/20 p-6">
                  <div className="mb-5 text-[11px] uppercase tracking-[0.3em] text-white/35">
                    Core identity
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <label className="block">
                      <span className="mb-2 block text-sm text-white/65">Título</span>
                      <input
                        value={form.title}
                        onChange={(e) => handleChange("title", e.target.value)}
                        className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-white/25"
                        placeholder="Villa frente al mar..."
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-sm text-white/65">Slug</span>
                      <input
                        value={form.slug}
                        onChange={(e) => handleChange("slug", e.target.value)}
                        className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-white/25"
                        placeholder="villa-frente-al-mar"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-sm text-white/65">ID interno</span>
                      <input
                        value={form.id}
                        onChange={(e) => handleChange("id", e.target.value)}
                        className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-white/25"
                        placeholder="villa-frente-al-mar"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-sm text-white/65">Tipo</span>
                      <select
                        value={form.propertyType}
                        onChange={(e) => handleChange("propertyType", e.target.value as AdminPropertyInput["propertyType"])}
                        className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition focus:border-white/25"
                      >
                        <option value="villa">Villa</option>
                        <option value="penthouse">Penthouse</option>
                        <option value="residence">Residence</option>
                        <option value="estate">Estate</option>
                        <option value="condo">Condo</option>
                        <option value="land">Land</option>
                      </select>
                    </label>

                    <label className="block md:col-span-2">
                      <span className="mb-2 block text-sm text-white/65">Ubicación</span>
                      <input
                        value={form.location}
                        onChange={(e) => handleChange("location", e.target.value)}
                        className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-white/25"
                        placeholder="Acapulco Diamante, Guerrero"
                      />
                    </label>

                    <label className="block md:col-span-2">
                      <span className="mb-2 block text-sm text-white/65">Tagline editorial</span>
                      <input
                        value={form.tagline}
                        onChange={(e) => handleChange("tagline", e.target.value)}
                        className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-white/25"
                        placeholder="Una narrativa de lujo con mar, arquitectura y privacidad."
                      />
                    </label>
                  </div>
                </div>

                <div className="rounded-[28px] border border-white/10 bg-black/20 p-6">
                  <div className="mb-5 text-[11px] uppercase tracking-[0.3em] text-white/35">
                    Comercial
                  </div>

                  <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
                    <label className="block lg:col-span-2">
                      <span className="mb-2 block text-sm text-white/65">Precio</span>
                      <input
                        value={form.price}
                        onChange={(e) => handleChange("price", e.target.value)}
                        className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-white/25"
                        placeholder="MXN 38,500,000"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-sm text-white/65">Moneda</span>
                      <input
                        value={form.currency}
                        onChange={(e) => handleChange("currency", e.target.value)}
                        className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-white/25"
                        placeholder="MXN"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-sm text-white/65">Luxury Score</span>
                      <input
                        type="number"
                        value={form.luxuryScore}
                        onChange={(e) => handleChange("luxuryScore", Number(e.target.value))}
                        className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-white/25"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-sm text-white/65">Recámaras</span>
                      <input
                        type="number"
                        value={form.bedrooms}
                        onChange={(e) => handleChange("bedrooms", Number(e.target.value))}
                        className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition focus:border-white/25"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-sm text-white/65">Baños</span>
                      <input
                        type="number"
                        value={form.bathrooms}
                        onChange={(e) => handleChange("bathrooms", Number(e.target.value))}
                        className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition focus:border-white/25"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-sm text-white/65">Área interior</span>
                      <input
                        value={form.areaInterior}
                        onChange={(e) => handleChange("areaInterior", e.target.value)}
                        className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-white/25"
                        placeholder="850 m²"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-sm text-white/65">Área total</span>
                      <input
                        value={form.areaTotal}
                        onChange={(e) => handleChange("areaTotal", e.target.value)}
                        className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-white/25"
                        placeholder="1200 m²"
                      />
                    </label>
                  </div>
                </div>

                
              </section>





              <section className="space-y-6">
                <div className="rounded-[28px] border border-white/10 bg-black/20 p-6">
                  <div className="mb-5 text-[11px] uppercase tracking-[0.3em] text-white/35">
                    Estado
                  </div>

                  <div className="grid gap-5">
                    <label className="block">
                      <span className="mb-2 block text-sm text-white/65">Status interno</span>
                      <select
                        value={form.status}
                        onChange={(e) => handleChange("status", e.target.value as AdminPropertyInput["status"])}
                        className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition focus:border-white/25"
                      >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="archived">Archived</option>
                      </select>
                    </label>

                    <label className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4">
                      <div>
                        <div className="text-sm font-medium text-white">Featured</div>
                        <div className="mt-1 text-xs text-white/45">
                          Marca la propiedad como destacada.
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={form.featured}
                        onChange={(e) => handleChange("featured", e.target.checked)}
                        className="h-5 w-5"
                      />
                    </label>

                    <label className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4">
                      <div>
                        <div className="text-sm font-medium text-white">Published</div>
                        <div className="mt-1 text-xs text-white/45">
                          Control editorial de salida.
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={form.published}
                        onChange={(e) => handleChange("published", e.target.checked)}
                        className="h-5 w-5"
                      />
                    </label>
                  </div>
                </div>

                <div className="rounded-[28px] border border-white/10 bg-black/20 p-6">
                  <div className="mb-5 text-[11px] uppercase tracking-[0.3em] text-white/35">
                    Snapshot
                  </div>

                  <div className="space-y-3 text-sm text-white/65">
                    <div className="flex items-center justify-between rounded-2xl border border-white/10 px-4 py-3">
                      <span>Escenas 360</span>
                      <span className="text-white">{form.scenes360.length}</span>
                    </div>

                    <div className="flex items-center justify-between rounded-2xl border border-white/10 px-4 py-3">
                      <span>Galería</span>
                      <span className="text-white">{form.gallery.length}</span>
                    </div>

                    <div className="flex items-center justify-between rounded-2xl border border-white/10 px-4 py-3">
                      <span>Cover</span>
                      <span className="text-white">{form.coverImage ? "Sí" : "No"}</span>
                    </div>

                    <div className="flex items-center justify-between rounded-2xl border border-white/10 px-4 py-3">
  <span>Resumen 360</span>
  <span className="text-white">{form.scenes360.length}</span>
</div>

                    <div className="flex items-center justify-between rounded-2xl border border-white/10 px-4 py-3">
                      <span>Última edición</span>
                      <span className="text-white">
                        {selectedRecord ? formatUpdatedAt(selectedRecord.updatedAt) : "Nueva"}
                      </span>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <div className="mt-8">
              <AdminMediaTabs
                  form={form}
                  uploadingCover={uploadingCover}
                  uploadingGallery={uploadingGallery}
                  uploadingScenes={uploadingScenes}
                  activeHotspotScene={activeHotspotScene}
                  onSetActiveHotspotScene={setActiveHotspotScene}
                  onChange={handleChange}
                  onUpload={handleUpload}
                  onRemoveGalleryImage={removeGalleryImage}
                  onAddScene={addEmptyScene}
                  onUpdateScene={updateScene}
                  onRemoveScene={removeScene}
                  onAddHotspot={addHotspotAtCoords}
                  onUpdateHotspot={updateHotspot}
                  onRemoveHotspot={removeHotspot}
                  yawToPercent={yawToPercent}
                  pitchToPercent={pitchToPercent}
                />
            </div>




          </div>
        </main>
      </div>
    </div>
  );
}
