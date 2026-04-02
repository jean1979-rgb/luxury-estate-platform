"use client";

import { useState } from "react";
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
  onUpdateScene,
  onAddHotspot,
  onSetActiveHotspotScene,
  onUpdateHotspot,
  onRemoveHotspot,
  yawToPercent,
  pitchToPercent,
}: Props) {
  const [sceneViewDrafts, setSceneViewDrafts] = useState<
    Record<string, { yaw: number; pitch: number }>
  >({});

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
                  const file = e.target.files?.[0];
                  if (file) {
                    await onUploadScene(file);
                  }
                  e.currentTarget.value = "";
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
        <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
          {scenes.map((scene, sceneIndex) => {
            const isHotspotMode = activeHotspotScene === scene.id;

            return (
              <section
                key={scene.id || `scene-${sceneIndex}`}
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

                <div className="space-y-5">
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

                  <div className="aspect-[16/9] min-h-[320px] overflow-hidden rounded-[24px] border border-white/10 bg-black/30">
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
                          setSceneViewDrafts((prev) => ({
                            ...prev,
                            [scene.id || `scene-${sceneIndex}`]: view,
                          }));
                        }}
                      />
                    ) : (
                      <div className="flex aspect-[16/9] items-center justify-center text-sm text-white/35">
                        Agrega una imagen panorámica para activar el visor.
                      </div>
                    )}
                  </div>

                  {sceneViewDrafts[scene.id || `scene-${sceneIndex}`] ? (
                    <>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl border border-white/10 px-4 py-3 text-sm text-white/65">
                          <div className="text-[11px] uppercase tracking-[0.22em] text-white/30">
                            Vista actual yaw
                          </div>
                          <div className="mt-1 text-white">
                            {sceneViewDrafts[scene.id || `scene-${sceneIndex}`].yaw.toFixed(2)}
                          </div>
                        </div>

                        <div className="rounded-2xl border border-white/10 px-4 py-3 text-sm text-white/65">
                          <div className="text-[11px] uppercase tracking-[0.22em] text-white/30">
                            Vista actual pitch
                          </div>
                          <div className="mt-1 text-white">
                            {sceneViewDrafts[scene.id || `scene-${sceneIndex}`].pitch.toFixed(2)}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            const view = sceneViewDrafts[scene.id || `scene-${sceneIndex}`];
                            if (!view) return;

                            onUpdateScene(sceneIndex, {
                              initialYaw: view.yaw,
                              initialPitch: view.pitch,
                            });
                          }}
                          className="rounded-2xl border border-emerald-300/30 bg-emerald-300/10 px-4 py-3 text-sm text-emerald-100 transition hover:bg-emerald-300/15"
                        >
                          Usar vista actual como inicial
                        </button>
                      </div>
                    </>
                  ) : null}

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        onSetActiveHotspotScene(isHotspotMode ? null : scene.id)
                      }
                      className={`rounded-2xl border px-4 py-3 text-sm transition ${
                        isHotspotMode
                          ? "border-amber-300/40 bg-amber-300/10 text-amber-100"
                          : "border-white/15 text-white hover:bg-white/10"
                      }`}
                    >
                      {isHotspotMode ? "Cancelar modo hotspot" : "Agregar hotspot con click"}
                    </button>

                    <div className="text-xs text-white/45">
                      Pitch / Yaw debajo del visor, por hotspot.
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

                          <div className="grid gap-4 xl:grid-cols-4">
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

                          <div className="mt-4 flex flex-wrap items-center gap-3">
                            <button
                              type="button"
                              disabled={!sceneViewDrafts[scene.id || `scene-${sceneIndex}`]}
                              onClick={() => {
                                const view = sceneViewDrafts[scene.id || `scene-${sceneIndex}`];
                                if (!view) return;

                                onUpdateHotspot(sceneIndex, hotspotIndex, {
                                  yaw: view.yaw,
                                  pitch: view.pitch,
                                });
                              }}
                              className="rounded-2xl border border-amber-300/40 px-3 py-2 text-xs text-amber-100 transition hover:bg-amber-300/10 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              Usar vista actual en hotspot
                            </button>
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
