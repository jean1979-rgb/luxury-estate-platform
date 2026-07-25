import { rgb, PDFPage } from "pdf-lib";

import type { RenderContext } from "../../context";
import { loadFonts } from "../fonts";
import { cleanText, drawCenteredText } from "../template-text";
import type { Artboard, TemplateItem } from "../types";

export async function render_text(
  ctx: RenderContext,
  page: PDFPage,
  template: any,
) {
  const artboard = template.artboard() as Artboard;
  const fonts = await loadFonts(ctx.pdf);

  const property =
    ctx.property as typeof ctx.property & {
      tagline?: string | null;
      classification?: string | null;
      pemClassification?: string | null;
      brokerProfile?: {
        phone?: string | null;
      } | null;
    };

  const values = {
    classification: cleanText(
      property.pemClassification ??
      property.classification,
    ),
    title: cleanText(property.title),
    subtitle: cleanText(property.tagline),
    collection: cleanText(property.zoneLabel),
    price: cleanText(property.price),
    bedrooms:
      property.bedrooms != null
        ? String(property.bedrooms)
        : "",
    bathrooms:
      property.bathrooms != null
        ? (
            property.halfBathrooms
              ? `${property.bathrooms + 0.5}`
              : `${property.bathrooms}`
          )
        : "",
    area:
      property.areaInterior != null
        ? `${property.areaInterior} m²`
        : "",
    luxuryScore:
      property.luxuryScore != null
        ? String(property.luxuryScore)
        : "",
    phone: cleanText(
      property.brokerProfile?.phone,
    ),
    editorial_quote:
      "Permítanos asesorarle en la adquisición de esta propiedad única",
  };

  const fields = [
    ["classification","trajanSemibold",rgb(197/255,141/255,66/255),9.65],
    ["title","trajanLight",rgb(1,1,1),15],
    ["subtitle","trajanLight",rgb(1,1,1),11],
    ["editorial_quote","trajanLight",rgb(1,1,1),10],
    ["collection","trajanLight",rgb(1,1,1),12],
    ["price","trajanLight",rgb(1,1,1),12],
    ["bedrooms","trajanLight",rgb(1,1,1),12],
    ["bathrooms","trajanLight",rgb(1,1,1),12],
    ["area","trajanLight",rgb(1,1,1),12],
    ["Numero score","trajanLight",rgb(1,1,1),70],
    ["phone","trajanLight",rgb(1,1,1),11],
  ] as const;

  for (const [field,font,color,defaultSize] of fields) {

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
      (values as any)[key] ?? "",
      (fonts as any)[font],
      item.size ?? defaultSize,
      color,
    );
  }
}
