import { RenderContext } from "../context";
import { loadTemplatePage } from "../templates";

export async function renderPage4(
  ctx: RenderContext,
) {
  const template = await loadTemplatePage(ctx.pdf, 4);

  const page = ctx.pdf.addPage([
    template.width,
    template.height,
  ]);

  page.drawPage(template);

  return page;
}
