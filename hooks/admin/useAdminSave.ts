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

    const payload = buildPropertyPayload({
        form,
        normalizedScenes,
        sceneIdAliases,
        slugify,
      });


      const selectedId = getSelectedId();
      const propertyIdForSave =
        forcedPropertyId ||
        (selectedId && selectedId !== "new" ? selectedId : payload.id);

      const result = await saveProperty({
        payload: {
          ...payload,
          id: propertyIdForSave,
        },
        forcedPropertyId: propertyIdForSave,
        createNew: !forcedPropertyId && selectedId === "new",
      });


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
