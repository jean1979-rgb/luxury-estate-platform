import { RenderContext } from "../context";
import { loadTemplatePage } from "../templates";

export async function renderPage6(
  ctx: RenderContext,
) {
  const template = await loadTemplatePage(ctx.pdf, 6);

  const page = ctx.pdf.addPage([
    template.width,
    template.height,
  ]);

  page.drawPage(template);

  return page;
}
