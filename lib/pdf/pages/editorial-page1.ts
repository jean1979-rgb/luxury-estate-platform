import type {
  PDFDocument,
  PDFEmbeddedPage,
  PDFFont,
  PDFPage,
  RGB,
} from "pdf-lib";

import { coverTemplate } from "../templates/cover";

type PemAssets = {
  headerLogo?: any;
  laurel?: any;
  footer?: any;
  icons?: {
    price?: any;
    location?: any;
    bedrooms?: any;
    bathrooms?: any;
    area?: any;
  };
};

type DrawEditorialPage1Params = {
  pdfDoc: PDFDocument;
  page: PDFPage;
  width: number;
  height: number;
  property: any;
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
  image: any;
  templatePage?: PDFEmbeddedPage;
  assets?: PemAssets;
  formatPrice: (
    price?: string | null,
    currency?: string | null
  ) => string;
  formatCount: (value?: number | null) => string;
  formatArea: (value?: number | null) => string;
  cleanText: (value: unknown) => string;
  wrapText: (text: string, maxChars: number) => string[];
};

type Box = {
  x: number;
  y: number;
  width: number;
  height: number;
};

function shortLocation(
  value?: string | null,
  fallback?: string | null
) {
  const raw = String(value || fallback || "")
    .replace(/\s+/g, " ")
    .trim();

  if (!raw) return "Ubicación premium";

  const parts = raw
    .split("|")
    .map((item) => item.trim())
    .filter(Boolean);

  return (parts[parts.length - 1] || raw)
    .replace(/^Fraccionamiento\s+/i, "")
    .replace(/^Condominio\s+/i, "")
    .replace(/^Colonia\s+/i, "")
    .trim();
}

function drawImageCover(
  page: PDFPage,
  image: any,
  box: Box
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

function drawImageContain(
  page: PDFPage,
  image: any,
  box: Box
) {
  const scale = Math.min(
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

function centeredTextX(
  font: PDFFont,
  text: string,
  size: number,
  centerX: number
) {
  return centerX - font.widthOfTextAtSize(text, size) / 2;
}

export function drawEditorialPage1(
  params: DrawEditorialPage1Params
) {
  const {
    page,
    width,
    height,
    property,
    fonts,
    colors,
    image,
    templatePage,
    assets,
    formatPrice,
    formatCount,
    formatArea,
    cleanText,
    wrapText,
  } = params;

  const {
    regular,
    bold,
    serif,
  } = fonts;

  const {
    black,
    white,
    gold,
    line,
  } = colors;

  // PORTADA DEFINITIVA BASADA EN LA PLANTILLA DE ILLUSTRATOR.
  if (templatePage) {
    const sx = width / 595.28;
    const sy = height / 841.89;

    const X = (value: number) => value * sx;
    const Y = (value: number) => value * sy;
    const W = (value: number) => value * sx;
    const H = (value: number) => value * sy;

    const score = Number(property.luxuryScore ?? 0);

    const coverLabel =
      score >= 95
        ? "ICONIC RESIDENCE"
        : score >= 90
          ? "SIGNATURE RESIDENCE"
          : score >= 85
            ? "EXCEPTIONAL RESIDENCE"
            : "PRIVATE ESTATES SELECTION";

    // 1. Fotografía dinámica detrás de la plantilla.
    if (image) {
      drawImageCover(page, image, {
        x: X(10),
        y: Y(300),
        width: W(575),
        height: H(410),
      });
    }

    // 2. Plantilla limpia de Illustrator.
    page.drawPage(templatePage, {
      x: 0,
      y: 0,
      width,
      height,
    });

    // 3. Clasificación automática.
    page.drawText(coverLabel, {
      x: X(34),
      y: Y(306),
      size: 8 * sx,
      font: bold,
      color: gold,
    });

    // 4. Título automático.
    const title = cleanText(property.title || "");
    const titleLines = wrapText(title, 29).slice(0, 3);

    let titleY = Y(258);

    for (const lineText of titleLines) {
      page.drawText(lineText, {
        x: X(34),
        y: titleY,
        size: 23.5 * sx,
        font: serif,
        color: white,
      });

      titleY -= Y(24);
    }

    // 5. Datos dinámicos.
    const facts = [
      {
        value: formatPrice(property.price, property.currency),
        y: 166,
        wrap: 25,
      },
      {
        value: shortLocation(property.location, property.city),
        y: 135,
        wrap: 35,
      },
      {
        value: formatCount(property.bedrooms),
        y: 104,
        wrap: 25,
      },
      {
        value: formatCount(property.bathrooms),
        y: 80,
        wrap: 25,
      },
      {
        value: formatArea(
          property.areaTotal ?? property.areaInterior
        ),
        y: 56,
        wrap: 25,
      },
    ];

    for (const fact of facts) {
      const finalValue = cleanText(fact.value) || "-";
      const lines = wrapText(finalValue, fact.wrap).slice(0, 2);

      let valueY = Y(fact.y);

      for (const lineText of lines) {
        page.drawText(lineText, {
          x: X(140),
          y: valueY,
          size: 9.5 * sx,
          font: regular,
          color: white,
        });

        valueY -= Y(12);
      }
    }

    // 6. Luxury Score automático.
    const scoreText = String(score);

    page.drawText(scoreText, {
      x:
        X(475) -
        serif.widthOfTextAtSize(scoreText, 56 * sx) / 2,
      y: Y(153),
      size: 56 * sx,
      font: serif,
      color: gold,
    });

    page.drawText("/ 100", {
      x:
        X(475) -
        regular.widthOfTextAtSize("/ 100", 11 * sx) / 2,
      y: Y(128),
      size: 11 * sx,
      font: regular,
      color: white,
    });

    return;
  }

  // Fondo base.
  page.drawRectangle({
    x: 0,
    y: 0,
    width,
    height,
    color: black,
  });

  // Marco exterior de la plantilla.
  page.drawRectangle({
    x: coverTemplate.frame.x,
    y: coverTemplate.frame.y,
    width: coverTemplate.frame.width,
    height: coverTemplate.frame.height,
    borderColor: line,
    borderWidth: 0.55,
  });

  // Fotografía principal: llena el marco sin deformarse.
  if (image) {
    drawImageCover(page, image, {
      x: coverTemplate.photo.x,
      y: coverTemplate.photo.y,
      width: coverTemplate.photo.width,
      height: coverTemplate.photo.height,
    });
  }

  // Bloque negro superior.
  page.drawRectangle({
    x: 0,
    y: height - 235,
    width,
    height: 235,
    color: black,
    opacity: 0.97,
  });

  // Bloque negro inferior.
  page.drawRectangle({
    x: 0,
    y: 0,
    width,
    height: 360,
    color: black,
    opacity: 0.94,
  });

  // Transición sobre la parte inferior de la fotografía.
  page.drawRectangle({
    x: 0,
    y: 250,
    width,
    height: 105,
    color: black,
    opacity: 0.42,
  });

  // Velo general para integrar fotografía y diseño.
  page.drawRectangle({
    x: 0,
    y: 0,
    width,
    height,
    color: black,
    opacity: 0.10,
  });

  // El marco se redibuja encima de las máscaras.
  page.drawRectangle({
    x: coverTemplate.frame.x,
    y: coverTemplate.frame.y,
    width: coverTemplate.frame.width,
    height: coverTemplate.frame.height,
    borderColor: line,
    borderWidth: 0.55,
  });

  // Logo principal.
  if (assets?.headerLogo) {
    drawImageContain(page, assets.headerLogo, {
      x: coverTemplate.logo.x,
      y: coverTemplate.logo.y,
      width: coverTemplate.logo.width,
      height: coverTemplate.logo.height,
    });
  }

  const score = property.luxuryScore ?? 0;

  const coverLabel =
    score >= 95
      ? "ICONIC RESIDENCE"
      : score >= 90
        ? "SIGNATURE RESIDENCE"
        : score >= 85
          ? "EXCEPTIONAL RESIDENCE"
          : "PRIVATE ESTATES SELECTION";

  // Clasificación editorial.
  page.drawText(coverLabel, {
    x: coverTemplate.coverLabel.x,
    y: coverTemplate.coverLabel.y,
    size: 8,
    font: bold,
    color: gold,
  });

  page.drawLine({
    start: {
      x: coverTemplate.dividerTop.x1,
      y: coverTemplate.dividerTop.y1,
    },
    end: {
      x: coverTemplate.dividerTop.x2,
      y: coverTemplate.dividerTop.y2,
    },
    thickness: 0.7,
    color: gold,
  });

  // Título dinámico de la propiedad.
  const titleLines = wrapText(
    String(property.title || "").trim(),
    29
  ).slice(0, 3);

  let titleY = coverTemplate.title.y;

  for (const titleLine of titleLines) {
    page.drawText(titleLine, {
      x: coverTemplate.title.x,
      y: titleY,
      size: coverTemplate.title.fontSize,
      font: serif,
      color: white,
    });

    titleY -= coverTemplate.title.lineHeight;
  }

  // Divisor horizontal inferior del título.
  page.drawLine({
    start: {
      x: coverTemplate.dividerMiddle.x1,
      y: coverTemplate.dividerMiddle.y1,
    },
    end: {
      x: coverTemplate.dividerMiddle.x2,
      y: coverTemplate.dividerMiddle.y2,
    },
    thickness: 0.7,
    color: gold,
  });

  // Divisor vertical del bloque Luxury Score.
  page.drawLine({
    start: {
      x: coverTemplate.dividerVertical.x1,
      y: coverTemplate.dividerVertical.y1,
    },
    end: {
      x: coverTemplate.dividerVertical.x2,
      y: coverTemplate.dividerVertical.y2,
    },
    thickness: 0.7,
    color: gold,
  });

  // Laurel.
  if (assets?.laurel) {
    drawImageContain(page, assets.laurel, {
      x: coverTemplate.laurel.x,
      y: coverTemplate.laurel.y,
      width: coverTemplate.laurel.width,
      height: coverTemplate.laurel.height,
    });
  }

  // Luxury Score.
  page.drawText("LUXURY SCORE", {
    x: centeredTextX(
      bold,
      "LUXURY SCORE",
      8.4,
      coverTemplate.score.titleX
    ),
    y: coverTemplate.score.titleY,
    size: 8.4,
    font: bold,
    color: gold,
  });

  const scoreText = String(score);

  page.drawText(scoreText, {
    x: centeredTextX(
      serif,
      scoreText,
      56,
      coverTemplate.score.valueX
    ),
    y: coverTemplate.score.valueY,
    size: 56,
    font: serif,
    color: gold,
  });

  page.drawText("/ 100", {
    x: centeredTextX(
      regular,
      "/ 100",
      11,
      coverTemplate.score.slashX
    ),
    y: coverTemplate.score.slashY,
    size: 11,
    font: regular,
    color: white,
  });

  // Línea inferior del score.
  page.drawLine({
    start: {
      x: 412,
      y: 92,
    },
    end: {
      x: 542,
      y: 92,
    },
    thickness: 0.7,
    color: gold,
  });

  // Curated Collection.
  page.drawText("CURATED COLLECTION", {
    x: 416,
    y: 66,
    size: 9.8,
    font: serif,
    color: gold,
  });

  const facts = [
    {
      id: "price",
      label: "PRECIO",
      value: formatPrice(property.price, property.currency),
      icon: assets?.icons?.price,
      step: 24,
      wrap: 25,
      iconOffsetY: -7,
    },
    {
      id: "location",
      label: "UBICACIÓN",
      value: shortLocation(property.location, property.city),
      icon: assets?.icons?.location,
      step: 31,
      wrap: 35,
      iconOffsetY: -7,
    },
    {
      id: "bedrooms",
      label: "RECÁMARAS",
      value: formatCount(property.bedrooms),
      icon: assets?.icons?.bedrooms,
      step: 24,
      wrap: 25,
      iconOffsetY: -6,
    },
    {
      id: "bathrooms",
      label: "BAÑOS",
      value: formatCount(property.bathrooms),
      icon: assets?.icons?.bathrooms,
      step: 24,
      wrap: 25,
      iconOffsetY: -5,
    },
    {
      id: "area",
      label: "SUPERFICIE",
      value: formatArea(
        property.areaTotal ?? property.areaInterior
      ),
      icon: assets?.icons?.area,
      step: 24,
      wrap: 25,
      iconOffsetY: -6,
    },
  ];

  let factY = coverTemplate.facts.startY;

  for (const fact of facts) {
    const finalValue = cleanText(fact.value) || "-";

    if (fact.icon) {
      drawImageContain(page, fact.icon, {
        x: coverTemplate.facts.iconX,
        y: factY + fact.iconOffsetY,
        width: 66,
        height: 17,
      });
    } else {
      page.drawText(fact.label, {
        x: 66,
        y: factY,
        size: 9,
        font: bold,
        color: gold,
      });
    }

    const valueLines = wrapText(
      finalValue,
      fact.wrap
    ).slice(0, 2);

    let valueY = factY;

    for (const valueLine of valueLines) {
      page.drawText(valueLine, {
        x: coverTemplate.facts.valueX,
        y: valueY,
        size: 9.5,
        font: regular,
        color: white,
      });

      valueY -= 12;
    }

    factY -= fact.step;
  }

  // Footer centrado.
  if (assets?.footer) {
    drawImageContain(page, assets.footer, {
      x: coverTemplate.footer.x,
      y: coverTemplate.footer.y,
      width: coverTemplate.footer.width,
      height: coverTemplate.footer.height,
    });
  }
}
