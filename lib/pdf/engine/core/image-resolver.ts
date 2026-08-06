import type { Property } from "../context";

export type EditorialImagePage =
  | "cover"
  | "architecture"
  | "spaces"
  | "materials"
  | "wellness"
  | "gallery"
  | "destination"
  | "investment"
  | "contact";

type AssignmentMap = Record<string, EditorialImagePage>;

function asStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter(
        (v): v is string => typeof v === "string"
      )
    : [];
}

function asAssignmentMap(
  value: unknown,
): AssignmentMap {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    return {};
  }

  const result: AssignmentMap = {};

  for (const [k, v] of Object.entries(value)) {
    if (typeof v === "string") {
      result[k] = v as EditorialImagePage;
    }
  }

  return result;
}

export function getImageForEditorialPage(
  property: Property,
  page: EditorialImagePage,
): string | null {
  console.log("IMAGE RESOLVER EXECUTED");

  const pdfGallery = asStringArray(
    (property as any).pdfGallery,
  );

  const assignments = asAssignmentMap(
    (property as any).pdfAssignments,
  );

  for (const image of pdfGallery) {
    if (assignments[image] === page) {
      console.log("IMAGE RESOLVER RESULT:", page, image);
      return image;
    }
  }

  return null;
}


export function getImagesForEditorialPage(
  property: Property,
  page: EditorialImagePage,
): string[] {
  const pdfGallery = asStringArray(
    (property as any).pdfGallery,
  );

  const assignments = asAssignmentMap(
    (property as any).pdfAssignments,
  );

  return pdfGallery.filter(
    (image) => assignments[image] === page,
  );
}
