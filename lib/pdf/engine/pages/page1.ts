import { RenderContext } from "../context";
import { renderEditorialPage } from "../core/editorial-renderer";

export async function renderPage1(
  ctx: RenderContext,
) {
  return renderEditorialPage(ctx, 1);
}
