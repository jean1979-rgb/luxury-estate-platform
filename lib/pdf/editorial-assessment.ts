import { drawPdfGuides } from "@/lib/pdf/editorial-guides";
import type { PDFEmbeddedPage, PDFFont, PDFPage, RGB } from "pdf-lib";
import { rgb } from "pdf-lib";

type Params = {
  templatePage?: PDFEmbeddedPage;
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
    templatePage,
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

  if (templatePage) {
    page.drawPage(templatePage, {
      x: 0,
      y: 0,
      width,
      height,
    });

    drawPdfGuides(page, width, height);

    // ======================================================
    // ENCABEZADO
    // ======================================================

    page.drawText("PRIVATE ESTATES REVIEW", {
      x: 46,
      y: 782,
      size: 7.5,
      font: bold,
      color: gold,
    });

    page.drawText("Editorial Assessment", {
      x: 46,
      y: 735,
      size: 28,
      font: serif,
      color: white,
    });

    // ======================================================
    // SELECCIÓN EDITORIAL
    // ======================================================

    page.drawText(selectionLabel, {
      x: 46,
      y: 680,
      size: 11,
      font: serif,
      color: gold,
    });

    let reasonY = 650;

    for (const lineText of wrapText(selectionReason, 48).slice(0, 4)) {
      page.drawText(lineText, {
        x: 46,
        y: reasonY,
        size: 9.5,
        font: regular,
        color: muted,
      });

      reasonY -= 15;
    }

    // ======================================================
    // LUXURY SCORE
    // ======================================================

    const scoreCenterX = 445;

    const scoreLabel = "LUXURY SCORE";
    const scoreLabelSize = 7.5;

    page.drawText(scoreLabel, {
      x:
        scoreCenterX -
        bold.widthOfTextAtSize(scoreLabel, scoreLabelSize) / 2,
      y: 674,
      size: scoreLabelSize,
      font: bold,
      color: gold,
    });

    const scoreText = String(score);
    const scoreSize = 44;

    page.drawText(scoreText, {
      x:
        scoreCenterX -
        serif.widthOfTextAtSize(scoreText, scoreSize) / 2,
      y: 605,
      size: scoreSize,
      font: serif,
      color: gold,
    });

    const subscoreText = "/ 100";
    const subscoreSize = 11;

    page.drawText(subscoreText, {
      x:
        scoreCenterX -
        serif.widthOfTextAtSize(subscoreText, subscoreSize) / 2,
      y: 579,
      size: subscoreSize,
      font: serif,
      color: white,
    });

    // ======================================================
    // PERFIL DE LA PROPIEDAD
    // ======================================================

    page.drawText("PROPERTY PROFILE", {
      x: 46,
      y: 500,
      size: 7.5,
      font: bold,
      color: gold,
    });

    const facts = [
      ["PRECIO", formatPrice(property.price, property.currency)],
      ["UBICACIÓN", shortLocation(property.location, property.city)],
      ["RECÁMARAS", formatCount(property.bedrooms)],
      ["BAÑOS", formatCount(property.bathrooms)],
      [
        "SUPERFICIE",
        formatArea(property.areaTotal ?? property.areaInterior),
      ],
    ].filter(([, value]) => cleanText(value));

    let factY = 466;

    for (const [label, value] of facts) {
      page.drawText(String(label), {
        x: 46,
        y: factY,
        size: 7.3,
        font: bold,
        color: gold,
      });

      const valueLines = wrapText(
        cleanText(value),
        label === "UBICACIÓN" ? 25 : 22
      ).slice(0, 2);

      let valueY = factY;

      for (const valueLine of valueLines) {
        page.drawText(valueLine, {
          x: 160,
          y: valueY,
          size: 8.8,
          font: regular,
          color: white,
        });

        valueY -= 11;
      }

      factY -= label === "UBICACIÓN" ? 30 : 24;
    }

    // ======================================================
    // FACTORES DESTACADOS PEM
    // ======================================================

    page.drawText("FACTORES DESTACADOS PEM", {
      x: 300,
      y: 500,
      size: 7.5,
      font: bold,
      color: gold,
    });

    let chipX = 300;
    let chipY = 466;

    for (const item of pemFactorItems.slice(0, 12)) {
      const w = drawChip(
        page,
        cleanText(item),
        chipX,
        chipY,
        regular,
        gold,
        white
      );

      chipX += w + 7;

      if (chipX > width - 115) {
        chipX = 300;
        chipY -= 31;
      }
    }

    return;
  }

  // Fallback si no hay plantilla.
  page.drawRectangle({
    x: 0,
    y: 0,
    width,
    height,
    color: black,
  });

  page.drawRectangle({
    x: 26,
    y: 26,
    width: width - 52,
    height: height - 52,
    borderColor: line,
    borderWidth: 0.45,
  });
}
