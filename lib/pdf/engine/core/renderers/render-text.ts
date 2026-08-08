import { rgb, PDFPage } from "pdf-lib";

import type { RenderContext } from "../../context";
import { loadFonts } from "../fonts";
import {
  drawCenteredText,
  drawCenteredTextAutoFit,
  drawLeftAlignedText,
} from "../template-text";
import type { Artboard, TemplateItem } from "../types";

export async function render_text(
  ctx: RenderContext,
  page: PDFPage,
  template: any,
  isCover = false,
) {
  const artboard = template.artboard() as Artboard;
  const fonts = await loadFonts(ctx.pdf);
  const portada = ctx.document.portada;
const arquitectura = ctx.document.arquitectura;

  const rawPrice = String(
    portada.price ?? "",
  ).trim();

  const numericPrice = Number(
    rawPrice.replace(
      /[^0-9.-]/g,
      "",
    ),
  );

  const editorialPrice =
    rawPrice.length === 0
      ? ""
      : Number.isFinite(numericPrice)
        ? `$${numericPrice.toLocaleString(
            "en-US",
            {
              maximumFractionDigits: 0,
            },
          )} MXN`
        : rawPrice;

  const values = {
    classification: portada.classification,
    title: portada.title,
    subtitle: portada.subtitle,
    editorial_quote: portada.editorialQuote,
    collection: portada.collection,
    price: isCover
      ? editorialPrice
      : portada.price,
    bedrooms: portada.bedrooms,
    bathrooms: portada.bathrooms,
    area: portada.area,
    luxuryScore: portada.luxuryScore,
    phone: portada.phone,
  };

  const fields = isCover
    ? ([
        ["classification", "trajanSemibold", rgb(197 / 255, 141 / 255, 66 / 255), 9.65],
        ["title", "trajanLight", rgb(1, 1, 1), 15],
        ["price", "trajanLight", rgb(1, 1, 1), 12],
        ["collection", "trajanLight", rgb(1, 1, 1), 12],
        ["bedrooms", "trajanLight", rgb(1, 1, 1), 12],
        ["bathrooms", "trajanLight", rgb(1, 1, 1), 12],
        ["area", "trajanLight", rgb(1, 1, 1), 12],
        ["Numero score", "trajanLight", rgb(1, 1, 1), 70],
      ] as const)
    : ([
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
      ] as const);

  for (const [field, font, color, defaultSize] of fields) {
    const item =
      template.field(field) as TemplateItem | undefined;

    if (!item) continue;

    const key =
      field === "Numero score"
        ? "luxuryScore"
        : field;

    if (
      isCover &&
      (
        field === "collection" ||
        field === "price" ||
        field === "bedrooms" ||
        field === "bathrooms" ||
        field === "area"
      )
    ) {
      drawLeftAlignedText(
        page,
        item,
        artboard,
        values[key as keyof typeof values] ?? "",
        fonts[font],
        item.size ?? defaultSize,
        color,
      );

      continue;
    }

    const drawText =
      isCover && field == "title"
        ? drawCenteredTextAutoFit
        : drawCenteredText;

    drawText(
      page,
      item,
      artboard,
      values[key as keyof typeof values] ?? "",
      fonts[font],
      field === "Numero score"
        ? 68
        : (item.size ?? defaultSize),
      color,
    );
  }

  const editorialValues = new Map<string, string>();

  editorialValues.set(
    "Descripcion editorial",
    arquitectura.descripcion ?? "",
  );

  arquitectura.factores.forEach((factor, index) => {
    editorialValues.set(
      `Factor ${index + 1}`,
      factor.descripcion ?? "",
    );

    editorialValues.set(
      `Titulo factor ${index + 1}`,
      factor.titulo ?? "",
    );
  });

  for (const [name, value] of editorialValues) {

    console.log("TEXT PLACEHOLDER:", name);
    console.log("TEXT VALUE:", value);

    const item =
      template.name(name) as TemplateItem | undefined;

    console.log("================================");
    console.log("TEXT PLACEHOLDER:", name);
    console.log("FOUND:", !!item);

    if (item) {
      console.log("ITEM NAME:", item.name);
      console.log("ITEM FIELD:", (item as any).field);
      console.log("ITEM TYPE:", item.type);
    }

    if (!item) continue;

    drawCenteredText(
      page,
      item,
      artboard,
      value,
      fonts.trajanLight,
      item.size ?? 10,
      rgb(1, 1, 1),
    );
  }
}
