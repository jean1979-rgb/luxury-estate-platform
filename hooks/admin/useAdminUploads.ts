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

      const presignRes = await fetch("/api/admin/upload/presign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type || "application/octet-stream",
          kind: folder,
        }),
      });

      const presignData = await presignRes.json().catch(() => ({}));

      if (!presignRes.ok || !presignData?.uploadUrl || !presignData?.url) {
        throw new Error(presignData?.error || presignData?.message || "No se pudo preparar la subida.");
      }

      const uploadRes = await fetch(presignData.uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type || "application/octet-stream",
        },
        body: file,
      });

      if (!uploadRes.ok) {
        throw new Error("No se pudo subir el archivo a R2.");
      }

      const url = String(presignData.url);

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
