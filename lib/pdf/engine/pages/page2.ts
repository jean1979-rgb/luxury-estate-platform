import { RenderContext } from "../context";
import { renderEditorialPage } from "../core/editorial-renderer";

export async function renderPage2(
  ctx: RenderContext,
) {
  return renderEditorialPage(ctx, 2);
}
