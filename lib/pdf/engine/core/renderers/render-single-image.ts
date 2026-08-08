import type { PDFPage } from "pdf-lib";

import type { RenderContext } from "../../context";
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
  const artboard = template.artboard();

  if (!artboard) {
    return;
  }

  const placeholder =
    template.name(placeholderName);

  console.log("===== SINGLE IMAGE =====");
  console.log("editorialPage:", editorialPage);
  console.log("placeholder :", placeholderName);
  console.log("found       :", Boolean(placeholder));

  if (!placeholder) {
    return;
  }

  let image: string | null = null;

  switch (editorialPage) {

    case "cover":
      image = ctx.document.portada.coverImage;
      break;

    case "architecture":
      image =
        ctx.document.arquitectura.images[0] ?? null;
      break;

    case "materials":
      image = ctx.document.materiales.heroImage;
      break;

    case "destination":
      image = ctx.document.destino.mapImage;
      break;

    case "investment":
      image = ctx.document.inversion.graph;
      break;

    case "contact":
      image = ctx.document.cierre.qr;
      break;

    default:
      image = null;
      break;

  }

  console.log("image:", image);

  if (!image) {
    return;
  }

  await drawImageCover(
    ctx.pdf,
    page,
    image,
    placeholder.bounds,
    artboard,
    placeholderName,
  );
}
