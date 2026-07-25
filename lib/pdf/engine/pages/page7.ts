import { RenderContext } from "../context";
import { renderEditorialPage } from "../core/editorial-renderer";

export async function renderPage7(
  ctx: RenderContext,
) {
  return renderEditorialPage(ctx, 7);
}
