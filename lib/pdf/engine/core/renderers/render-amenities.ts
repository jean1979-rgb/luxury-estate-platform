import type { PDFPage } from "pdf-lib";

import type { RenderContext } from "../../context";
import { render_text } from "./render-text";

export async function render_amenities(
  ctx: RenderContext,
  page: PDFPage,
  template: any,
) {
  await render_text(
    ctx,
    page,
    template,
  );

  // TODO:
  // Renderizar amenidades/factores cuando exista
  // el renderer definitivo.
}
