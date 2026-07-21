import { RenderContext } from "../context";
import { loadTemplatePage } from "../templates";

export async function renderPage8(
  ctx: RenderContext,
) {
  const template = await loadTemplatePage(ctx.pdf, 8);

  const page = ctx.pdf.addPage([
    template.width,
    template.height,
  ]);

  page.drawPage(template);

  return page;
}
