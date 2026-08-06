import type { PDFPage } from "pdf-lib";

import type { RenderContext } from "../../context";
import { drawImageCover } from "../image-drawer";

export async function render_qr(
  ctx: RenderContext,
  page: PDFPage,
  template: any,
) {
  const artboard = template.artboard();

  if (!artboard) {
    return;
  }

  const placeholder =
    template.dynamic("Qr");

  if (!placeholder) {
    return;
  }

  const qr =
    ctx.document.cierre.qr;

  if (!qr) {
    return;
  }

  await drawImageCover(
    ctx.pdf,
    page,
    qr,
    placeholder.bounds,
    artboard,
  );
}
