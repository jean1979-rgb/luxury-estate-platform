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
  return (parts[parts.length - 1] || raw)
    .replace(/^Fraccionamiento\s+/i, "")
    .replace(/^Condominio\s+/i, "")
    .replace(/^Colonia\s+/i, "")
    .trim();
}

function drawAssetCover(page: PDFPage, image: any, box: { x: number; y: number; width: number; height: number }) {
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

function drawAssetContain(page: PDFPage, image: any, box: { x: number; y: number; width: number; height: number }) {
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
  const { page, width, height, property, fonts, colors, image, assets, formatPrice, formatCount, formatArea, cleanText, wrapText } = params;
  const { regular, bold, serif } = fonts;
  const { black, white, gold, line } = colors;

  const score = property.luxuryScore ?? 0;
  const coverLabel = score >= 95 ? "ICONIC RESIDENCE" : score >= 90 ? "SIGNATURE RESIDENCE" : score >= 85 ? "EXCEPTIONAL RESIDENCE" : "PRIVATE ESTATES SELECTION";

  page.drawRectangle({ x: 0, y: 0, width, height, color: black });

  if (image) {
    drawAssetCover(page, image, { x: 0, y: 0, width, height });
  }

  page.drawRectangle({ x: 0, y: height - 285, width, height: 285, color: black, opacity: 0.78 });
  page.drawRectangle({ x: 0, y: height - 390, width, height: 120, color: black, opacity: 0.32 });
  page.drawRectangle({ x: 0, y: 0, width, height: 335, color: black, opacity: 0.91 });
  page.drawRectangle({ x: 0, y: 250, width, height: 105, color: black, opacity: 0.42 });
  page.drawRectangle({ x: 0, y: 0, width, height, color: black, opacity: 0.10 });

  page.drawRectangle({
    x: 10,
    y: 10,
    width: width - 20,
    height: height - 20,
    borderColor: line,
    borderWidth: 0.55,
  });

  if (assets?.headerLogo) {
    drawAssetContain(page, assets.headerLogo, {
      x: 125,
      y: height - 177,
      width: 345,
      height: 138,
    });
  }

  page.drawText(coverLabel, { x: 34, y: 300, size: 8, font: bold, color: gold });
  page.drawLine({ start: { x: 34, y: 286 }, end: { x: 205, y: 286 }, thickness: 0.7, color: gold });

  const titleLines = wrapText(property.title, 29).slice(0, 3);
  let titleY = 252;
  for (const titleLine of titleLines) {
    page.drawText(titleLine, { x: 34, y: titleY, size: 23, font: serif, color: white });
    titleY -= 27;
  }

  page.drawLine({ start: { x: 34, y: 185 }, end: { x: 342, y: 185 }, thickness: 0.7, color: gold });
  page.drawLine({ start: { x: 385, y: 252 }, end: { x: 385, y: 95 }, thickness: 0.7, color: gold });

  if (assets?.laurel) {
    drawAssetContain(page, assets.laurel, { x: 415, y: 130, width: 105, height: 95 });
  }

  page.drawText("LUXURY SCORE", { x: 432, y: 247, size: 9.5, font: bold, color: gold });
  const scoreText = String(score);
  page.drawText(scoreText, {
    x: 470 - serif.widthOfTextAtSize(scoreText, 70) / 2,
    y: 154,
    size: 70,
    font: serif,
    color: gold,
  });
  page.drawText("/ 100", { x: 445, y: 132, size: 20, font: serif, color: white });
  page.drawLine({ start: { x: 420, y: 92 }, end: { x: 540, y: 92 }, thickness: 0.7, color: gold });
  page.drawText("CURATED COLLECTION", { x: 423, y: 67, size: 11, font: serif, color: gold });

  const facts = [
    ["PRECIO", formatPrice(property.price, property.currency), assets?.icons?.price],
    ["UBICACIÓN", shortLocation(property.location, property.city), assets?.icons?.location],
    ["RECÁMARAS", formatCount(property.bedrooms), assets?.icons?.bedrooms],
    ["BAÑOS", formatCount(property.bathrooms), assets?.icons?.bathrooms],
    ["SUPERFICIE", formatArea(property.areaTotal ?? property.areaInterior), assets?.icons?.area],
  ];

  let factY = 151;

  for (const [label, value, icon] of facts) {
    const finalValue = cleanText(value) || "-";

    if (icon) {
      drawAssetContain(page, icon, { x: 34, y: factY - 8, width: 84, height: 28 });
    } else {
      page.drawText(String(label), { x: 66, y: factY, size: 9, font: bold, color: gold });
    }

    const valueLines = wrapText(finalValue, label === "UBICACIÓN" ? 35 : 25).slice(0, 2);
    let valueY = factY;
    for (const valueLine of valueLines) {
      page.drawText(valueLine, { x: 145, y: valueY, size: 9.5, font: regular, color: white });
      valueY -= 12;
    }

    factY -= label === "UBICACIÓN" ? 34 : 25;
  }

  page.drawLine({ start: { x: 34, y: 32 }, end: { x: 215, y: 32 }, thickness: 0.55, color: line });
  page.drawLine({ start: { x: 380, y: 32 }, end: { x: width - 34, y: 32 }, thickness: 0.55, color: line });

  if (assets?.footer) {
    drawAssetContain(page, assets.footer, { x: width / 2 - 90, y: 30, width: 180, height: 28 });
  } else {
    page.drawText("PRIVATE ESTATES MEXICO", {
      x: width / 2 - regular.widthOfTextAtSize("PRIVATE ESTATES MEXICO", 7) / 2,
      y: 22,
      size: 7,
      font: regular,
      color: gold,
    });
  }
}
