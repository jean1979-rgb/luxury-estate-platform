"use client";

import { useEffect, useRef, useState } from "react";
import Viewer360AdminLegacy from "@/components/Viewer360AdminLegacy";
import type { AdminHotspot, AdminHotspotType, AdminScene360 } from "@/types/admin";

function angularDeltaDeg(a: number, b: number) {
  const diff = Math.abs(a - b) % 360;
  return diff > 180 ? 360 - diff : diff;
}

function sceneIdFromFileName(name: string) {
  return name
    .replace(/\.[^.]+$/, "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+\|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

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
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);

  const dragSceneIndexRef = useRef<number | null>(null);
  const latestViewRef = useRef<Record<string, { yaw: number; pitch: number }>>({});


  useEffect(() => {
    if (!scenes.length) {
      setActiveSceneIndex(0);
      return;
    }

    if (activeSceneIndex > scenes.length - 1) {
      setActiveSceneIndex(0);
    }
  }, [scenes, activeSceneIndex]);


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
            <label className="inline-flex cursor-pointer items-center rounded-2xl border border-white/15 px-5 py-4 text-[15px] text-white transition hover:bg-white/10">
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
        <div className="space-y-6">
          {scenes
  .map((scene, realSceneIndex) => ({ scene, realSceneIndex }))
  .filter(({ scene, realSceneIndex }) => {
    return realSceneIndex === activeSceneIndex;
  })
  .map(({ scene, realSceneIndex }) => {
            const sceneIndex = realSceneIndex;
            const sceneViewKey = `-`;
            const isHotspotMode = activeHotspotScene === scene.id;

            return (
              <section
                key={`scene-card-${sceneIndex}`}
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
                    className="rounded-2xl border border-white/10 px-5 py-4 text-[15px] text-white/75 transition hover:bg-white/10"
                  >
                    Eliminar escena
                  </button>
                </div>

                <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
                  <div className="space-y-4">
                    <div className="grid gap-4 lg:grid-cols-2">
                      <label className="space-y-2">
                        <span className="text-xs uppercase tracking-[0.24em] text-white/35">
                          Scene ID
                        </span>
                        <input
                          value={scene.id ?? ""}
                          readOnly
                          className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/70 outline-none"
                          placeholder="scene-id"
                        />
                      </label>

                      <label className="space-y-2">
                        <span className="text-xs uppercase tracking-[0.24em] text-white/35">
                          Título
                        </span>
                        <input
                          value={scene.title ?? ""}
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
                        value={scene.image ?? ""}
                        onChange={(e) =>
                          onUpdateScene(sceneIndex, {
                            image: e.target.value,
                            thumbnail: e.target.value,
                          })
                        }
                        className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-white/25"
                        placeholder="https://pub-97c7fb12e7244f288f056306452e2d7d.r2.dev/scenes360/panorama.jpg"
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

<div className="mb-4">
  <div className="grid grid-cols-3 gap-2">
    {scenes.map((item, idx) => {
      const isActive = activeSceneIndex === idx;

      return (
        <button
          key={`scene-chip-${idx}`}
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
          onClick={() => setActiveSceneIndex(idx)}
          className={[
            "min-w-0 rounded-lg border px-2.5 py-1.5 text-left transition",
            isActive
              ? "border-white bg-white text-black"
              : "border-white/20 bg-black/20 text-white hover:bg-white/10",
          ].join(" ")}
        >
          <div className="truncate text-[11px] font-medium leading-tight">
            {idx + 1}. {item.title || `Escena ${idx + 1}`}
          </div>
          <div className={`mt-0.5 truncate text-[10px] leading-tight ${isActive ? "text-black/60" : "text-white/40"}`}>
            {item.id || "sin-id"}
          </div>
        </button>
      );
    })}
  </div>
</div>

<div className="rounded-[24px] border border-white/10 bg-black/25 p-2.5">
                      <div className="relative w-full aspect-[16/10] cursor-grab overflow-hidden rounded-[20px] border border-white/10 bg-black/30 active:cursor-grabbing">
                        {scene.image ? (
                          <Viewer360AdminLegacy
                            key={`${scene.id}-${scene.image}-${scene.initialYaw ?? 0}-${scene.initialPitch ?? 0}`}
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
                              latestViewRef.current[sceneViewKey] = {
                                yaw: Number(view.yaw.toFixed(2)),
                                pitch: Number(view.pitch.toFixed(2)),
                              };
                            }}
                            onHotspotClick={(targetSceneId) => {
      if (!targetSceneId) return;
      const nextIndex = scenes.findIndex((item) => item.id === targetSceneId);
      if (nextIndex === -1) return;
      setActiveSceneIndex(nextIndex);
    }}
/>
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-sm text-white/35">
                            Agrega una imagen panorámica para activar el visor.
                          </div>
                        )}
                      </div>
                    </div>

<div className="flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            onSetActiveHotspotScene(isHotspotMode ? null : scene.id)
                          }
                          className={[
                            "rounded-2xl border px-5 py-4 text-[15px] transition",
                            isHotspotMode
                              ? "border-emerald-300/40 bg-emerald-300/10 text-emerald-100"
                              : "border-white/15 text-white hover:bg-white/10",
                          ].join(" ")}
                        >
                          {isHotspotMode
                            ? "Salir de modo hotspot"
                            : "Agregar hotspots desde el visor"}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            const view = latestViewRef.current[sceneViewKey] ?? {
                              yaw: Number((scene.initialYaw ?? 0).toFixed(2)),
                              pitch: Number((scene.initialPitch ?? 0).toFixed(2)),
                            };

                            onUpdateScene(sceneIndex, {
                              initialYaw: view.yaw,
                              initialPitch: view.pitch,
                            });
                          }}
                          className="rounded-2xl border border-white/15 px-5 py-4 text-[15px] text-white transition hover:bg-white/10"
                        >
                          Usar esta vista para inicio
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            const view = latestViewRef.current[sceneViewKey] ?? {
                              yaw: Number((scene.initialYaw ?? 0).toFixed(2)),
                              pitch: Number((scene.initialPitch ?? 0).toFixed(2)),
                            };

                            onSetActiveHotspotScene(scene.id);
                            onAddHotspot(sceneIndex, view);
                          }}
                          className="rounded-2xl border border-white/15 px-5 py-4 text-[15px] text-white transition hover:bg-white/10"
                        >
                          Usar esta vista para hotspots
                        </button>

                        <div className="text-xs text-white/45">
                          {isHotspotMode
                            ? "Haz click dentro del panorama para crear hotspots."
                            : "Mueve la cámara y guarda manualmente la vista o entra a modo hotspot."}
                        </div>
                      </div>
                  </div>

                  <div className="space-y-5 lg:pt-14 lg:max-h-[calc(100vh-12rem)] lg:overflow-y-auto lg:pr-2">
                    {scene.hotspots.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-white/10 px-4 py-6 text-sm text-white/35">
                        Esta escena aún no tiene hotspots.
                      </div>
                    ) : (
                      scene.hotspots.map((hotspot, hotspotIndex) => (
                        <article
                          key={hotspot.id || `hotspot-${hotspotIndex}`}
                          className="rounded-2xl border border-white/10 bg-black/20 p-4 sm:p-5"
                        >
                          <div className="mb-4 flex items-center justify-between gap-3">
                            <div className="text-sm font-medium text-white">
                              Hotspot {hotspotIndex + 1}
                            </div>
                            <button
                              type="button"
                              onClick={() => onRemoveHotspot(sceneIndex, hotspotIndex)}
                              className="rounded-xl border border-white/10 px-2.5 py-1.5 text-[11px] text-white/75 transition hover:bg-white/10"
                            >
                              Eliminar hotspot
                            </button>
                          </div>

                          <div className="grid gap-4">
                            <label className="space-y-2">
                              <span className="text-[11px] uppercase tracking-[0.24em] text-white/35">
                                Label
                              </span>
                              <input
                                value={hotspot.label ?? ""}
                                onChange={(e) =>
                                  onUpdateHotspot(sceneIndex, hotspotIndex, {
                                    label: e.target.value,
                                  })
                                }
                                className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 text-[15px] text-white outline-none transition placeholder:text-white/25 focus:border-white/25"
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
                                className="w-full rounded-2xl border border-white/10 bg-[#111111] px-5 py-4 text-[15px] text-white outline-none transition focus:border-white/25"
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
                                className="w-full rounded-2xl border border-white/10 bg-[#111111] px-5 py-4 text-[15px] text-white outline-none transition focus:border-white/25"
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
                                className="w-full rounded-2xl border border-white/10 bg-[#111111] px-5 py-4 text-[15px] text-white outline-none transition focus:border-white/25"
                              >
                                <option value="sm">Pequeño</option>
                                <option value="md">Mediano</option>
                                <option value="lg">Grande</option>
                              </select>
                            </label>
                          </div>

                          <div className="mt-4 grid gap-4 sm:grid-cols-2">
                            <label className="space-y-2">
                              <span className="text-[11px] uppercase tracking-[0.24em] text-white/35">
                                Pitch
                              </span>
                              <input
                                type="number"
                                step="0.01"
                                min="-90"
                                max="90"
                                value={hotspot.pitch ?? 0}
                                onChange={(e) =>
                                  onUpdateHotspot(sceneIndex, hotspotIndex, {
                                    pitch: Number(e.target.value),
                                  })
                                }
                                className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 text-[15px] text-white outline-none transition focus:border-white/25"
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
                                value={hotspot.yaw ?? 0}
                                onChange={(e) =>
                                  onUpdateHotspot(sceneIndex, hotspotIndex, {
                                    yaw: Number(e.target.value),
                                  })
                                }
                                className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 text-[15px] text-white outline-none transition focus:border-white/25"
                              />
                            </label>
                          </div>

                          <div className="mt-4 grid grid-cols-2 gap-3">
                            <div className="rounded-2xl border border-white/10 px-5 py-4 text-[15px] text-white/65">
                              <div className="text-[11px] uppercase tracking-[0.22em] text-white/30">
                                Pitch
                              </div>
                              <div className="mt-1 text-white">
                                {Number(hotspot.pitch).toFixed(2)}
                              </div>
                            </div>

                            <div className="rounded-2xl border border-white/10 px-5 py-4 text-[15px] text-white/65">
                              <div className="text-[11px] uppercase tracking-[0.22em] text-white/30">
                                Yaw
                              </div>
                              <div className="mt-1 text-white">
                                {Number(hotspot.yaw).toFixed(2)}
                              </div>
                            </div>

                            <div className="rounded-2xl border border-white/10 px-5 py-4 text-[15px] text-white/65">
                              <div className="text-[11px] uppercase tracking-[0.22em] text-white/30">
                                Visible X
                              </div>
                              <div className="mt-1 text-white">
                                {yawToPercent(hotspot.yaw).toFixed(1)}%
                              </div>
                            </div>

                            <div className="rounded-2xl border border-white/10 px-5 py-4 text-[15px] text-white/65">
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
