"use client";

import { useMemo, useState } from "react";
import type { AdminHotspot, AdminHotspotType, AdminPropertyInput, AdminScene360 } from "@/types/admin";
import AdminCoverTab from "@/components/admin/AdminCoverTab";
import AdminPhotosTab from "@/components/admin/AdminPhotosTab";
import AdminScenes360Tab from "@/components/admin/AdminScenes360Tab";

type MediaTabKey = "cover" | "photos" | "scenes360";

type Props = {
  form: AdminPropertyInput;
  uploadingCover: boolean;
  uploadingGallery: boolean;
  uploadingScenes: boolean;
  activeHotspotScene: string | null;
  onSetActiveHotspotScene: (sceneId: string | null) => void;
  onChange: <K extends keyof AdminPropertyInput>(key: K, value: AdminPropertyInput[K]) => void;
  onUpload: (file: File, folder: "cover" | "gallery" | "scenes360") => Promise<void> | void;
  onRemoveGalleryImage: (index: number) => void;
  onAddScene: () => void;
  onUpdateScene: (index: number, patch: Partial<AdminScene360>) => void;
  onRemoveScene: (index: number) => void;
  onAddHotspot: (sceneIndex: number, coords: { pitch: number; yaw: number }) => void;
  onUpdateHotspot: (sceneIndex: number, hotspotIndex: number, patch: Partial<AdminHotspot>) => void;
  onRemoveHotspot: (sceneIndex: number, hotspotIndex: number) => void;
  yawToPercent: (yaw: number) => number;
  pitchToPercent: (pitch: number) => number;
};

const TAB_META: Array<{ key: MediaTabKey; label: string; description: string }> = [
  {
    key: "cover",
    label: "Cover",
    description: "Portada principal + editorial",
  },
  {
    key: "photos",
    label: "Fotos",
    description: "Galería densa con scroll interno",
  },
  {
    key: "scenes360",
    label: "360",
    description: "Escenas, visor, hotspots y coordenadas",
  },
];

const HOTSPOT_TYPE_OPTIONS: Array<{ value: AdminHotspotType; label: string }> = [
  { value: "nav", label: "Navegación" },
  { value: "stairs-up", label: "Escalera subida" },
  { value: "stairs-down", label: "Escalera bajada" },
  { value: "terrace", label: "Terraza" },
  { value: "room", label: "Habitación" },
  { value: "amenity", label: "Amenidad" },
  { value: "kitchen", label: "Cocina" },
];

export default function AdminMediaTabs({
  form,
  uploadingCover,
  uploadingGallery,
  uploadingScenes,
  activeHotspotScene,
  onSetActiveHotspotScene,
  onChange,
  onUpload,
  onRemoveGalleryImage,
  onAddScene,
  onUpdateScene,
  onRemoveScene,
  onAddHotspot,
  onUpdateHotspot,
  onRemoveHotspot,
  yawToPercent,
  pitchToPercent,
}: Props) {
  const [activeTab, setActiveTab] = useState<MediaTabKey>("cover");

  const stats = useMemo(
    () => ({
      galleryCount: form.gallery.length,
      scenesCount: form.scenes360.length,
      hotspotsCount: form.scenes360.reduce((acc, scene) => acc + scene.hotspots.length, 0),
    }),
    [form.gallery, form.scenes360]
  );

  return (
    <section className="rounded-[28px] border border-white/10 bg-black/20 p-6">
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-[0.3em] text-white/35">
            Media suite
          </div>
          <div className="mt-2 text-sm text-white/55">
            Cover, fotos y escenas 360 en una sola superficie full width.
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 text-sm text-white/65 xl:min-w-[420px]">
          <div className="rounded-2xl border border-white/10 px-4 py-3">
            <div className="text-[11px] uppercase tracking-[0.22em] text-white/30">
              Fotos
            </div>
            <div className="mt-1 text-white">{form.gallery.length}</div>
          </div>
          <div className="rounded-2xl border border-white/10 px-4 py-3">
            <div className="text-[11px] uppercase tracking-[0.22em] text-white/30">
              Escenas
            </div>
            <div className="mt-1 text-white">{form.scenes360.length}</div>
          </div>
          <div className="rounded-2xl border border-white/10 px-4 py-3">
            <div className="text-[11px] uppercase tracking-[0.22em] text-white/30">
              Hotspots
            </div>
            <div className="mt-1 text-white">{stats.hotspotsCount}</div>
          </div>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        {TAB_META.map((tab) => {
          const isActive = tab.key === activeTab;

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-2xl border px-4 py-3 text-left transition ${
                isActive
                  ? "border-white/30 bg-white/10 text-white"
                  : "border-white/10 text-white/65 hover:bg-white/5"
              }`}
            >
              <div className="text-sm font-medium">{tab.label}</div>
              <div className="mt-1 text-[11px] uppercase tracking-[0.18em] text-white/35">
                {tab.description}
              </div>
            </button>
          );
        })}
      </div>

      {activeTab === "cover" ? (
        <AdminCoverTab
          coverImage={form.coverImage}
          description={form.description}
          uploadingCover={uploadingCover}
          onCoverImageChange={(value) => onChange("coverImage", value)}
          onDescriptionChange={(value) => onChange("description", value)}
          onUploadCover={(file) => onUpload(file, "cover")}
        />
      ) : null}

      {activeTab === "photos" ? (
        <AdminPhotosTab
          gallery={form.gallery}
          uploadingGallery={uploadingGallery}
          coverImage={form.coverImage}
          onUploadGallery={(file) => onUpload(file, "gallery")}
          onRemoveGalleryImage={onRemoveGalleryImage}
          onUseAsCover={(image) => onChange("coverImage", image)}
        />
      ) : null}

      {activeTab === "scenes360" ? (
        <AdminScenes360Tab
          scenes={form.scenes360}
          uploadingScenes={uploadingScenes}
          activeHotspotScene={activeHotspotScene}
          hotspotTypeOptions={HOTSPOT_TYPE_OPTIONS}
          onUploadScene={(file) => onUpload(file, "scenes360")}
          onAddScene={onAddScene}
          onRemoveScene={onRemoveScene}
          onUpdateScene={onUpdateScene}
          onAddHotspot={onAddHotspot}
          onSetActiveHotspotScene={onSetActiveHotspotScene}
          onUpdateHotspot={onUpdateHotspot}
          onRemoveHotspot={onRemoveHotspot}
          yawToPercent={yawToPercent}
          pitchToPercent={pitchToPercent}
        />
      ) : null}
    </section>
  );
}
