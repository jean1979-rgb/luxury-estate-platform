import { RenderContext } from "../context";
import { renderEditorialPage } from "../core/editorial-renderer";

export async function renderPage3(
  ctx: RenderContext,
) {
  return renderEditorialPage(ctx, 3);
}
