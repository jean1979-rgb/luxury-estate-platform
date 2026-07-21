import { RenderContext } from "../context";
import { loadTemplatePage } from "../templates";

export async function renderPage1(
  ctx: RenderContext,
) {
  const template = await loadTemplatePage(ctx.pdf, 1);

  const page = ctx.pdf.addPage([
    template.width,
    template.height,
  ]);

  page.drawPage(template);

  return page;
}
