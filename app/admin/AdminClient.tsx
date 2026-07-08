"use client";

import { useMemo, useState, useEffect, useCallback, type SetStateAction } from "react";
import { useAdminPropertyEditor } from "@/hooks/admin/useAdminPropertyEditor";
import { useAdminBootstrap } from "@/hooks/admin/useAdminBootstrap";
import { useAdminUploads } from "@/hooks/admin/useAdminUploads";
import { useAdminMutations } from "@/hooks/admin/useAdminMutations";
import { useAdminSave } from "@/hooks/admin/useAdminSave";
import { useSearchParams } from "next/navigation";
import type {
  AdminHotspot,
  AdminPropertyInput,
  AdminPropertyRecord,
  AdminScene360,
} from "@/types/admin";
import { EMPTY_ADMIN_PROPERTY } from "@/types/admin";
import AdminMediaTabs from "@/components/admin/AdminMediaTabs";
import AdminTokkoPanel from "@/components/admin/AdminTokkoPanel";
import LogoutButton from "@/components/auth/LogoutButton";
import { buildScene, buildHotspot } from "@/lib/admin/editor-commands";
import type { TokkoAdminItem } from "@/lib/admin/tokko-helpers";
import { materialCatalog } from "@/lib/editorial/materialCatalog";
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

function normalizeAdminForm(value: Partial<AdminPropertyInput> | null | undefined): AdminPropertyInput {
  const raw = (value ?? {}) as Partial<AdminPropertyInput>;

  return {
    ...EMPTY_ADMIN_PROPERTY,
    ...raw,
    id: raw.id ?? "",
    title: raw.title ?? "",
    slug: raw.slug ?? "",
    status: raw.status ?? "draft",
    propertyType: raw.propertyType ?? EMPTY_ADMIN_PROPERTY.propertyType,
    location: raw.location ?? "",
    zoneSlug: raw.zoneSlug ?? "",
    zoneLabel: raw.zoneLabel ?? "",
    price: raw.price ?? "",
    currency: raw.currency ?? "MXN",
    bedrooms: typeof raw.bedrooms === "number" ? raw.bedrooms : 0,
    bathrooms: typeof raw.bathrooms === "number" ? raw.bathrooms : 0,
    halfBathrooms: typeof raw.halfBathrooms === "number" ? raw.halfBathrooms : 0,
    areaInterior: raw.areaInterior ?? "",
    areaTotal: raw.areaTotal ?? "",
    tagline: raw.tagline ?? "",
    coverImage: raw.coverImage ?? "",
    gallery: Array.isArray(raw.gallery) ? raw.gallery.filter((item: any): item is string => typeof item === "string") : [],
    pdfGallery: Array.isArray((raw as any).pdfGallery) ? (raw as any).pdfGallery.filter((item: any): item is string => typeof item === "string") : [],
    videoUrl: raw.videoUrl ?? "",
    videoPoster: raw.videoPoster ?? "",
    videoType: raw.videoType || "upload",
    scenes360: Array.isArray(raw.scenes360)
      ? raw.scenes360.map((scene, sceneIndex) => ({
          id: scene?.id ?? `scene-${sceneIndex + 1}`,
          title: scene?.title ?? "",
          image: scene?.image ?? "",
          thumbnail: scene?.thumbnail ?? "",
          initialYaw: typeof scene?.initialYaw === "number" ? scene.initialYaw : 0,
          initialPitch: typeof scene?.initialPitch === "number" ? scene.initialPitch : 0,
          hotspots: Array.isArray(scene?.hotspots)
            ? scene.hotspots.map((hotspot, hotspotIndex) => ({
                id: hotspot?.id ?? `hotspot-${hotspotIndex + 1}`,
                pitch: typeof hotspot?.pitch === "number" ? hotspot.pitch : 0,
                yaw: typeof hotspot?.yaw === "number" ? hotspot.yaw : 0,
                label: hotspot?.label ?? "",
                targetSceneId: hotspot?.targetSceneId ?? "",
                type: hotspot?.type ?? "nav",
              }))
            : [],
        }))
      : [],
    source: raw.source ?? { provider: "manual" },
    featured: raw.featured === true,
    published: raw.published === true,
    luxuryScore: typeof raw.luxuryScore === "number" ? raw.luxuryScore : EMPTY_ADMIN_PROPERTY.luxuryScore,
    description: raw.description ?? "",
  };
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

type UploadFolder = "cover" | "gallery" | "scenes360" | "video";



const SALE_ZONES = [
  { slug: "real-diamante", label: "Real Diamante" },
  { slug: "las-brisas-hillside-estates", label: "Las Brisas & Hillside estates" },
  { slug: "beachfront-residences", label: "Beachfront residences" },
  { slug: "tres-vidas-golf-ocean-estates", label: "TRES VIDAS" },
] as const;

export default function AdminClient({ forcedPropertyId }: { forcedPropertyId?: string } = {}) {
  const searchParams = useSearchParams();
  const propertyIdFromUrl = forcedPropertyId || searchParams.get("propertyId");
  const isLightStudio = Boolean(forcedPropertyId);
  const [activeHotspotScene, setActiveHotspotScene] = useState<string | null>(null);
  const [items, setItems] = useState<AdminPropertyRecord[]>([]);
  
  const { form, dispatch } = useAdminPropertyEditor(EMPTY_ADMIN_PROPERTY);

  const setForm = (next: SetStateAction<AdminPropertyInput>) => {
    if (typeof next === "function") {
      dispatch({
        type: "UPDATE_FORM",
        updater: (current: AdminPropertyInput) =>
          normalizeAdminForm(next(normalizeAdminForm(current))),
      });
      return;
    }

    dispatch({ type: "SET_FORM", payload: normalizeAdminForm(next) });
  };

  const [selectedId, setSelectedId] = useState<string>("new");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [uploadingScenes, setUploadingScenes] = useState(false);
  const [message, setMessage] = useState<string>("");

  const [tokkoItems, setTokkoItems] = useState<TokkoAdminItem[]>([]);
  const [hiddenIds, setHiddenIds] = useState<string[]>([]);

  useAdminBootstrap({
    forcedPropertyId,
    propertyIdFromUrl,
    selectedId,
    items,
    onLoadingChange: setLoading,
    onMessageChange: setMessage,
    onItemsChange: setItems,
    onSelectedIdChange: setSelectedId,
    onFormChange: setForm,
    onTokkoItemsChange: setTokkoItems,
    onHiddenIdsChange: setHiddenIds,
    onSelectProperty: handleSelect,
  });

  const { handleDelete, toggleVisibility, handleTokkoSync, importFromTokko } = useAdminMutations({
    items,
    selectedId,
    forcedPropertyId,
    slugify,
    setItems,
    setSelectedId,
    setForm,
    setMessage,
    setSaving,
    setHiddenIds,
    setTokkoItems,
  });

const { handleSave } = useAdminSave({
    form,
    forcedPropertyId,
    slugify,
    setSaving,
    setItems,
    setSelectedId,
    getSelectedId: () => selectedId,
    setForm,
    setMessage,
  });

const { handleUpload } = useAdminUploads({
    form,
    selectedId,
    slugify,
    setUploadingCover,
    setUploadingGallery,
    setUploadingScenes,
    setMessage,
    setForm,
  });

  const selectedRecord = useMemo(() => {
    const found = items.find((item: any) => item.id === selectedId);
    return found || null;
  }, [items, selectedId]);

  
  function handleChange<K extends keyof AdminPropertyInput>(key: K, value: AdminPropertyInput[K]) {
    dispatch({ type: "PATCH_FIELD", key, value });
  }

  function createDraftPropertyId() {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      return `private-estates-${crypto.randomUUID()}`;
    }

    return `private-estates-${Date.now()}`;
  }

  function handleNew() {
    const draftId = createDraftPropertyId();

    setSelectedId("new");
    setMessage("");
    setForm({
      ...EMPTY_ADMIN_PROPERTY,
      id: draftId,
      title: "",
      slug: "",
    });
  }

  function handleSelect(item: AdminPropertyRecord) {
    setSelectedId(item.id);
    setMessage("");
    setForm({
      id: item.id,
      title: item.title,
      slug: item.slug,
      status: item.status,
      propertyType: item.propertyType,
      location: item.location,
      zoneSlug: item.zoneSlug || "",
      zoneLabel: item.zoneLabel || "",
      price: item.price,
      currency: item.currency,
      bedrooms: item.bedrooms,
      bathrooms: item.bathrooms,
      halfBathrooms: item.halfBathrooms ?? 0,
      areaInterior: item.areaInterior,
      areaTotal: item.areaTotal,
      tagline: item.tagline,
      coverImage: item.coverImage,
      gallery: item.gallery,
      pdfGallery: Array.isArray((item as any).pdfGallery) ? (item as any).pdfGallery : [],
      videoUrl: item.videoUrl || "",
      videoPoster: item.videoPoster || "",
      videoType: item.videoType ? item.videoType : "upload",
      scenes360: Array.isArray(item.scenes360) ? item.scenes360 : [],
      description: item.description || "",
      featured: item.featured,
      published: item.published,
      luxuryScore: item.luxuryScore,
      pemFactors: item.pemFactors || {},
      materials: Array.isArray(item.materials) ? item.materials : [],
    });
  }

  function setPemFactor(key: string, value: string) {
    setForm((prev) => {
      const current = (prev.pemFactors || {}) as Record<string, unknown>;

      return {
        ...prev,
        pemFactors: {
          ...current,
          [key]: value,
        },
      };
    });
  }

  function togglePemFactor(group: string, value: string) {
    setForm((prev) => {
      const current = (prev.pemFactors || {}) as Record<string, unknown>;
      const currentList = Array.isArray(current[group]) ? (current[group] as string[]) : [];
      const nextList = currentList.includes(value)
        ? currentList.filter((item) => item !== value)
        : [...currentList, value];

      return {
        ...prev,
        pemFactors: {
          ...current,
          [group]: nextList,
        },
      };
    });
  }

  function toggleMaterial(value: string) {
    setForm((prev) => {
      const currentList = Array.isArray(prev.materials)
        ? prev.materials
        : [];
      const nextList = currentList.includes(value)
        ? currentList.filter((item) => item !== value)
        : [...currentList, value];

      return {
        ...prev,
        materials: nextList,
      };
    });
  }

  function removeGalleryImage(index: number) {
    setForm((prev) => {
      const image = prev.gallery[index];

      return {
        ...prev,
        gallery: prev.gallery.filter((_, i: any) => i !== index),
        pdfGallery: image
          ? (prev.pdfGallery || []).filter((item) => item !== image)
          : prev.pdfGallery || [],
      };
    });
  }

  function togglePdfGalleryImage(image: string) {
    setForm((prev) => {
      const current = Array.isArray(prev.pdfGallery) ? prev.pdfGallery : [];
      const exists = current.includes(image);

      return {
        ...prev,
        pdfGallery: exists
          ? current.filter((item) => item !== image)
          : [...current, image],
      };
    });
  }

  function addEmptyScene() {
    dispatch({
      type: "ADD_SCENE",
      scene: buildScene(`escena-${form.scenes360.length + 1}`, "", slugify),
    });
  }

  function updateScene(index: number, patch: Partial<AdminScene360>) {
    dispatch({
      type: "UPDATE_SCENE",
      index,
      patch,
      slugify,
    });
  }

  function removeScene(index: number) {
    dispatch({ type: "REMOVE_SCENE", index });
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

    dispatch({
      type: "ADD_HOTSPOT",
      sceneIndex,
      hotspot,
    });

    setMessage("Hotspot creado en el visor 360. Ajusta label y destino antes de guardar.");
  }

  function updateHotspot(
    sceneIndex: number,
    hotspotIndex: number,
    patch: Partial<AdminHotspot>
  ) {
    const normalizedPatch: Partial<AdminHotspot> = {};

    if (patch.pitch !== undefined) {
      normalizedPatch.pitch = Number(clamp(Number(patch.pitch), -90, 90).toFixed(2));
    }

    if (patch.yaw !== undefined) {
      normalizedPatch.yaw = Number(clamp(Number(patch.yaw), -180, 180).toFixed(2));
    }

    if (patch.label !== undefined) {
      normalizedPatch.label = patch.label;
    }

    if (patch.targetSceneId !== undefined) {
      normalizedPatch.targetSceneId = patch.targetSceneId;
    }

    if (patch.type !== undefined) {
      normalizedPatch.type = patch.type;
    }

    if (patch.size !== undefined) {
      normalizedPatch.size = patch.size;
    }

    dispatch({
      type: "UPDATE_HOTSPOT",
      sceneIndex,
      hotspotIndex,
      patch: normalizedPatch,
      slugify,
    });
  }

  function removeHotspot(sceneIndex: number, hotspotIndex: number) {
    dispatch({
      type: "REMOVE_HOTSPOT",
      sceneIndex,
      hotspotIndex,
    });
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className={isLightStudio ? "mx-auto flex min-h-screen w-full max-w-[1600px]" : "mx-auto flex min-h-screen w-full max-w-[1600px] gap-6 px-6 py-6"}>
        {!isLightStudio && (
        <aside className="sticky top-6 flex h-[2200px] w-[420px] shrink-0 flex-col overflow-hidden rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-xl">
          <div className="border-b border-white/10 px-6 py-6">
            <div className="mb-2 text-[11px] uppercase tracking-[0.35em] text-white/45">
              Private Admin
            </div>

            <h1 className="text-2xl font-semibold tracking-tight">
              Luxury Property Console
            </h1>

            <p className="mt-2 text-sm leading-6 text-white/60">
              Base local premium para crear, editar media, escenas 360 y hotspots.
            </p>

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleTokkoSync}
                className="rounded-2xl border border-white/15 bg-white/[0.04] px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10"
              >
                Actualizar desde Tokko
              </button>

              <button
                type="button"
                onClick={() => {
                  window.location.href = "/admin/properties";
                }}
                className="rounded-2xl border border-white/15 bg-white/[0.04] px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10"
              >
                Office
              </button>
            </div>
          </div>

          <div className="border-b border-white/10 p-4">
            <button
              onClick={handleNew}
              className="w-full rounded-2xl border border-white/15 bg-white px-4 py-3 text-sm font-medium text-black transition hover:opacity-90"
            >
              + Nueva propiedad
            </button>
          </div>

          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden p-4">
            <AdminTokkoPanel
              items={tokkoItems}
              hiddenIds={hiddenIds}
              onToggleVisibility={toggleVisibility}
              onImport={importFromTokko}
            />

            <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025]">
              <div className="border-b border-white/10 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-[11px] uppercase tracking-[0.3em] text-white/40">
                    Inventario local
                  </div>
                  <div className="rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-xs text-white/70">
                    {items.length}
                  </div>
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto p-4">

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
                {items.map((item: any) => {
                  const active = item.id === selectedId;

                  return (
                    <div
                      key={item.id}
                      className={[
                        "overflow-hidden rounded-2xl border transition",
                        active
                          ? "border-white/30 bg-white/10"
                          : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]",
                      ].join(" ")}
                    >
                      <button
                        type="button"
                        onClick={() => handleSelect(item)}
                        className="block w-full text-left"
                      >
                        {item.coverImage ? (
                          <div className="h-[120px] w-full overflow-hidden border-b border-white/10">
                            <img
                              src={item.coverImage}
                              alt={item.title}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="flex h-[120px] w-full items-center justify-center border-b border-white/10 bg-white/[0.02] text-[10px] uppercase tracking-[0.18em] text-white/30">
                            Sin imagen
                          </div>
                        )}

                        <div className="p-4">
                          <div className="mb-2 flex items-center justify-between gap-3">
                            <span className="text-xs uppercase tracking-[0.25em] text-white/40">
                              {item.propertyType}
                            </span>
                            <div className="flex items-center gap-2">
                              {item.featured ? (
                                <span className="rounded-full bg-fuchsia-500/15 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-fuchsia-300">
                                  featured
                                </span>
                              ) : null}
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
                          </div>

                          <div className="text-base font-medium leading-6 text-white">
                            {item.title}
                          </div>

                          <div className="mt-1 text-sm text-white/55">
                            {item.location}
                          </div>

                          <div className="mt-3 flex items-center justify-between text-xs text-white/40">
                            <span>{item.price || "Sin precio"}</span>
                            <span>{formatUpdatedAt(item.updatedAt)}</span>
                          </div>
                        </div>
                      </button>


                    </div>
                  );
                })}
              </div>
            )}
              </div>
            </section>
          </div>

</aside>
      )}

        <main className="flex-1 min-w-0 overflow-hidden">
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
                        <option value="residence">Residencia</option>
                        <option value="estate">Casa</option>
                        <option value="condo">Departamento</option>
                        <option value="land">Terreno</option>
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

<label className="space-y-2 md:col-span-2">
  <span className="text-xs uppercase tracking-[0.22em] text-white/45">Colección editorial</span>
  <select
    value={form.zoneSlug || ""}
    onChange={(e) => {
      const nextSlug = e.target.value;
      const match = SALE_ZONES.find((item: any) => item.slug === nextSlug);
      handleChange("zoneSlug", nextSlug);
      handleChange("zoneLabel", match?.label || "");
    }}
    className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white"
  >
    <option value="">Sin colección</option>
    {SALE_ZONES.map((item: any) => (
      <option key={item.slug} value={item.slug}>
        {item.label}
      </option>
    ))}
  </select>
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
                      <span className="mb-2 block text-sm text-white/65">Medios baños</span>
                      <input
                        type="number"
                        value={form.halfBathrooms}
                        onChange={(e) => handleChange("halfBathrooms", Number(e.target.value))}
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

                <div className="rounded-[28px] border border-white/10 bg-black/20 p-6">
                  <div className="mb-5 text-[11px] uppercase tracking-[0.3em] text-white/35">
                    Snapshot
                  </div>

                  <div className="space-y-3 text-sm text-white/65">
                    <div className="flex items-center justify-between rounded-2xl border border-white/10 px-4 py-3">
                      <span>Escenas 360</span>
                      <span className="text-white">{Array.isArray(form.scenes360) ? form.scenes360.length : 0}</span>
                    </div>

                    <div className="flex items-center justify-between rounded-2xl border border-white/10 px-4 py-3">
                      <span>Galería</span>
                      <span className="text-white">{form.gallery.length}</span>
                    </div>

                    <div className="flex items-center justify-between rounded-2xl border border-amber-400/20 bg-amber-500/[0.03] px-4 py-3">
                      <span>Fotos PDF</span>
                      <span className="text-amber-300">
                        {Array.isArray(form.pdfGallery)
                          ? form.pdfGallery.length
                          : 0}
                      </span>
                    </div>

                    <div className="flex items-center justify-between rounded-2xl border border-white/10 px-4 py-3">
                      <span>Cover</span>
                      <span className="text-white">{form.coverImage ? "Sí" : "No"}</span>
                    </div>

                    <div className="flex items-center justify-between rounded-2xl border border-white/10 px-4 py-3">
  <span>Resumen 360</span>
  <span className="text-white">{Array.isArray(form.scenes360) ? form.scenes360.length : 0}</span>
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
                <div className="rounded-[28px] border border-white/10 bg-black/20 p-6">
                  <div className="mb-5 flex items-start justify-between gap-4">
                    <div>
                      <div className="text-[11px] uppercase tracking-[0.3em] text-white/35">
                        Factores destacados PEM
                      </div>
                      <p className="mt-2 max-w-2xl text-sm leading-6 text-white/45">
                        Atributos editoriales que alimentan la evaluación, el PDF y la lectura premium de la propiedad.
                      </p>
                    </div>
                  </div>

                  <div className="max-h-[520px] overflow-y-auto pr-2">
                    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
                      <label className="block">
                        <span className="mb-2 block text-sm text-white/65">Vista</span>
                        <select
                          value={form.pemFactors?.viewQuality || ""}
                          onChange={(e) => setPemFactor("viewQuality", e.target.value)}
                          className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none"
                        >
                          <option value="">Sin definir</option>
                          <option value="partial">Vista parcial</option>
                          <option value="open">Vista abierta</option>
                          <option value="panoramic">Vista panorámica</option>
                          <option value="iconic">Vista icónica</option>
                        </select>
                      </label>

                      <label className="block">
                        <span className="mb-2 block text-sm text-white/65">Privacidad</span>
                        <select
                          value={form.pemFactors?.privacy || ""}
                          onChange={(e) => setPemFactor("privacy", e.target.value)}
                          className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none"
                        >
                          <option value="">Sin definir</option>
                          <option value="medium">Media</option>
                          <option value="high">Alta</option>
                          <option value="very_high">Muy alta</option>
                          <option value="estate">Estate-level</option>
                        </select>
                      </label>

                      <label className="block">
                        <span className="mb-2 block text-sm text-white/65">Relación con el mar</span>
                        <select
                          value={form.pemFactors?.oceanRelation || ""}
                          onChange={(e) => setPemFactor("oceanRelation", e.target.value)}
                          className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none"
                        >
                          <option value="">Sin definir</option>
                          <option value="none">Sin relación directa</option>
                          <option value="near_ocean">Cercano al mar</option>
                          <option value="ocean_view">Vista al mar</option>
                          <option value="oceanfront">Frente al mar</option>
                          <option value="beach_access">Acceso directo a playa</option>
                        </select>
                      </label>

                      <label className="block">
                        <span className="mb-2 block text-sm text-white/65">Clasificación PEM</span>
                        <select
                          value={form.pemFactors?.pemClassification || ""}
                          onChange={(e) => setPemFactor("pemClassification", e.target.value)}
                          className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none"
                        >
                          <option value="">Sin definir</option>
                          <option value="selection">Selección PEM</option>
                          <option value="signature">Signature</option>
                          <option value="iconic">Iconic</option>
                        </select>
                      </label>
                    </div>

                    <div className="mt-6 grid gap-5 lg:grid-cols-3">
                      {[
                        ["experience", "Experiencia", [
                          ["resort", "Lifestyle resort"],
                          ["family", "Family retreat"],
                          ["wellness", "Wellness"],
                          ["entertainment", "Entretenimiento"],
                          ["investment", "Inversión patrimonial"],
                          ["second_home", "Segunda residencia"],
                          ["primary_home", "Residencia permanente"],
                        ]],
                        ["amenities", "Amenidades premium", [
                          ["beach_club", "Club de playa"],
                          ["spa", "Spa"],
                          ["gym", "Gimnasio"],
                          ["padel", "Pádel"],
                          ["tennis", "Tenis"],
                          ["marina", "Marina"],
                          ["private_pool", "Alberca privada"],
                          ["roof_garden", "Roof garden"],
                          ["dock", "Muelle"],
                          ["helipad", "Helipuerto"],
                        ]],
                        ["architecture", "Arquitectura", [
                          ["contemporary", "Arquitectura contemporánea"],
                          ["author_design", "Arquitectura de autor"],
                          ["curated_interiors", "Diseño interior curado"],
                          ["double_height", "Doble altura"],
                          ["natural_stone", "Piedra / mármol natural"],
                          ["luxury_millwork", "Carpintería de lujo"],
                          ["floor_to_ceiling", "Ventanales piso-techo"],
                          ["premium_materials", "Materiales premium"],
                        ]],
                      ].map(([group, label, options]: any) => (
                        <div key={group} className="rounded-[22px] border border-white/10 bg-white/[0.025] p-4">
                          <div className="mb-4 text-[11px] uppercase tracking-[0.22em] text-[#d6b464]">
                            {label}
                          </div>

                          <div className="space-y-3">
                            {options.map(([value, text]: any) => {
                              const selected = Array.isArray((form.pemFactors as any)?.[group])
                                ? ((form.pemFactors as any)[group] as string[]).includes(value)
                                : false;

                              return (
                                <label key={value} className="flex cursor-pointer items-center gap-3 text-sm text-white/70">
                                  <input
                                    type="checkbox"
                                    checked={selected}
                                    onChange={() => togglePemFactor(group, value)}
                                    className="h-4 w-4 accent-[#d6b464]"
                                  />
                                  <span>{text}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 rounded-[22px] border border-white/10 bg-white/[0.025] p-4">
                      <div className="mb-4 text-[11px] uppercase tracking-[0.22em] text-[#d6b464]">
                        Materialidad y acabados
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {materialCatalog.map((material) => {
                          const selected = Array.isArray(form.materials)
                            ? form.materials.includes(material.id)
                            : false;

                          return (
                            <label key={material.id} className="flex cursor-pointer items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-3 py-3 text-sm text-white/70">
                              <input
                                type="checkbox"
                                checked={selected}
                                onChange={() => toggleMaterial(material.id)}
                                className="h-4 w-4 accent-[#d6b464]"
                              />
                              <span>{material.title}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

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
                  onTogglePdfImage={togglePdfGalleryImage}
                  onReorderGallery={(from, to) => {
                    setForm((prev) => {
                      const next = [...prev.gallery];
                      const [moved] = next.splice(from, 1);
                      if (moved === undefined) return prev;
                      next.splice(to, 0, moved);
                      return { ...prev, gallery: next };
                    });
                  }}
                  onAddScene={addEmptyScene}
                  onReorderScenes={(from, to) => {
                    setForm((prev) => {
                      const next = [...prev.scenes360];
                      const [moved] = next.splice(from, 1);
                      if (moved === undefined) return prev;
                      next.splice(to, 0, moved);
                      return { ...prev, scenes360: next };
                    });
                  }}
                  onUpdateScene={updateScene}
                  onRemoveScene={removeScene}
                  onAddHotspot={addHotspotAtCoords}
                  onUpdateHotspot={updateHotspot}
                  onRemoveHotspot={removeHotspot}
                  onUploadVideo={(file) => handleUpload(file, "video")}
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
