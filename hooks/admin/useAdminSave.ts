import type { AdminPropertyInput, AdminPropertyRecord } from "@/types/admin";
import { normalizeScenes } from "@/lib/admin/property-normalizer";
import { buildPropertyPayload } from "@/lib/admin/property-payload";
import { saveProperty } from "@/lib/admin/property-save";
import { applyPropertyResult } from "@/lib/admin/property-ui";

type Params = {
  form: AdminPropertyInput;
  forcedPropertyId?: string;
  slugify: (value: string) => string;
  setSaving: (value: boolean) => void;
  setItems: (fn: (prev: AdminPropertyRecord[]) => AdminPropertyRecord[]) => void;
  setSelectedId: (id: string) => void;
  getSelectedId: () => string;
  setForm: (value: AdminPropertyInput) => void;
  setMessage: (value: string) => void;
};

export function useAdminSave({
  form,
  forcedPropertyId,
  slugify,
  setSaving,
  setItems,
  setSelectedId,
  getSelectedId,
  setForm,
  setMessage,
}: Params) {
  async function handleSave(): Promise<boolean> {
    setSaving(true);
    setMessage("");

    try {
      const { normalizedScenes, sceneIdAliases } = normalizeScenes(
        form.scenes360,
        slugify
      );

      console.log("DEBUG_SCENES360_SAVE", JSON.stringify(form.scenes360, null, 2));
    const payload = buildPropertyPayload({
        form,
        normalizedScenes,
        sceneIdAliases,
        slugify,
      });

      console.log("ADMIN_SAVE_PAYLOAD", JSON.stringify({ videoUrl: payload.videoUrl, videoPoster: payload.videoPoster, videoType: payload.videoType, id: payload.id, title: payload.title }, null, 2));
      console.log("ADMIN_SAVE_PAYLOAD", JSON.stringify({
        id: payload.id,
        title: payload.title,
        videoUrl: payload.videoUrl,
        videoPoster: payload.videoPoster,
        videoType: payload.videoType
      }, null, 2));

      const result = await saveProperty({
        payload,
        forcedPropertyId,
      });

      console.log("ADMIN_SAVE_RESULT", JSON.stringify({
        id: result.saved.id,
        videoUrl: result.saved.videoUrl,
        videoPoster: result.saved.videoPoster,
        videoType: result.saved.videoType
      }, null, 2));
      console.log("ADMIN_SAVE_RESULT", JSON.stringify({ videoUrl: result.saved.videoUrl, videoPoster: result.saved.videoPoster, videoType: result.saved.videoType, id: result.saved.id }, null, 2));

      applyPropertyResult({
        saved: result.saved,
        setItems,
        setSelectedId,
        getSelectedId,
        setForm,
        setMessage,
      });

      return true;
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Error inesperado al guardar.");
      return false;
    } finally {
      setSaving(false);
    }
  }

  return { handleSave };
}
