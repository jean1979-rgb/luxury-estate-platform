"use client";

import { useMemo, useState } from "react";
import type {
  AdminHotspot,
  AdminHotspotType,
  AdminPropertyInput,
  AdminScene360,
  PdfEditorialPage,
} from "@/types/admin";
import AdminCoverTab from "@/components/admin/AdminCoverTab";
import AdminPhotosTab from "@/components/admin/AdminPhotosTab";
import AdminScenes360Tab from "@/components/admin/AdminScenes360Tab";
import AdminVideoTab from "@/components/admin/AdminVideoTab";

type MediaTabKey = "cover" | "photos" | "scenes360" | "video";

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
  onTogglePdfImage: (image: string) => void;
  onSetPdfAssignment: (image: string, page: PdfEditorialPage) => void;
  onReorderGallery: (from: number, to: number) => void;
  onAddScene: () => void;
  onReorderScenes: (from: number, to: number) => void;
  onUpdateScene: (index: number, patch: Partial<AdminScene360>) => void;
  onRemoveScene: (index: number) => void;
  onAddHotspot: (sceneIndex: number, coords: { pitch: number; yaw: number }) => void;
  onUpdateHotspot: (sceneIndex: number, hotspotIndex: number, patch: Partial<AdminHotspot>) => void;
  onRemoveHotspot: (sceneIndex: number, hotspotIndex: number) => void;
  onUploadVideo: (file: File) => Promise<void> | void;
  onSave: () => void;
  saving: boolean;
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
  {
    key: "video",
    label: "Video",
    description: "Video interno o URL directa",
  },
];

const HOTSPOT_TYPE_OPTIONS: Array<{ value: AdminHotspotType; label: string }> = [
  { value: "nav", label: "Ir / navegación" },
  { value: "terrace", label: "Terraza" },
  { value: "living", label: "Sala" },
  { value: "dining", label: "Comedor" },
  { value: "kitchen", label: "Cocina" },
  { value: "bedroom", label: "Recámara" },
  { value: "bathroom", label: "Baño" },
  { value: "pool", label: "Alberca" },
  { value: "beach", label: "Playa" },
  { value: "view", label: "Vista" },
  { value: "garden", label: "Jardín" },
  { value: "parking", label: "Estacionamiento" },
  { value: "elevator", label: "Elevador" },
  { value: "gym", label: "Gimnasio" },
  { value: "spa", label: "Spa" },
  { value: "lobby", label: "Lobby" },
  { value: "amenity", label: "Amenidad" },
  { value: "stairs-up", label: "Escalera subida" },
  { value: "stairs-down", label: "Escalera bajada" },
  { value: "room", label: "Espacio / habitación" },
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
  onTogglePdfImage,
  onSetPdfAssignment,
  onReorderGallery,
  onAddScene,
  onReorderScenes,
  onUpdateScene,
  onRemoveScene,
  onAddHotspot,
  onUpdateHotspot,
  onRemoveHotspot,
  onUploadVideo,
  onSave,
  saving,
  yawToPercent,
  pitchToPercent,
}: Props) {
  const [activeTab, setActiveTab] = useState<MediaTabKey>("cover");

  const gallery = Array.isArray(form.gallery) ? form.gallery : [];
  const scenes360 = Array.isArray(form.scenes360) ? form.scenes360 : [];

  const stats = useMemo(
    () => ({
      galleryCount: gallery.length,
      scenesCount: scenes360.length,
      hotspotsCount: scenes360.reduce(
        (acc, scene) => acc + (Array.isArray(scene.hotspots) ? scene.hotspots.length : 0),
        0
      ),
    }),
    [gallery, scenes360]
  );

  return (
    <section className="rounded-[28px] border border-white/10 bg-black/20 p-6">
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="text-[11px] uppercase tracking-[0.3em] text-white/35">
              Media suite
            </div>
            <div className="mt-2 text-sm text-white/55">
              Cover, fotos y escenas 360 en una sola superficie full width.
            </div>
          </div>

          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="rounded-2xl bg-white px-4 py-2 text-sm font-medium text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3 text-sm text-white/65 xl:min-w-[420px]">
          <div className="rounded-2xl border border-white/10 px-4 py-3">
            <div className="text-[11px] uppercase tracking-[0.22em] text-white/30">
              Fotos
            </div>
            <div className="mt-1 text-white">{gallery.length}</div>
          </div>
          <div className="rounded-2xl border border-white/10 px-4 py-3">
            <div className="text-[11px] uppercase tracking-[0.22em] text-white/30">
              Escenas
            </div>
            <div className="mt-1 text-white">{scenes360.length}</div>
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
          gallery={gallery}
          pdfGallery={Array.isArray(form.pdfGallery) ? form.pdfGallery : []}
          pdfAssignments={form.pdfAssignments || {}}
          uploadingGallery={uploadingGallery}
          coverImage={form.coverImage}
          onUploadGallery={(file) => onUpload(file, "gallery")}
          onRemoveGalleryImage={onRemoveGalleryImage}
          onTogglePdfImage={onTogglePdfImage}
          onSetPdfAssignment={onSetPdfAssignment}
          onUseAsCover={(image) => onChange("coverImage", image)}
          onReorderGallery={onReorderGallery}
        />
      ) : null}

      {activeTab === "scenes360" ? (
        <AdminScenes360Tab
          scenes={scenes360}
          uploadingScenes={uploadingScenes}
          activeHotspotScene={activeHotspotScene}
          hotspotTypeOptions={HOTSPOT_TYPE_OPTIONS}
          onUploadScene={(file) => onUpload(file, "scenes360")}
          onAddScene={onAddScene}
          onRemoveScene={onRemoveScene}
          onReorderScenes={onReorderScenes}
          onUpdateScene={onUpdateScene}
          onAddHotspot={onAddHotspot}
          onSetActiveHotspotScene={onSetActiveHotspotScene}
          onUpdateHotspot={onUpdateHotspot}
          onRemoveHotspot={onRemoveHotspot}
          yawToPercent={yawToPercent}
          pitchToPercent={pitchToPercent}
        />
      ) : null}

      {activeTab === "video" ? (
        <AdminVideoTab
          videoUrl={form.videoUrl}
          videoPoster={form.videoPoster}
          videoType={form.videoType}
          onVideoUrlChange={(value) => onChange("videoUrl", value)}
          onVideoPosterChange={(value) => onChange("videoPoster", value)}
          onVideoTypeChange={(value) => onChange("videoType", value)}
          onUploadVideo={onUploadVideo}
        />
      ) : null}
    </section>
  );
}
