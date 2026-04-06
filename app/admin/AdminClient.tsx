"use client";

import { useEffect, useMemo, useState, type SetStateAction } from "react";
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
import { mapScenesFromApi } from "@/lib/admin/scene-mappers";
import { buildScene, buildHotspot } from "@/lib/admin/editor-commands";
import type { TokkoAdminItem } from "@/lib/admin/tokko-helpers";

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

export default function AdminClient({ forcedPropertyId }: { forcedPropertyId?: string } = {}) {
  const searchParams = useSearchParams();
  const propertyIdFromUrl = forcedPropertyId || searchParams.get("propertyId");
  const isLightStudio = Boolean(forcedPropertyId);
  const [activeHotspotScene, setActiveHotspotScene] = useState<string | null>(null);
  const [items, setItems] = useState<AdminPropertyRecord[]>([]);
  
  const { form, dispatch } = useAdminPropertyEditor(EMPTY_ADMIN_PROPERTY);

  const setForm = (next: SetStateAction<AdminPropertyInput>) => {
    const value = typeof next === "function" ? next(form) : next;
    dispatch({ type: "SET_FORM", payload: value });
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
  });

const { handleSave } = useAdminSave({
    form,
    forcedPropertyId,
    slugify,
    setSaving,
    setItems,
    setSelectedId,
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
    return items.find((item) => item.id === selectedId) || null;
  }, [items, selectedId]);

  
  function handleChange<K extends keyof AdminPropertyInput>(key: K, value: AdminPropertyInput[K]) {
    dispatch({ type: "PATCH_FIELD", key, value });
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
      videoUrl: item.videoUrl || "",
      videoPoster: item.videoPoster || "",
      videoType: item.videoType || "upload",
      scenes360: item.scenes360,
      featured: item.featured,
      published: item.published,
      luxuryScore: item.luxuryScore,
      description: item.description,
    });
  }

  function removeGalleryImage(index: number) {
    setForm((prev) => ({
      ...prev,
      gallery: prev.gallery.filter((_, i) => i !== index),
    }));
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
    const normalizedPatch: Partial<AdminHotspot> = {
      ...patch,
      pitch:
        patch.pitch !== undefined
          ? Number(clamp(Number(patch.pitch), -90, 90).toFixed(2))
          : undefined,
      yaw:
        patch.yaw !== undefined
          ? Number(clamp(Number(patch.yaw), -180, 180).toFixed(2))
          : undefined,
      label: patch.label !== undefined ? patch.label : undefined,
      targetSceneId:
        patch.targetSceneId !== undefined ? patch.targetSceneId : undefined,
      type: patch.type !== undefined ? patch.type : undefined,
      size: patch.size !== undefined ? patch.size : undefined,
    };

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
        <aside className="sticky top-6 flex h-[calc(100vh-3rem)] w-[360px] shrink-0 flex-col overflow-hidden rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-xl">
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

            <button
              type="button"
              onClick={handleTokkoSync}
              className="mt-4 rounded-2xl border border-white/15 bg-white/[0.04] px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10"
            >
              Actualizar desde Tokko
            </button>
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
            <div className="mb-4">
              <AdminTokkoPanel
                items={tokkoItems}
                hiddenIds={hiddenIds}
                onToggleVisibility={toggleVisibility}
                onImport={importFromTokko}
              />
            </div>

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

                      <div className="border-t border-white/10">
                        <button
                          type="button"
                          onClick={() => {
                            window.location.href = `/broker/properties/${item.id}/studio`;
                          }}
                          className="w-full px-3 py-3 text-[10px] uppercase tracking-[0.2em] text-white/70 transition hover:bg-white/10"
                        >
                          Office
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

</aside>
      )}

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
