import type { PDFPage } from "pdf-lib";

import type { RenderContext } from "../../context";
import { drawImageCover } from "../image-drawer";

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
  const artboard = template.artboard();

  if (!artboard) {
    return;
  }

  let images: string[] = [];

  switch (editorialPage) {

    case "gallery":
      images = ctx.document.galeria.images;
      break;

    case "spaces":
      images = ctx.document.espacios.images;
      break;

    case "materials":
      images = ctx.document.materiales.heroImage
        ? [ctx.document.materiales.heroImage]
        : [];
      break;

    case "wellness":
      images = ctx.document.amenidades.images;
      break;

  }

  if (images.length === 0) {
    return;
  }

  const total = Math.min(
    placeholderNames.length,
    images.length,
  );

  for (let i = 0; i < total; i++) {

    const placeholder =
      template.name(
        placeholderNames[i],
      );

    if (!placeholder) {
      continue;
    }

    await drawImageCover(
      ctx.pdf,
      page,
      images[i],
      placeholder.bounds,
      artboard,
    );
  }
}
