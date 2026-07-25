import type { PDFPage } from "pdf-lib";

import type { RenderContext } from "../../context";
import { getImageForEditorialPage } from "../image-resolver";
import { drawImageCover } from "../image-drawer";

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

export async function render_single_image(
  ctx: RenderContext,
  page: PDFPage,
  template: any,
  editorialPage: EditorialImagePage,
  placeholderName = "Foto principal",
) {
  const placeholder =
    template.dynamic(placeholderName);

  if (!placeholder) {
    return;
  }

  const image =
    getImageForEditorialPage(
      ctx.property,
      editorialPage,
    );

  if (!image) {
    return;
  }

  await drawImageCover(
    ctx.pdf,
    page,
    image,
    placeholder.bounds,
  );
}
