import { rgb, PDFPage } from "pdf-lib";

import type { RenderContext } from "../../context";
import { loadFonts } from "../fonts";
import { drawCenteredText } from "../template-text";
import type { Artboard, TemplateItem } from "../types";

export async function render_score(
  ctx: RenderContext,
  page: PDFPage,
  template: any,
) {
  const item =
    template.field("Numero score") as
      | TemplateItem
      | undefined;

  if (!item) return;

  const artboard =
    template.artboard() as Artboard;

  const fonts =
    await loadFonts(ctx.pdf);

  drawCenteredText(
    page,
    item,
    artboard,
    ctx.document.portada.luxuryScore,
    fonts.trajanLight,
    item.size ?? 70,
    rgb(1,1,1),
  );
}
