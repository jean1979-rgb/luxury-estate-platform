import { RenderContext } from "../context";
import { renderEditorialPage } from "../core/editorial-renderer";

export async function renderPage6(
  ctx: RenderContext,
) {
  return renderEditorialPage(ctx, 6);
}
