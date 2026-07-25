import { RenderContext } from "../context";
import { renderEditorialPage } from "../core/editorial-renderer";

export async function renderPage4(
  ctx: RenderContext,
) {
  return renderEditorialPage(ctx, 4);
}
