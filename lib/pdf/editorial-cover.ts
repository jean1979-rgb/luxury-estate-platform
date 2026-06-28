import type { PDFDocument, PDFFont, PDFPage, RGB } from "pdf-lib";
import { degrees } from "pdf-lib";

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
    .trim();
}

function trackedWidth(font: PDFFont, text: string, size: number, tracking = 0) {
  return font.widthOfTextAtSize(text, size) + Math.max(0, text.length - 1) * tracking;
}

function drawTrackedText(
  page: PDFPage,
  font: PDFFont,
  text: string,
  x: number,
  y: number,
  size: number,
  color: RGB,
  tracking = 0,
) {
  let cursor = x;
  for (const char of text) {
    page.drawText(char, { x: cursor, y, size, font, color });
    cursor += font.widthOfTextAtSize(char, size) + tracking;
  }
}

function drawCenteredTracked(
  page: PDFPage,
  font: PDFFont,
  text: string,
  width: number,
  y: number,
  size: number,
  color: RGB,
  tracking = 0,
) {
  const tw = trackedWidth(font, text, size, tracking);
  drawTrackedText(page, font, text, (width - tw) / 2, y, size, color, tracking);
}

function drawSun(page: PDFPage, x: number, y: number, gold: RGB) {
  for (let i = 0; i < 13; i++) {
    const angle = Math.PI * (i / 12);
    page.drawLine({
      start: { x: x + Math.cos(angle) * 4, y: y + Math.sin(angle) * 4 },
      end: { x: x + Math.cos(angle) * 15, y: y + Math.sin(angle) * 15 },
      thickness: 0.55,
      color: gold,
    });
  }
}

function drawLaurelLeaf(page: PDFPage, x: number, y: number, angle: number, gold: RGB) {
  page.drawEllipse({
    x,
    y,
    xScale: 3.8,
    yScale: 10.8,
    rotate: degrees(angle),
    color: gold,
    opacity: 0.95,
  });
}

function drawLuxuryScoreSeal(params: {
  page: PDFPage;
  x: number;
  y: number;
  score: number;
  fonts: DrawCoverParams["fonts"];
  gold: RGB;
  white: RGB;
}) {
  const { page, x, y, score, fonts, gold, white } = params;

  page.drawText("LUXURY SCORE", {
    x: x - fonts.bold.widthOfTextAtSize("LUXURY SCORE", 8) / 2,
    y: y + 52,
    size: 8,
    font: fonts.bold,
    color: gold,
  });

  const scoreText = String(score);
  page.drawText(scoreText, {
    x: x - fonts.serif.widthOfTextAtSize(scoreText, 66) / 2,
    y: y - 14,
    size: 66,
    font: fonts.serif,
    color: gold,
  });

  page.drawText("/ 100", {
    x: x - fonts.serif.widthOfTextAtSize("/ 100", 14) / 2,
    y: y - 39,
    size: 14,
    font: fonts.serif,
    color: white,
  });

  const leftStem: { x: number; y: number; a: number }[] = [
    { x: -51, y: -45, a: -48 },
    { x: -57, y: -32, a: -38 },
    { x: -61, y: -18, a: -28 },
    { x: -63, y: -4, a: -15 },
    { x: -62, y: 10, a: 0 },
    { x: -57, y: 24, a: 17 },
    { x: -50, y: 37, a: 35 },
  ];

  for (const leaf of leftStem) {
    drawLaurelLeaf(page, x + leaf.x, y + leaf.y, leaf.a, gold);
    drawLaurelLeaf(page, x - leaf.x, y + leaf.y, -leaf.a, gold);
  }

  page.drawLine({
    start: { x: x - 44, y: y - 58 },
    end: { x: x - 7, y: y - 50 },
    thickness: 0.7,
    color: gold,
  });
  page.drawLine({
    start: { x: x + 44, y: y - 58 },
    end: { x: x + 7, y: y - 50 },
    thickness: 0.7,
    color: gold,
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
    const imgBox = { x: 0, y: 250, width, height: 500 };
    const scale = Math.max(imgBox.width / image.width, imgBox.height / image.height);
    const drawWidth = image.width * scale;
    const drawHeight = image.height * scale;

    page.drawImage(image, {
      x: imgBox.x + (imgBox.width - drawWidth) / 2 - 55,
      y: imgBox.y + (imgBox.height - drawHeight) / 2,
      width: drawWidth,
      height: drawHeight,
    });
  }

  page.drawRectangle({ x: 0, y: 0, width, height, color: black, opacity: 0.18 });
  page.drawRectangle({ x: 0, y: height - 230, width, height: 230, color: black, opacity: 0.992 });
  page.drawRectangle({ x: 0, y: height - 305, width, height: 95, color: black, opacity: 0.50 });
  page.drawRectangle({ x: 0, y: 0, width, height: 315, color: black, opacity: 0.995 });
  page.drawRectangle({ x: 0, y: 245, width, height: 120, color: black, opacity: 0.56 });

  page.drawRectangle({
    x: 18,
    y: 18,
    width: width - 36,
    height: height - 36,
    borderColor: line,
    borderWidth: 0.45,
  });

  // Logo PEM
  const peY = height - 77;
  page.drawText("P", { x: width / 2 - 25, y: peY, size: 62, font: serif, color: gold });
  page.drawText("E", { x: width / 2 - 1, y: peY - 9, size: 48, font: serif, color: gold });

  drawCenteredTracked(page, serif, "PRIVATE ESTATES", width, height - 132, 23, white, 9.5);
  drawCenteredTracked(page, serif, "MEXICO", width, height - 168, 15, gold, 9);
  drawCenteredTracked(page, bold, "EXCLUSIVE PROPERTIES. EXTRAORDINARY LIFESTYLES.", width, height - 200, 7.2, gold, 3.4);

  page.drawLine({ start: { x: 132, y: height - 156 }, end: { x: 244, y: height - 156 }, thickness: 0.75, color: gold });
  page.drawLine({ start: { x: 352, y: height - 156 }, end: { x: 464, y: height - 156 }, thickness: 0.75, color: gold });

  page.drawText(coverLabel, { x: 44, y: 265, size: 8, font: bold, color: gold });
  page.drawLine({ start: { x: 44, y: 252 }, end: { x: 220, y: 252 }, thickness: 0.7, color: gold });

  const titleLines = wrapText(property.title, 25).slice(0, 3);
  let titleY = 218;
  for (const titleLine of titleLines) {
    page.drawText(titleLine, { x: 44, y: titleY, size: 22, font: serif, color: white });
    titleY -= 30;
  }

  page.drawLine({ start: { x: 372, y: 255 }, end: { x: 372, y: 92 }, thickness: 0.6, color: gold });

  drawLuxuryScoreSeal({
    page,
    x: 456,
    y: 177,
    score,
    fonts,
    gold,
    white,
  });

  page.drawLine({ start: { x: 405, y: 105 }, end: { x: 505, y: 105 }, thickness: 0.6, color: gold });

  page.drawText("CURATED COLLECTION", {
    x: 456 - serif.widthOfTextAtSize("CURATED COLLECTION", 11) / 2,
    y: 78,
    size: 11,
    font: serif,
    color: gold,
  });

  const coverFacts = [
    ["PRECIO", formatPrice(property.price, property.currency)],
    ["UBICACIÓN", shortLocation(property.location, property.city)],
    ["RECÁMARAS", formatCount(property.bedrooms)],
    ["BAÑOS", formatCount(property.bathrooms)],
    ["SUPERFICIE", formatArea(property.areaTotal ?? property.areaInterior)],
  ].filter(([, value]) => cleanText(value));

  let factY = 126;
  for (const [label, value] of coverFacts.slice(0, 5)) {
    page.drawText(label, { x: 44, y: factY, size: 7.5, font: bold, color: gold });
    const valueLines = wrapText(cleanText(value), label === "UBICACIÓN" ? 28 : 24).slice(0, 2);
    let valueY = factY;

    for (const valueLine of valueLines) {
      page.drawText(valueLine, { x: 132, y: valueY, size: 8.5, font: regular, color: white });
      valueY -= 11;
    }

    factY -= label === "UBICACIÓN" ? 31 : 22;
  }

  drawSun(page, width / 2, 43, gold);

  page.drawLine({ start: { x: 44, y: 39 }, end: { x: 236, y: 39 }, thickness: 0.45, color: gold });
  page.drawLine({ start: { x: 360, y: 39 }, end: { x: width - 44, y: 39 }, thickness: 0.45, color: gold });
  drawCenteredTracked(page, regular, "PRIVATE ESTATES MEXICO", width, 25, 7, gold, 4);
}
