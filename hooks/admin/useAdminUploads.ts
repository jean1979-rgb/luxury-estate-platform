import type { AdminPropertyInput } from "@/types/admin";

type UploadFolder = "cover" | "gallery" | "scenes360" | "video";

type Params = {
  form: AdminPropertyInput;
  selectedId: string;
  slugify: (v: string) => string;
  setUploadingCover: (v: boolean) => void;
  setUploadingGallery: (v: boolean) => void;
  setUploadingScenes: (v: boolean) => void;
  setMessage: (msg: string) => void;
  setForm: (updater: AdminPropertyInput | ((prev: AdminPropertyInput) => AdminPropertyInput)) => void;
};

function sceneIdFromFileName(name: string) {
  return name
    .replace(/\.[^.]+$/, "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

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
  async function onUpload(file: File, folder: UploadFolder) {
    const setUploading =
      folder === "cover"
        ? setUploadingCover
        : folder === "gallery"
          ? setUploadingGallery
          : folder === "scenes360"
            ? setUploadingScenes
            : setUploadingCover;

    try {
      setUploading(true);
      setMessage("");

      const formData = new FormData();
      formData.append("file", file);
      formData.append("kind", folder);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data?.url) {
        throw new Error(data?.error || data?.message || "No se pudo subir el archivo.");
      }

      const url = String(data.url);

      if (folder === "cover") {
        setForm((prev) => ({
          ...prev,
          coverImage: url,
        }));
        setMessage("Cover subida correctamente.");
        return;
      }

      if (folder === "gallery") {
        setForm((prev) => ({
          ...prev,
          gallery: [...prev.gallery, url],
        }));
        setMessage("Imagen agregada a la galería.");
        return;
      }

      if (folder === "scenes360") {
        const baseId = sceneIdFromFileName(file.name) || `scene-${Date.now()}`;

        setForm((prev) => ({
          ...prev,
          scenes360: [
            ...prev.scenes360,
            {
              id: baseId,
              title: file.name.replace(/\.[^.]+$/, ""),
              image: url,
              thumbnail: url,
              initialYaw: 0,
              initialPitch: 0,
              hotspots: [],
            },
          ],
        }));
        setMessage("Panorama 360 agregado correctamente.");
        return;
      }

      setMessage("Upload completado.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Error subiendo archivo.");
    } finally {
      setUploading(false);
    }
  }

  return {
    handleUpload: onUpload,
  };
}
