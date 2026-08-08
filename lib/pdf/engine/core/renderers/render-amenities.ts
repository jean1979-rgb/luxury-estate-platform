import {
  PDFPage,
  StandardFonts,
  rgb,
} from "pdf-lib";

import type { RenderContext } from "../../context";
import type { TemplateContract } from "../../template-reader";
import { drawImageCover } from "../image-drawer";
import {
  cleanText,
  drawCenteredText,
} from "../template-text";
import { render_text } from "./render-text";

export async function render_amenities(
  ctx: RenderContext,
  page: PDFPage,
  template: TemplateContract,
) {
  await render_text(
    ctx,
    page,
    template,
  );

  console.log("===== AMENIDADES =====");
  console.log(
    "items:",
    ctx.document.amenidades.amenidades.length,
  );
  console.log(
    "images:",
    ctx.document.amenidades.images.length,
  );

  ctx.document.amenidades.amenidades.forEach(
    (a, i) => {
      console.log(
        i + 1,
        a.titulo,
        Boolean(a.descripcion),
        ctx.document.amenidades.images[i] ?? null,
      );
    },
  );


  const artboard = template.artboard();

  if (!artboard) {
    return;
  }

  const font =
    await ctx.pdf.embedFont(
      StandardFonts.Helvetica,
    );

  const amenities =
    ctx.document.amenidades.amenidades;

  for (
    let index = 0;
    index < ctx.document.amenidades.images.length;
    index++
  ) {

    const slot = index + 1;

    const imagePlaceholder =
      template.name(
        `Foto ${slot}`,
      );

    if (
      imagePlaceholder &&
      ctx.document.amenidades.images[index]
    ) {
      await drawImageCover(
        ctx.pdf,
        page,
        ctx.document.amenidades.images[index],
        imagePlaceholder.bounds,
        artboard,
        `Foto ${slot}`,
      );
    }

  }

  for (
    let index = 0;
    index < amenities.length;
    index++
  ) {
    const amenity =
      amenities[index];

    const slot = index + 1;

    const titlePlaceholder =
      template.name(
        `Titulo amenidad ${slot}`,
      );

    const title =
      cleanText(
        amenity.titulo,
      );

    if (
      titlePlaceholder &&
      title
    ) {
      drawCenteredText(
        page,
        titlePlaceholder,
        artboard,
        title,
        font,
        9,
        rgb(1,1,1),
      );
    }

    const descriptionPlaceholder =
      template.name(
        `Descripcion amenidad ${slot}`,
      );

    const description =
      cleanText(
        amenity.descripcion,
      );

    if (
      descriptionPlaceholder &&
      description
    ) {
      drawCenteredText(
        page,
        descriptionPlaceholder,
        artboard,
        description,
        font,
        8,
        rgb(1,1,1),
      );
    }
  }
}
