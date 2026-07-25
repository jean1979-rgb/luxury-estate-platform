import type { PDFPage } from "pdf-lib";

import type { RenderContext } from "../../context";
import { drawImageCover } from "../image-drawer";

export async function render_qr(
  ctx: RenderContext,
  page: PDFPage,
  template: any,
) {
  const placeholder =
    template.dynamic("Qr");

  if (!placeholder) {
    return;
  }

  const qr =
    (ctx.property as any).qrImage ??
    (ctx.property as any).qr ??
    null;

  if (!qr) {
    return;
  }

  await drawImageCover(
    ctx.pdf,
    page,
    qr,
    placeholder.bounds,
  );
}
