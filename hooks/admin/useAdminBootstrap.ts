import { useEffect } from "react";
import type { AdminPropertyInput, AdminPropertyRecord } from "@/types/admin";
import type { TokkoAdminItem } from "@/lib/admin/tokko-helpers";
import { mapScenesFromApi } from "@/lib/admin/scene-mappers";

type Params = {
  forcedPropertyId?: string;
  propertyIdFromUrl?: string | null;
  selectedId: string;
  items: AdminPropertyRecord[];
  onLoadingChange: (value: boolean) => void;
  onMessageChange: (value: string) => void;
  onItemsChange: (items: AdminPropertyRecord[]) => void;
  onSelectedIdChange: (value: string) => void;
  onFormChange: (value: AdminPropertyInput | ((prev: AdminPropertyInput) => AdminPropertyInput)) => void;
  onTokkoItemsChange: (items: TokkoAdminItem[]) => void;
  onHiddenIdsChange: (ids: string[]) => void;
  onSelectProperty: (item: AdminPropertyRecord) => void;
};

export function useAdminBootstrap({
  forcedPropertyId,
  propertyIdFromUrl,
  selectedId,
  items,
  onLoadingChange,
  onMessageChange,
  onItemsChange,
  onSelectedIdChange,
  onFormChange,
  onTokkoItemsChange,
  onHiddenIdsChange,
  onSelectProperty,
}: Params) {
  async function loadProperties() {
    onLoadingChange(true);
    onMessageChange("");

    try {
      const res = await fetch("/api/broker/properties", { cache: "no-store" });
      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.message || "No se pudo cargar el admin.");
      }

      const nextItems = data.items || [];
      onItemsChange(nextItems);

      if (!propertyIdFromUrl && !forcedPropertyId && nextItems.length > 0 && selectedId === "new") {
        const first = nextItems[0] as AdminPropertyRecord;
        onSelectedIdChange(first.id);
        onFormChange({
          id: first.id,
          title: first.title,
          slug: first.slug,
          status: first.status,
          propertyType: first.propertyType,
          location: first.location,
          zoneSlug: first.zoneSlug || "",
          zoneLabel: first.zoneLabel || "",
          price: first.price,
          currency: first.currency,
          bedrooms: first.bedrooms,
          bathrooms: first.bathrooms,
          halfBathrooms: first.halfBathrooms ?? 0,
          areaInterior: first.areaInterior,
          areaTotal: first.areaTotal,
          tagline: first.tagline,
          coverImage: first.coverImage,
          gallery: Array.isArray(first.gallery) ? first.gallery : [],
          pdfGallery: Array.isArray((first as any).pdfGallery) ? (first as any).pdfGallery : [],
      pdfAssignments:
        first.pdfAssignments &&
        typeof first.pdfAssignments === "object" &&
        !Array.isArray(first.pdfAssignments)
          ? first.pdfAssignments
          : {},
          videoUrl: first.videoUrl || "",
          videoPoster: first.videoPoster || "",
          videoType: first.videoType || "upload",
          scenes360: Array.isArray(first.scenes360) ? first.scenes360 : [],
          featured: first.featured,
          published: first.published,
          luxuryScore: first.luxuryScore,
          pemFactors: first.pemFactors || {},
          materials: Array.isArray(first.materials) ? first.materials : [],
          description: first.description,
        });
      }
    } catch (error) {
      onMessageChange(error instanceof Error ? error.message : "Error inesperado.");
    } finally {
      onLoadingChange(false);
    }
  }

  async function loadTokko() {
    try {
      const res = await fetch("/api/admin/tokko", { cache: "no-store" });
      const data = await res.json();
      onTokkoItemsChange(data.items || []);

      const vis = await fetch("/api/admin/visibility", { cache: "no-store" });
      const vjson = await vis.json();
      onHiddenIdsChange(vjson.hiddenIds || []);
    } catch (e) {
      console.error("Tokko load error", e);
    }
  }

  useEffect(() => {
    loadProperties();
    loadTokko();
  }, []);

  useEffect(() => {
    if (!forcedPropertyId) return;

    async function loadScenesFromDB() {
      try {
        const res = await fetch(`/api/broker/scenes/${forcedPropertyId}`);
        const data = await res.json();

        if (!res.ok || !data.ok) return;

        const mappedScenes = mapScenesFromApi(data.scenes);

        onFormChange((prev) => ({
          ...prev,
          scenes360: mappedScenes,
        }));
      } catch (e) {
        console.error("Error loading scenes from DB", e);
      }
    }

    loadScenesFromDB();
  }, [forcedPropertyId]);

  useEffect(() => {
    if (!propertyIdFromUrl) return;
    if (!items.length) return;

    const target = items.find((item) => item.id === propertyIdFromUrl);
    if (!target) return;

    onSelectProperty(target);
  }, [propertyIdFromUrl, items]);

  return {
    loadProperties,
    loadTokko,
  };
}
