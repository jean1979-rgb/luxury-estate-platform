import { EMPTY_ADMIN_PROPERTY, type AdminPropertyInput, type AdminPropertyRecord } from "@/types/admin";
import { isTokkoAdminItem, mapTokkoToAdminProperty } from "@/lib/admin/tokko-helpers";

type Params = {
  items: AdminPropertyRecord[];
  selectedId: string;
  forcedPropertyId?: string;
  slugify: (v: string) => string;
  setItems: (fn: (prev: AdminPropertyRecord[]) => AdminPropertyRecord[]) => void;
  setSelectedId: (id: string) => void;
  setForm: (value: AdminPropertyInput) => void;
  setMessage: (msg: string) => void;
  setSaving: (v: boolean) => void;
  setHiddenIds: (ids: string[]) => void;
};

export function useAdminMutations({
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
}: Params) {

  async function handleDelete() {
    if (!selectedId || selectedId === "new") return;

    const confirmDelete = confirm("¿Seguro que quieres eliminar esta propiedad?");
    if (!confirmDelete) return;

    try {
      setSaving(true);

      const res = await fetch(`/api/broker/properties/${selectedId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.message || "Error al eliminar");
      }

      const refreshed = await fetch("/api/broker/properties", {
        cache: "no-store",
      });

      const json = await refreshed.json();

      setItems(() => json.items || []);
      setSelectedId("new");
      setForm({
        ...EMPTY_ADMIN_PROPERTY,
        zoneSlug: "",
        zoneLabel: "",
      });

      setMessage("Propiedad eliminada correctamente");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Error eliminando propiedad");
    } finally {
      setSaving(false);
    }
  }

  async function toggleVisibility(id: string) {
    const res = await fetch("/api/admin/visibility", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    const data = await res.json();
    setHiddenIds(data.hiddenIds || []);
  }

  async function handleTokkoSync() {
    const res = await fetch("/api/admin/tokko");
    const data = await res.json();

    if (!res.ok) {
      alert("Error al sincronizar Tokko");
      return;
    }

    alert("Tokko actualizado");

    const refreshed = await fetch("/api/broker/properties", { cache: "no-store" });
    const json = await refreshed.json();
    setItems(() => json.items || []);
  }

  async function importFromTokko(item: unknown) {
    if (!isTokkoAdminItem(item)) {
      throw new Error("Tokko item inválido.");
    }

    if (items.some((p) => p.source?.externalId === item.id)) {
      alert("Ya importada");
      return;
    }

    const payload: AdminPropertyInput = {
      ...mapTokkoToAdminProperty(item),
      slug: slugify(item.editorial?.title || item.base?.title || item.id || "propiedad"),
    };

    const res = await fetch("/api/broker/properties", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok || !data.ok) {
      throw new Error(data.message || "No se pudo importar la propiedad.");
    }

    const saved = data.property as AdminPropertyRecord;

    await fetch(`/api/broker/scenes/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ scenes: payload.scenes360 }),
    });

    setItems((prev) => {
      const exists = prev.some((entry) => entry.id === saved.id);
      return exists
        ? prev.map((entry) => (entry.id === saved.id ? saved : entry))
        : [saved, ...prev];
    });

    setSelectedId(saved.id);
    setForm(saved);
    setMessage("Propiedad importada correctamente.");
  }

  return {
    handleDelete,
    toggleVisibility,
    handleTokkoSync,
    importFromTokko,
  };
}
