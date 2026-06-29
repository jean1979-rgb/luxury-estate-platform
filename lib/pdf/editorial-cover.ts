import type { PDFDocument, PDFFont, PDFPage, RGB } from "pdf-lib";

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

type DrawCoverParams = {
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
  assets?: PemAssets;
  formatPrice: (price?: string | null, currency?: string | null) => string;
  formatCount: (value?: number | null) => string;
  formatArea: (value?: number | null) => string;
  cleanText: (value: unknown) => string;
  wrapText: (text: string, maxChars: number) => string[];
};

function shortLocation(value?: string | null, fallback?: string | null) {
  const raw = String(value || fallback || "").replace(/\s+/g, " ").trim();
  if (!raw) return "Ubicación premium";

  const parts = raw.split("|").map((item) => item.trim()).filter(Boolean);
  const last = parts[parts.length - 1] || raw;

  return last
    .replace(/^Fraccionamiento\s+/i, "")
    .replace(/^Condominio\s+/i, "")
    .replace(/^Colonia\s+/i, "")
    .trim();
}

function drawAssetCover(
  page: PDFPage,
  image: any,
  box: { x: number; y: number; width: number; height: number },
) {
  const scale = Math.max(box.width / image.width, box.height / image.height);
  const drawWidth = image.width * scale;
  const drawHeight = image.height * scale;

  page.drawImage(image, {
    x: box.x + (box.width - drawWidth) / 2,
    y: box.y + (box.height - drawHeight) / 2,
    width: drawWidth,
    height: drawHeight,
  });
}

function drawAssetContain(
  page: PDFPage,
  image: any,
  box: { x: number; y: number; width: number; height: number },
) {
  const scale = Math.min(box.width / image.width, box.height / image.height);
  const drawWidth = image.width * scale;
  const drawHeight = image.height * scale;

  page.drawImage(image, {
    x: box.x + (box.width - drawWidth) / 2,
    y: box.y + (box.height - drawHeight) / 2,
    width: drawWidth,
    height: drawHeight,
  });
}

export function drawEditorialCover(params: DrawCoverParams) {
  const {
    page,
    width,
    height,
    property,
    fonts,
    colors,
    image,
    assets,
    formatPrice,
    formatCount,
    formatArea,
    cleanText,
    wrapText,
  } = params;

  const { regular, bold, serif } = fonts;
  const { black, white, gold, line } = colors;

  const score = property.luxuryScore ?? 0;
  const coverLabel =
    score >= 95 ? "ICONIC RESIDENCE" :
    score >= 90 ? "SIGNATURE RESIDENCE" :
    score >= 85 ? "EXCEPTIONAL RESIDENCE" :
    "PRIVATE ESTATES SELECTION";

  page.drawRectangle({ x: 0, y: 0, width, height, color: black });

  if (image) {
    drawAssetCover(page, image, { x: 0, y: 250, width, height: 500 });
  }

  page.drawRectangle({ x: 0, y: 0, width, height, color: black, opacity: 0.10 });
  page.drawRectangle({ x: 0, y: height - 244, width, height: 244, color: black, opacity: 0.995 });
  page.drawRectangle({ x: 0, y: 0, width, height: 328, color: black, opacity: 0.998 });
  page.drawRectangle({ x: 0, y: 245, width, height: 125, color: black, opacity: 0.52 });

  page.drawRectangle({
    x: 18,
    y: 18,
    width: width - 36,
    height: height - 36,
    borderColor: line,
    borderWidth: 0.45,
  });

  if (assets?.headerLogo) {
    drawAssetContain(page, assets.headerLogo, {
      x: 82,
      y: height - 220,
      width: 430,
      height: 188,
    });
  }

  page.drawText(coverLabel, { x: 44, y: 268, size: 7.5, font: bold, color: gold });
  page.drawLine({ start: { x: 44, y: 254 }, end: { x: 212, y: 254 }, thickness: 0.7, color: gold });

  const titleLines = wrapText(property.title, 26).slice(0, 3);
  let titleY = 218;
  for (const titleLine of titleLines) {
    page.drawText(titleLine, { x: 44, y: titleY, size: 21, font: serif, color: white });
    titleY -= 29;
  }

  page.drawLine({ start: { x: 364, y: 248 }, end: { x: 364, y: 94 }, thickness: 0.6, color: gold });

  if (assets?.laurel) {
    drawAssetContain(page, assets.laurel, {
      x: 378,
      y: 86,
      width: 154,
      height: 182,
    });
  }

  const scoreText = String(score);
  page.drawText(scoreText, {
    x: 455 - serif.widthOfTextAtSize(scoreText, 56) / 2,
    y: 156,
    size: 56,
    font: serif,
    color: gold,
  });

  const facts = [
    ["PRECIO", formatPrice(property.price, property.currency), assets?.icons?.price],
    ["UBICACIÓN", shortLocation(property.location, property.city), assets?.icons?.location],
    ["RECÁMARAS", formatCount(property.bedrooms), assets?.icons?.bedrooms],
    ["BAÑOS", formatCount(property.bathrooms), assets?.icons?.bathrooms],
    ["SUPERFICIE", formatArea(property.areaTotal ?? property.areaInterior), assets?.icons?.area],
  ].filter(([, value]) => cleanText(value));

  let factY = 125;

  for (const [label, value, icon] of facts) {
    if (icon) {
      drawAssetContain(page, icon, { x: 44, y: factY - 6, width: 68, height: 23 });
    } else {
      page.drawText(String(label), { x: 44, y: factY, size: 7.2, font: bold, color: gold });
    }

    const valueLines = wrapText(cleanText(value), label === "UBICACIÓN" ? 26 : 22).slice(0, 2);
    let valueY = factY;

    for (const valueLine of valueLines) {
      page.drawText(valueLine, { x: 124, y: valueY, size: 8.2, font: regular, color: white });
      valueY -= 11;
    }

    factY -= label === "UBICACIÓN" ? 31 : 22;
  }

  if (assets?.footer) {
    drawAssetContain(page, assets.footer, {
      x: 165,
      y: 18,
      width: 265,
      height: 42,
    });
  } else {
    page.drawText("PRIVATE ESTATES MEXICO", {
      x: width / 2 - regular.widthOfTextAtSize("PRIVATE ESTATES MEXICO", 7) / 2,
      y: 26,
      size: 7,
      font: regular,
      color: gold,
    });
  }
}
