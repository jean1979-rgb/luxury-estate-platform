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
  setForm,
  setMessage,
}: Params) {
  async function handleSave() {
    setSaving(true);
    setMessage("");

    try {
      const { normalizedScenes, sceneIdAliases } = normalizeScenes(
        form.scenes360,
        slugify
      );

      const payload = buildPropertyPayload({
        form,
        normalizedScenes,
        sceneIdAliases,
        slugify,
      });

      const result = await saveProperty({
        payload,
        forcedPropertyId,
      });

      applyPropertyResult({
        saved: result.saved,
        setItems,
        setSelectedId,
        setForm,
        setMessage,
      });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Error inesperado al guardar.");
    } finally {
      setSaving(false);
    }
  }

  return { handleSave };
}
