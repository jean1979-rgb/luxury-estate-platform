"use client";

import { useEffect, useRef, useState } from "react";
import Viewer360 from "@/components/Viewer360";
import type { AdminHotspot, AdminHotspotType, AdminScene360 } from "@/types/admin";

type Props = {
  scenes: AdminScene360[];
  uploadingScenes: boolean;
  activeHotspotScene: string | null;
  hotspotTypeOptions: Array<{ value: AdminHotspotType; label: string }>;
  onUploadScene: (file: File) => Promise<void> | void;
  onAddScene: () => void;
  onRemoveScene: (index: number) => void;
  onReorderScenes: (from: number, to: number) => void;
  onUpdateScene: (index: number, patch: Partial<AdminScene360>) => void;
  onAddHotspot: (sceneIndex: number, coords: { pitch: number; yaw: number }) => void;
  onSetActiveHotspotScene: (sceneId: string | null) => void;
  onUpdateHotspot: (sceneIndex: number, hotspotIndex: number, patch: Partial<AdminHotspot>) => void;
  onRemoveHotspot: (sceneIndex: number, hotspotIndex: number) => void;
  yawToPercent: (yaw: number) => number;
  pitchToPercent: (pitch: number) => number;
};

export default function AdminScenes360Tab({
  scenes,
  uploadingScenes,
  activeHotspotScene,
  hotspotTypeOptions,
  onUploadScene,
  onAddScene,
  onRemoveScene,
  onReorderScenes,
  onUpdateScene,
  onAddHotspot,
  onSetActiveHotspotScene,
  onUpdateHotspot,
  onRemoveHotspot,
  yawToPercent,
  pitchToPercent,
}: Props) {
  const [activeSceneId, setActiveSceneId] = useState<string | null>(
    scenes[0]?.id || null
  );

  const dragSceneIndexRef = useRef<number | null>(null);


  useEffect(() => {
    if (!scenes.length) {
      setActiveSceneId(null);
      return;
    }

    const exists = scenes.some((scene) => scene.id === activeSceneId);

    if (!activeSceneId || !exists) {
      setActiveSceneId(scenes[0]?.id || null);
    }
  }, [scenes, activeSceneId]);


  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-sm font-medium text-white">Scene manager 360</div>
            <div className="mt-1 text-xs text-white/45">
              Administra panoramas, hotspots y coordenadas del visor.
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onAddScene}
              className="rounded-2xl border border-white/15 px-4 py-3 text-sm text-white transition hover:bg-white/10"
            >
              Nueva escena
            </button>

            <label className="inline-flex cursor-pointer items-center rounded-2xl border border-white/15 px-4 py-3 text-sm text-white transition hover:bg-white/10">
              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                className="hidden"
                onChange={async (e) => {
                  const input = e.currentTarget;
                  const file = input.files?.[0];
                  if (file) {
                    await onUploadScene(file);
                  }
                  input.value = "";
                }}
              />
              {uploadingScenes ? "Subiendo..." : "Subir panorama"}
            </label>
          </div>
        </div>
      </section>

      {scenes.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-white/10 px-4 py-12 text-center text-sm text-white/35">
          Aún no hay escenas 360.
        </div>
      ) : (
        <div className="max-h-[70vh] space-y-6 overflow-y-auto pr-2">
          {scenes
  .map((scene, realSceneIndex) => ({ scene, realSceneIndex }))
  .filter(({ scene }) => !activeSceneId || scene.id === activeSceneId)
  .map(({ scene, realSceneIndex }) => {
            const sceneIndex = realSceneIndex;
            const isHotspotMode = activeHotspotScene === scene.id;

            return (
              <section
                key={scene.id || `scene-${sceneIndex}`}
                draggable
                onDragStart={() => {
                  dragSceneIndexRef.current = sceneIndex;
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  if (dragSceneIndexRef.current === null) return;
                  onReorderScenes(dragSceneIndexRef.current, sceneIndex);
                  dragSceneIndexRef.current = null;
                }}
                className="rounded-3xl border border-white/10 bg-white/[0.03] p-5"
              >
                <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="text-sm font-medium text-white">
                      Escena {sceneIndex + 1}
                    </div>
                    <div className="mt-1 text-xs text-white/45">
                      Hotspots: {scene.hotspots.length}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onRemoveScene(sceneIndex)}
                    className="rounded-2xl border border-white/10 px-4 py-3 text-sm text-white/75 transition hover:bg-white/10"
                  >
                    Eliminar escena
                  </button>
                </div>

                <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                  <div className="space-y-5 xl:sticky xl:top-4 xl:self-start">
                    <div className="grid gap-4 xl:grid-cols-2">
                      <label className="space-y-2">
                        <span className="text-xs uppercase tracking-[0.24em] text-white/35">
                          Scene ID
                        </span>
                        <input
                          value={scene.id}
                          onChange={(e) => onUpdateScene(sceneIndex, { id: e.target.value })}
                          className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-white/25"
                          placeholder="master-suite"
                        />
                      </label>

                      <label className="space-y-2">
                        <span className="text-xs uppercase tracking-[0.24em] text-white/35">
                          Título
                        </span>
                        <input
                          value={scene.title}
                          onChange={(e) => onUpdateScene(sceneIndex, { title: e.target.value })}
                          className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-white/25"
                          placeholder="Master Suite"
                        />
                      </label>
                    </div>

                    <label className="space-y-2">
                      <span className="text-xs uppercase tracking-[0.24em] text-white/35">
                        Panorama image
                      </span>
                      <input
                        value={scene.image}
                        onChange={(e) =>
                          onUpdateScene(sceneIndex, {
                            image: e.target.value,
                            thumbnail: e.target.value,
                          })
                        }
                        className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-white/25"
                        placeholder="/uploads/properties/mi-propiedad/scenes360/panorama.jpg"
                      />
                    </label>

                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="space-y-2">
                        <span className="text-[11px] uppercase tracking-[0.24em] text-white/35">
                          Initial yaw
                        </span>
                        <input
                          type="number"
                          step="0.1"
                          value={scene.initialYaw ?? 0}
                          onChange={(e) =>
                            onUpdateScene(sceneIndex, {
                              initialYaw: Number(e.target.value),
                            })
                          }
                          className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-white/25"
                          placeholder="0"
                        />
                      </label>

                      <label className="space-y-2">
                        <span className="text-[11px] uppercase tracking-[0.24em] text-white/35">
                          Initial pitch
                        </span>
                        <input
                          type="number"
                          step="0.1"
                          value={scene.initialPitch ?? 0}
                          onChange={(e) =>
                            onUpdateScene(sceneIndex, {
                              initialPitch: Number(e.target.value),
                            })
                          }
                          className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-white/25"
                          placeholder="0"
                        />
                      </label>
                    </div>

                    
<div className="mb-4 flex flex-wrap gap-2">
  {scenes.map((item, idx) => (
    <button
      key={item.id || `scene-chip-${idx}`}
      type="button"
      draggable
      onDragStart={() => {
        dragSceneIndexRef.current = idx;
      }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={() => {
        if (dragSceneIndexRef.current === null) return;
        if (dragSceneIndexRef.current === idx) {
          dragSceneIndexRef.current = null;
          return;
        }
        onReorderScenes(dragSceneIndexRef.current, idx);
        dragSceneIndexRef.current = null;
      }}
      onClick={() => setActiveSceneId(item.id)}
      className={`rounded-2xl border px-3 py-2 text-xs transition ${
        activeSceneId === item.id
          ? "border-white bg-white text-black"
          : "border-white/20 text-white hover:bg-white/10"
      }`}
    >
      {idx + 1}. {item.title || item.id}
    </button>
  ))}
</div>

<div className="rounded-[28px] border border-white/10 bg-black/25 p-3">
                      <div className="aspect-[16/10] min-h-[280px] overflow-hidden rounded-[24px] border border-white/10 bg-black/30">
                        {scene.image ? (
                          <Viewer360
                            image={scene.image}
                            hotspots={scene.hotspots}
                            editable={isHotspotMode}
                            onSceneClick={
                              isHotspotMode
                                ? (coords) => onAddHotspot(sceneIndex, coords)
                                : undefined
                            }
                            initialYaw={scene.initialYaw ?? 0}
                            initialPitch={scene.initialPitch ?? 0}
                            onViewChange={(view) => {
                              const currentYaw = scene.initialYaw ?? 0;
                              const currentPitch = scene.initialPitch ?? 0;

                              const yawDelta = Math.abs(view.yaw - currentYaw);
                              const pitchDelta = Math.abs(view.pitch - currentPitch);

                              if (yawDelta < 0.25 && pitchDelta < 0.25) return;

                              onUpdateScene(sceneIndex, {
                                initialYaw: view.yaw,
                                initialPitch: view.pitch,
                              });
                            }}
                            onHotspotClick={(targetSceneId) => {
      if (!targetSceneId) return;
      setActiveSceneId(targetSceneId);
    }}
/>
                        ) : (
                          <div className="flex aspect-[16/10] items-center justify-center text-sm text-white/35">
                            Agrega una imagen panorámica para activar el visor.
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            onSetActiveHotspotScene(isHotspotMode ? null : scene.id)
                          }
                          className={[
                            "rounded-2xl border px-4 py-3 text-sm transition",
                            isHotspotMode
                              ? "border-emerald-300/40 bg-emerald-300/10 text-emerald-100"
                              : "border-white/15 text-white hover:bg-white/10",
                          ].join(" ")}
                        >
                          {isHotspotMode
                            ? "Salir de modo hotspot"
                            : "Agregar hotspots desde el visor"}
                        </button>

                        <div className="text-xs text-white/45">
                          {isHotspotMode
                            ? "Haz click dentro del panorama para crear hotspots."
                            : "Activa el modo hotspot para marcar destinos visualmente."}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {scene.hotspots.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-white/10 px-4 py-6 text-sm text-white/35">
                        Esta escena aún no tiene hotspots.
                      </div>
                    ) : (
                      scene.hotspots.map((hotspot, hotspotIndex) => (
                        <article
                          key={hotspot.id || `hotspot-${hotspotIndex}`}
                          className="rounded-2xl border border-white/10 bg-black/20 p-4"
                        >
                          <div className="mb-4 flex items-center justify-between gap-3">
                            <div className="text-sm font-medium text-white">
                              Hotspot {hotspotIndex + 1}
                            </div>
                            <button
                              type="button"
                              onClick={() => onRemoveHotspot(sceneIndex, hotspotIndex)}
                              className="rounded-2xl border border-white/10 px-3 py-2 text-xs text-white/75 transition hover:bg-white/10"
                            >
                              Eliminar hotspot
                            </button>
                          </div>

                          <div className="grid gap-4 xl:grid-cols-2">
                            <label className="space-y-2 xl:col-span-2">
                              <span className="text-[11px] uppercase tracking-[0.24em] text-white/35">
                                Label
                              </span>
                              <input
                                value={hotspot.label}
                                onChange={(e) =>
                                  onUpdateHotspot(sceneIndex, hotspotIndex, {
                                    label: e.target.value,
                                  })
                                }
                                className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-white/25"
                                placeholder="Ir a terraza"
                              />
                            </label>

                            <label className="space-y-2">
                              <span className="text-[11px] uppercase tracking-[0.24em] text-white/35">
                                Destino
                              </span>
                              <select
                                value={hotspot.targetSceneId || ""}
                                onChange={(e) =>
                                  onUpdateHotspot(sceneIndex, hotspotIndex, {
                                    targetSceneId: e.target.value,
                                  })
                                }
                                className="w-full rounded-2xl border border-white/10 bg-[#111111] px-4 py-3 text-sm text-white outline-none transition focus:border-white/25"
                              >
                                <option value="">Sin destino</option>
                                {scenes
                                  .filter((candidate) => candidate.id !== scene.id)
                                  .map((candidate) => (
                                    <option key={candidate.id} value={candidate.id}>
                                      {candidate.title || candidate.id}
                                    </option>
                                  ))}
                              </select>
                            </label>

                            <label className="space-y-2">
                              <span className="text-[11px] uppercase tracking-[0.24em] text-white/35">
                                Tipo
                              </span>
                              <select
                                value={hotspot.type || "nav"}
                                onChange={(e) =>
                                  onUpdateHotspot(sceneIndex, hotspotIndex, {
                                    type: e.target.value as AdminHotspotType,
                                  })
                                }
                                className="w-full rounded-2xl border border-white/10 bg-[#111111] px-4 py-3 text-sm text-white outline-none transition focus:border-white/25"
                              >
                                {hotspotTypeOptions.map((option) => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            </label>

                            <label className="space-y-2">
                              <span className="text-[11px] uppercase tracking-[0.24em] text-white/35">
                                Tamaño
                              </span>
                              <select
                                value={hotspot.size || "md"}
                                onChange={(e) =>
                                  onUpdateHotspot(sceneIndex, hotspotIndex, {
                                    size: e.target.value as "sm" | "md" | "lg",
                                  })
                                }
                                className="w-full rounded-2xl border border-white/10 bg-[#111111] px-4 py-3 text-sm text-white outline-none transition focus:border-white/25"
                              >
                                <option value="sm">Pequeño</option>
                                <option value="md">Mediano</option>
                                <option value="lg">Grande</option>
                              </select>
                            </label>
                          </div>

                          <div className="mt-4 grid gap-4 xl:grid-cols-2">
                            <label className="space-y-2">
                              <span className="text-[11px] uppercase tracking-[0.24em] text-white/35">
                                Pitch
                              </span>
                              <input
                                type="number"
                                step="0.01"
                                min="-90"
                                max="90"
                                value={hotspot.pitch}
                                onChange={(e) =>
                                  onUpdateHotspot(sceneIndex, hotspotIndex, {
                                    pitch: Number(e.target.value),
                                  })
                                }
                                className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition focus:border-white/25"
                              />
                            </label>

                            <label className="space-y-2">
                              <span className="text-[11px] uppercase tracking-[0.24em] text-white/35">
                                Yaw
                              </span>
                              <input
                                type="number"
                                step="0.01"
                                min="-180"
                                max="180"
                                value={hotspot.yaw}
                                onChange={(e) =>
                                  onUpdateHotspot(sceneIndex, hotspotIndex, {
                                    yaw: Number(e.target.value),
                                  })
                                }
                                className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition focus:border-white/25"
                              />
                            </label>
                          </div>

                          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                            <div className="rounded-2xl border border-white/10 px-4 py-3 text-sm text-white/65">
                              <div className="text-[11px] uppercase tracking-[0.22em] text-white/30">
                                Pitch
                              </div>
                              <div className="mt-1 text-white">
                                {Number(hotspot.pitch).toFixed(2)}
                              </div>
                            </div>

                            <div className="rounded-2xl border border-white/10 px-4 py-3 text-sm text-white/65">
                              <div className="text-[11px] uppercase tracking-[0.22em] text-white/30">
                                Yaw
                              </div>
                              <div className="mt-1 text-white">
                                {Number(hotspot.yaw).toFixed(2)}
                              </div>
                            </div>

                            <div className="rounded-2xl border border-white/10 px-4 py-3 text-sm text-white/65">
                              <div className="text-[11px] uppercase tracking-[0.22em] text-white/30">
                                Visible X
                              </div>
                              <div className="mt-1 text-white">
                                {yawToPercent(hotspot.yaw).toFixed(1)}%
                              </div>
                            </div>

                            <div className="rounded-2xl border border-white/10 px-4 py-3 text-sm text-white/65">
                              <div className="text-[11px] uppercase tracking-[0.22em] text-white/30">
                                Visible Y
                              </div>
                              <div className="mt-1 text-white">
                                {pitchToPercent(hotspot.pitch).toFixed(1)}%
                              </div>
                            </div>
                          </div>
                        </article>
                      ))
                    )}
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
