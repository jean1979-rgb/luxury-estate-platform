import { drawPdfGuides } from "@/lib/pdf/editorial-guides";
import type {
  PDFImage,
  PDFEmbeddedPage,
  PDFFont,
  PDFPage,
  RGB,
} from "pdf-lib";

type Params = {
  page: PDFPage;
  templatePage: PDFEmbeddedPage;
  width: number;
  height: number;
  property: any;
  images: Array<PDFImage | null>;
  fonts: {
    regular: PDFFont;
    bold: PDFFont;
    serif: PDFFont;
    serifBold: PDFFont;
  };
  colors: {
    black: RGB;
    white: RGB;
    gold: RGB;
    muted: RGB;
    line: RGB;
  };
  architectureFactors: string[];
  cleanText: (value: unknown) => string;
  wrapText: (text: string, maxChars: number) => string[];
};

function drawImageCover(
  page: PDFPage,
  image: PDFImage,
  box: {
    x: number;
    y: number;
    width: number;
    height: number;
  }
) {
  const scale = Math.max(
    box.width / image.width,
    box.height / image.height
  );

  const drawWidth = image.width * scale;
  const drawHeight = image.height * scale;

  page.drawImage(image, {
    x: box.x + (box.width - drawWidth) / 2,
    y: box.y + (box.height - drawHeight) / 2,
    width: drawWidth,
    height: drawHeight,
  });
}

function drawCenteredText(
  page: PDFPage,
  text: string,
  centerX: number,
  y: number,
  size: number,
  font: PDFFont,
  color: RGB
) {
  page.drawText(text, {
    x: centerX - font.widthOfTextAtSize(text, size) / 2,
    y,
    size,
    font,
    color,
  });
}

export function drawEditorialPage2({
  page,
  templatePage,
  width,
  height,
  property,
  images,
  fonts,
  colors,
  architectureFactors,
  cleanText,
  wrapText,
}: Params) {
  const { regular, bold, serif, serifBold } = fonts;
  const { white, gold } = colors;

  /*
   * CAPA 1:
   * Fotografías dinámicas.
   *
   * La plantilla se dibuja después y cubre cualquier excedente.
   */
  if (images[0]) {
    drawImageCover(page, images[0], {
      x: 266,
      y: 405,
      width: 319,
      height: 376,
    });
  }

  if (images[1]) {
    drawImageCover(page, images[1], {
      x: 266,
      y: 220,
      width: 319,
      height: 176,
    });
  }

  /*
   * CAPA 2:
   * Plantilla limpia exportada desde Illustrator.
   */
  page.drawPage(templatePage, {
    x: 0,
    y: 0,
    width,
    height,
  });

  /*
   * CAPA 3:
   * Guías temporales.
   */
  drawPdfGuides(page, width, height);

  /*
   * CAPA 4:
   * Contenido dinámico nuevo.
   */
  page.drawText("COLECCIÓN EDITORIAL", {
    x: 28,
    y: 803,
    size: 10,
    font: serifBold,
    color: gold,
  });

  page.drawText("02", {
    x: 550,
    y: 793,
    size: 31,
    font: serif,
    color: gold,
  });

  page.drawText("ARQUITECTURA", {
    x: 28,
    y: 705,
    size: 30,
    font: serif,
    color: white,
  });

  page.drawText("Y DISEÑO", {
    x: 28,
    y: 660,
    size: 30,
    font: serif,
    color: white,
  });

  page.drawText("ARQUITECTURA QUE DEFINE", {
    x: 28,
    y: 592,
    size: 12,
    font: serifBold,
    color: gold,
  });

  page.drawText("UNA RESIDENCIA EXTRAORDINARIA.", {
    x: 28,
    y: 570,
    size: 12,
    font: serifBold,
    color: gold,
  });

  const propertyName = cleanText(property.title);
  const description = cleanText(property.description);

  let narrativeY = 535;

  if (propertyName) {
    const intro =
      `${propertyName} representa una interpretación contemporánea ` +
      "del lujo residencial.";

    for (const line of wrapText(intro, 39).slice(0, 4)) {
      page.drawText(line, {
        x: 28,
        y: narrativeY,
        size: 11.5,
        font: serif,
        color: white,
      });

      narrativeY -= 16;
    }

    narrativeY -= 10;
  }

  const descriptionLines = wrapText(description, 42).slice(0, 9);

  for (const line of descriptionLines) {
    page.drawText(line, {
      x: 28,
      y: narrativeY,
      size: 11,
      font: serif,
      color: white,
    });

    narrativeY -= 15;
  }

  page.drawText("ELEMENTOS DESTACADOS", {
    x: 28,
    y: 255,
    size: 12,
    font: serifBold,
    color: gold,
  });

  const fallbackFactors = [
    "Diseño contemporáneo",
    "Luz natural y amplitud",
    "Integración interior–exterior",
    "Materiales premium",
    "Ventanales de gran formato",
  ];

  const factorItems = (
    architectureFactors.length
      ? architectureFactors
      : fallbackFactors
  ).slice(0, 5);

  let factorY = 225;

  for (const factor of factorItems) {
    const factorLines = wrapText(cleanText(factor), 31).slice(0, 2);

    page.drawLine({
      start: { x: 68, y: factorY - 5 },
      end: { x: 226, y: factorY - 5 },
      thickness: 0.35,
      color: gold,
    });

    let textY = factorY + 3;

    for (const line of factorLines) {
      page.drawText(line, {
        x: 70,
        y: textY,
        size: 10.5,
        font: serif,
        color: white,
      });

      textY -= 13;
    }

    factorY -= 28;
  }

  const blockCenters = [132, 325, 515];

  drawCenteredText(
    page,
    "DISEÑO CONTEMPORÁNEO",
    blockCenters[0],
    102,
    11,
    serifBold,
    gold
  );

  drawCenteredText(
    page,
    "Líneas limpias, materiales nobles",
    blockCenters[0],
    74,
    10,
    serif,
    white
  );

  drawCenteredText(
    page,
    "y una estética atemporal.",
    blockCenters[0],
    58,
    10,
    serif,
    white
  );

  drawCenteredText(
    page,
    "LUZ Y AMPLITUD",
    blockCenters[1],
    102,
    11,
    serifBold,
    gold
  );

  drawCenteredText(
    page,
    "Alturas generosas y ventanales",
    blockCenters[1],
    74,
    10,
    serif,
    white
  );

  drawCenteredText(
    page,
    "conectados con el entorno natural.",
    blockCenters[1],
    58,
    10,
    serif,
    white
  );

  drawCenteredText(
    page,
    "VISTAS PRIVILEGIADAS",
    blockCenters[2],
    102,
    11,
    serifBold,
    gold
  );

  drawCenteredText(
    page,
    "Orientación privilegiada hacia",
    blockCenters[2],
    74,
    10,
    serif,
    white
  );

  drawCenteredText(
    page,
    "el paisaje y su entorno.",
    blockCenters[2],
    58,
    10,
    serif,
    white
  );

  page.drawText("COLECCIÓN EDITORIAL", {
    x: 28,
    y: 25,
    size: 8.5,
    font: serifBold,
    color: gold,
  });

}
