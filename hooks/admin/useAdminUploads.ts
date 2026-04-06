import { addScene, buildScene } from "@/lib/admin/editor-commands";
import type { AdminPropertyInput } from "@/types/admin";

type UploadFolder = "cover" | "gallery" | "scenes360";

type Params = {
  form: AdminPropertyInput;
  selectedId: string;
  slugify: (value: string) => string;
  setUploadingCover: (value: boolean) => void;
  setUploadingGallery: (value: boolean) => void;
  setUploadingScenes: (value: boolean) => void;
  setMessage: (value: string) => void;
  setForm: (value: AdminPropertyInput | ((prev: AdminPropertyInput) => AdminPropertyInput)) => void;
};

export function useAdminUploads({
  form,
  selectedId,
  slugify,
  setUploadingCover,
  setUploadingGallery,
  setUploadingScenes,
  setMessage,
  setForm,
}: Params) {
  async function handleUpload(file: File, folder: UploadFolder) {
    const computedEntityId = slugify(
      form.slug ||
      form.id ||
      (selectedId !== "new" ? selectedId : "") ||
      form.title ||
      "temp-property"
    );

    if (folder === "cover") setUploadingCover(true);
    if (folder === "gallery") setUploadingGallery(true);
    if (folder === "scenes360") setUploadingScenes(true);

    setMessage("");

    try {
      const body = new FormData();
      body.append("file", file);
      body.append("entityType", "property");
      body.append("entityId", computedEntityId);
      body.append("folder", folder);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body,
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.message || "No se pudo subir el archivo.");
      }

      const uploadedUrl = data.file.url as string;

      if (folder === "cover") {
        setForm((prev) => ({
          ...prev,
          id: prev.id || computedEntityId,
          slug: prev.slug || prev.id || computedEntityId,
          coverImage: uploadedUrl,
        }));
      }

      if (folder === "gallery") {
        setForm((prev) => ({
          ...prev,
          id: prev.id || computedEntityId,
          slug: prev.slug || computedEntityId,
          gallery: [...prev.gallery, uploadedUrl],
        }));
      }

      if (folder === "scenes360") {
        const cleanName = file.name.replace(/\.[^/.]+$/, "");
        const scene = buildScene(cleanName, uploadedUrl, slugify);

        setForm((prev) => ({
          ...prev,
          id: prev.id || computedEntityId,
          slug: prev.slug || computedEntityId,
          scenes360: addScene(prev.scenes360, scene),
        }));
      }

      setMessage("Archivo subido correctamente. Imagen agregada correctamente.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Error inesperado al subir archivo.");
    } finally {
      if (folder === "cover") setUploadingCover(false);
      if (folder === "gallery") setUploadingGallery(false);
      if (folder === "scenes360") setUploadingScenes(false);
    }
  }

  return { handleUpload };
}
