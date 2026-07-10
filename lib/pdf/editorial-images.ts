import type {
  PdfAssignments,
  PdfEditorialPage,
} from "@/types/admin";

const EDITORIAL_PAGES: PdfEditorialPage[] = [
  "cover",
  "architecture",
  "spaces",
  "materials",
  "wellness",
  "gallery",
  "destination",
  "investment",
  "contact",
];

type Params = {
  gallery: unknown;
  pdfGallery: unknown;
  pdfAssignments: unknown;
  coverImage?: string | null;
};

export type EditorialImageGroups = Record<PdfEditorialPage, string[]> & {
  all: string[];
  selected: string[];
};

function asImageUrlArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return value.filter(
    (item): item is string =>
      typeof item === "string" && item.trim().length > 0
  );
}

function asPdfAssignments(value: unknown): PdfAssignments {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  const result: PdfAssignments = {};

  for (const [image, page] of Object.entries(value)) {
    if (
      typeof image === "string" &&
      image.trim().length > 0 &&
      typeof page === "string" &&
      EDITORIAL_PAGES.includes(page as PdfEditorialPage)
    ) {
      result[image] = page as PdfEditorialPage;
    }
  }

  return result;
}

function uniqueUrls(urls: Array<string | null | undefined>): string[] {
  return Array.from(
    new Set(
      urls.filter(
        (item): item is string =>
          typeof item === "string" && item.trim().length > 0
      )
    )
  );
}

export function resolveEditorialImages({
  gallery,
  pdfGallery,
  pdfAssignments,
  coverImage,
}: Params): EditorialImageGroups {
  const galleryUrls = asImageUrlArray(gallery);
  const selectedPdfUrls = asImageUrlArray(pdfGallery);

  // Si no existen fotos PDF seleccionadas, conserva el comportamiento anterior.
  const selected =
    selectedPdfUrls.length > 0 ? selectedPdfUrls : galleryUrls;

  const assignments = asPdfAssignments(pdfAssignments);

  const groups = Object.fromEntries(
    EDITORIAL_PAGES.map((page) => [page, [] as string[]])
  ) as Record<PdfEditorialPage, string[]>;

  // El orden siempre viene de pdfGallery; nunca del objeto de asignaciones.
  for (const image of selected) {
    const page = assignments[image];

    if (page) {
      groups[page].push(image);
    }
  }

  // La portada explícita de la propiedad siempre tiene prioridad.
  groups.cover = uniqueUrls([
    coverImage,
    ...groups.cover,
  ]);

  return {
    ...groups,
    selected: uniqueUrls(selected),
    all: uniqueUrls([coverImage, ...selected]).slice(0, 16),
  };
}
