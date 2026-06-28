import type { PDFFont, PDFPage, RGB } from "pdf-lib";
import { rgb } from "pdf-lib";

type Params = {
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
  score: number;
  selectionLabel: string;
  selectionReason: string;
  pemFactorItems: string[];
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
  return last.replace(/^Fraccionamiento\s+/i, "").replace(/^Condominio\s+/i, "").trim();
}

function drawChip(page: PDFPage, text: string, x: number, y: number, font: PDFFont, gold: RGB, white: RGB) {
  const clean = text.slice(0, 34);
  const w = Math.min(205, Math.max(72, font.widthOfTextAtSize(clean, 8.5) + 24));

  page.drawRectangle({
    x,
    y: y - 7,
    width: w,
    height: 23,
    borderColor: gold,
    borderWidth: 0.55,
    color: rgb(0.055, 0.045, 0.035),
  });

  page.drawText(clean, {
    x: x + 11,
    y,
    size: 8.5,
    font,
    color: white,
  });

  return w;
}

export function drawEditorialAssessment(params: Params) {
  const {
    page,
    width,
    height,
    property,
    fonts,
    colors,
    score,
    selectionLabel,
    selectionReason,
    pemFactorItems,
    formatPrice,
    formatCount,
    formatArea,
    cleanText,
    wrapText,
  } = params;

  const { regular, bold, serif } = fonts;
  const { black, white, gold, muted, line } = colors;

  page.drawRectangle({ x: 0, y: 0, width, height, color: black });

  page.drawRectangle({
    x: 26,
    y: 26,
    width: width - 52,
    height: height - 52,
    borderColor: line,
    borderWidth: 0.45,
  });

  page.drawText("PRIVATE ESTATES REVIEW", {
    x: 44,
    y: height - 72,
    size: 8,
    font: bold,
    color: gold,
  });

  page.drawText("Editorial Assessment", {
    x: 44,
    y: height - 122,
    size: 32,
    font: serif,
    color: white,
  });

  page.drawLine({
    start: { x: 44, y: height - 145 },
    end: { x: width - 44, y: height - 145 },
    thickness: 0.7,
    color: gold,
  });

  page.drawText(selectionLabel, {
    x: 44,
    y: height - 185,
    size: 13,
    font: serif,
    color: gold,
  });

  let reasonY = height - 220;
  for (const lineText of wrapText(selectionReason, 54).slice(0, 4)) {
    page.drawText(lineText, {
      x: 44,
      y: reasonY,
      size: 10.5,
      font: regular,
      color: muted,
    });
    reasonY -= 17;
  }

  page.drawText("LUXURY SCORE", {
    x: 410,
    y: height - 188,
    size: 8,
    font: bold,
    color: gold,
  });

  const scoreText = String(score);
  page.drawText(scoreText, {
    x: 440 - serif.widthOfTextAtSize(scoreText, 70) / 2,
    y: height - 270,
    size: 70,
    font: serif,
    color: gold,
  });

  page.drawText("/ 100", {
    x: 421,
    y: height - 295,
    size: 14,
    font: serif,
    color: white,
  });

  page.drawLine({
    start: { x: 385, y: height - 320 },
    end: { x: 500, y: height - 320 },
    thickness: 0.6,
    color: gold,
  });

  const facts = [
    ["Precio", formatPrice(property.price, property.currency)],
    ["Ubicación", shortLocation(property.location, property.city)],
    ["Recámaras", formatCount(property.bedrooms)],
    ["Baños", formatCount(property.bathrooms)],
    ["Superficie", formatArea(property.areaTotal ?? property.areaInterior)],
  ].filter(([, value]) => cleanText(value));

  page.drawText("PROPERTY PROFILE", {
    x: 44,
    y: height - 380,
    size: 8,
    font: bold,
    color: gold,
  });

  let factY = height - 415;
  for (const [label, value] of facts) {
    page.drawText(String(label).toUpperCase(), {
      x: 44,
      y: factY,
      size: 7.5,
      font: bold,
      color: gold,
    });

    const valueLines = wrapText(cleanText(value), label === "Ubicación" ? 32 : 26).slice(0, 2);
    let vy = factY;
    for (const valueLine of valueLines) {
      page.drawText(valueLine, {
        x: 155,
        y: vy,
        size: 9.5,
        font: regular,
        color: white,
      });
      vy -= 12;
    }

    factY -= label === "Ubicación" ? 32 : 25;
  }

  page.drawText("FACTORES DESTACADOS PEM", {
    x: 300,
    y: height - 380,
    size: 8,
    font: bold,
    color: gold,
  });

  let chipX = 300;
  let chipY = height - 415;

  for (const item of pemFactorItems.slice(0, 12)) {
    const w = drawChip(page, cleanText(item), chipX, chipY, regular, gold, white);
    chipX += w + 8;

    if (chipX > width - 140) {
      chipX = 300;
      chipY -= 33;
    }
  }

  page.drawLine({
    start: { x: 44, y: 78 },
    end: { x: width - 44, y: 78 },
    thickness: 0.45,
    color: line,
  });

  page.drawText("Private Estates Mexico · Editorial Collection", {
    x: 44,
    y: 50,
    size: 7.5,
    font: regular,
    color: muted,
  });
}
