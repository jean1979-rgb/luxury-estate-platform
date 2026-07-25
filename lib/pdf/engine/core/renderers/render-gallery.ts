import type { PDFPage } from "pdf-lib";

import type { RenderContext } from "../../context";
import { drawImageCover } from "../image-drawer";
import { getImagesForEditorialPage } from "../image-resolver";

export async function render_gallery(
  ctx: RenderContext,
  page: PDFPage,
  template: any,
  editorialPage:
    | "gallery"
    | "spaces"
    | "materials"
    | "wellness",
  placeholderNames: string[],
) {

  const images =
    getImagesForEditorialPage(
      ctx.property,
      editorialPage,
    );

  if (!Array.isArray(images) || images.length === 0) {
    return;
  }

  const total =
    Math.min(
      placeholderNames.length,
      images.length,
    );

  for (let i = 0; i < total; i++) {

    const placeholder =
      template.dynamic(
        placeholderNames[i],
      );

    if (!placeholder) continue;

    await drawImageCover(
      ctx.pdf,
      page,
      images[i],
      placeholder.bounds,
    );
  }
}
