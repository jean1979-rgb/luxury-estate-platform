import { rgb, PDFPage } from "pdf-lib";

import type { RenderContext } from "../../context";
import { loadFonts } from "../fonts";
import { drawCenteredText } from "../template-text";
import type { Artboard, TemplateItem } from "../types";

export async function render_text(
  ctx: RenderContext,
  page: PDFPage,
  template: any,
) {
  const artboard = template.artboard() as Artboard;
  const fonts = await loadFonts(ctx.pdf);
  const portada = ctx.document.portada;

  const values = {
    classification: portada.classification,
    title: portada.title,
    subtitle: portada.subtitle,
    editorial_quote: portada.editorialQuote,
    collection: portada.collection,
    price: portada.price,
    bedrooms: portada.bedrooms,
    bathrooms: portada.bathrooms,
    area: portada.area,
    luxuryScore: portada.luxuryScore,
    phone: portada.phone,
  };

  const fields = [
    ["classification", "trajanSemibold", rgb(197 / 255, 141 / 255, 66 / 255), 9.65],
    ["title", "trajanLight", rgb(1, 1, 1), 15],
    ["subtitle", "trajanLight", rgb(1, 1, 1), 11],
    ["editorial_quote", "trajanLight", rgb(1, 1, 1), 10],
    ["collection", "trajanLight", rgb(1, 1, 1), 12],
    ["price", "trajanLight", rgb(1, 1, 1), 12],
    ["bedrooms", "trajanLight", rgb(1, 1, 1), 12],
    ["bathrooms", "trajanLight", rgb(1, 1, 1), 12],
    ["area", "trajanLight", rgb(1, 1, 1), 12],
    ["Numero score", "trajanLight", rgb(1, 1, 1), 70],
    ["phone", "trajanLight", rgb(1, 1, 1), 11],
  ] as const;

  for (const [field, font, color, defaultSize] of fields) {
    const item =
      template.field(field) as TemplateItem | undefined;

    if (!item) continue;

    const key =
      field === "Numero score"
        ? "luxuryScore"
        : field;

    drawCenteredText(
      page,
      item,
      artboard,
      values[key as keyof typeof values] ?? "",
      fonts[font],
      item.size ?? defaultSize,
      color,
    );
  }
}
