import type { PDFPage } from "pdf-lib";

import type { RenderContext } from "../../context";
import { render_gallery } from "./render-gallery";

export async function render_materials(
  ctx: RenderContext,
  page: PDFPage,
  template: any,
) {
  return render_gallery(
    ctx,
    page,
    template,
    "materials",
    [
      "Material 1",
      "Material 2",
      "Material 3",
      "Material 4",
    ],
  );
}
