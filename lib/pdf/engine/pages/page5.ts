import { RenderContext } from "../context";
import { renderEditorialPage } from "../core/editorial-renderer";

export async function renderPage5(
  ctx: RenderContext,
) {
  return renderEditorialPage(ctx, 5);
}
