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

function isImageFile(file: File) {
  return file.type.startsWith("image/") || /\.(jpg|jpeg|png|webp)$/i.test(file.name);
}

async function normalizeImageInBrowser(file: File) {
  if (!isImageFile(file)) return file;

  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    return file;
  }

  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/jpeg", 0.92);
  });

  if (!blob) return file;

  const cleanName = `${file.name.replace(/\.[^.]+$/, "")}.jpg`;

  return new File([blob], cleanName, {
    type: "image/jpeg",
    lastModified: Date.now(),
  });
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
      setMessage("Preparando archivo...");

      const uploadFile = await normalizeImageInBrowser(file);
      const contentType = uploadFile.type || "application/octet-stream";

      setMessage("Preparando subida directa a R2...");

      const presignRes = await fetch("/api/admin/upload/presign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileName: uploadFile.name,
          contentType,
          kind: folder,
        }),
      });

      const presignData = await presignRes.json().catch(() => ({}));

      if (!presignRes.ok || !presignData?.uploadUrl || !presignData?.url) {
        throw new Error(
          presignData?.error ||
            presignData?.message ||
            `No se pudo preparar la subida. Status ${presignRes.status}`
        );
      }

      setMessage("Subiendo archivo a R2...");

      const uploadRes = await fetch(presignData.uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": contentType,
        },
        body: uploadFile,
      });

      if (!uploadRes.ok) {
        const errorText = await uploadRes.text().catch(() => "");
        throw new Error(
          `No se pudo subir el archivo a R2. Status ${uploadRes.status}. ${errorText.slice(0, 180)}`
        );
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
        const baseId = sceneIdFromFileName(uploadFile.name) || `scene-${Date.now()}`;

        setForm((prev) => ({
          ...prev,
          scenes360: [
            ...prev.scenes360,
            {
              id: baseId,
              title: uploadFile.name.replace(/\.[^.]+$/, ""),
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
