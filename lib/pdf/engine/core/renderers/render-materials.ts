import {
  PDFPage,
  StandardFonts,
  rgb,
} from "pdf-lib";

import { materialCatalog } from "../../../../editorial/materialCatalog";
import type { RenderContext } from "../../context";
import type { TemplateContract } from "../../template-reader";
import { drawImageCover } from "../image-drawer";
import { getImageForEditorialPage } from "../image-resolver";
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

  /*
   * Foto editorial principal de la hoja 4.
   */
  const heroImage = getImageForEditorialPage(
    ctx.property,
    "materials",
  );

  const heroPlaceholder = template.dynamic(
    "Foto 1",
  );

  if (heroImage && heroPlaceholder) {
    await drawImageCover(
      ctx.pdf,
      page,
      heroImage,
      heroPlaceholder.bounds,
    );
  }

  /*
   * La propiedad guarda únicamente los IDs seleccionados
   * en el catálogo de materiales.
   */
  const selectedMaterialIds = Array.isArray(
    ctx.property.materials,
  )
    ? ctx.property.materials
        .filter(
          (value): value is string =>
            typeof value === "string" &&
            value.trim().length > 0,
        )
        .slice(0, 6)
    : [];

  if (selectedMaterialIds.length === 0) {
    return;
  }

  const font = await ctx.pdf.embedFont(
    StandardFonts.Helvetica,
  );

  for (
    let index = 0;
    index < selectedMaterialIds.length;
    index++
  ) {
    const materialId =
      selectedMaterialIds[index];

    const material = materialCatalog.find(
      (entry) => entry.id === materialId,
    );

    if (!material) {
      continue;
    }

    const slot = index + 1;

    /*
     * Imagen de la muestra del catálogo.
     */
    const samplePlaceholder = template.dynamic(
      `MUESTRA MATERIAL ${slot}`,
    );

    if (
      samplePlaceholder &&
      material.sample
    ) {
      await drawImageCover(
        ctx.pdf,
        page,
        material.sample,
        samplePlaceholder.bounds,
      );
    }

    /*
     * Nombre visible del material.
     */
    const namePlaceholder = template.dynamic(
      `Nombre muestra ${slot}`,
    );

    const materialName = cleanText(
      material.title,
    );

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
        rgb(1, 1, 1),
      );
    }
  }
}
