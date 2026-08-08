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

export async function render_materials(
  ctx: RenderContext,
  page: PDFPage,
  template: TemplateContract,
) {
  const artboard = template.artboard();

  if (!artboard) {
    return;
  }

  const heroImage =
    ctx.document.materiales.heroImage;

  const heroPlaceholder =
    template.name("Foto 1");

  if (heroImage && heroPlaceholder) {
    await drawImageCover(
      ctx.pdf,
      page,
      heroImage,
      heroPlaceholder.bounds,
      artboard,
    );
  }

  const materials =
    ctx.document.materiales.materiales;

  if (materials.length === 0) {
    return;
  }

  const font =
    await ctx.pdf.embedFont(
      StandardFonts.Helvetica,
    );

  for (let index = 0; index < materials.length; index++) {

    const material =
      materials[index];

    const slot = index + 1;

    const samplePlaceholder =
      template.name(
        `MUESTRA MATERIAL ${slot}`,
      );

    if (
      samplePlaceholder &&
      material.muestra
    ) {
      await drawImageCover(
        ctx.pdf,
        page,
        material.muestra,
        samplePlaceholder.bounds,
        artboard,
      );
    }

    const namePlaceholder =
      template.name(
        `Nombre muestra ${slot}`,
      );

    const materialName =
      cleanText(material.titulo);

    if (
      namePlaceholder &&
      materialName
    ) {
      drawCenteredText(
        page,
        namePlaceholder,
        artboard,
        materialName,
        font,
        9,
        rgb(1,1,1),
      );
    }
  }
}
