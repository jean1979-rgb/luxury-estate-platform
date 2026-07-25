import { RenderContext } from "../context";
import { renderEditorialPage } from "../core/editorial-renderer";

export async function renderPage8(
  ctx: RenderContext,
) {
  return renderEditorialPage(ctx, 8);
}
