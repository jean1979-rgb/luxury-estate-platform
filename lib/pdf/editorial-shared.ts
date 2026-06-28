import type { PDFFont, PDFPage, RGB } from "pdf-lib";

export function cleanShortLocation(value?: string | null, fallback?: string | null) {
  const raw = String(value || fallback || "").replace(/\s+/g, " ").trim();
  if (!raw) return "Ubicación premium";

  const parts = raw
    .split("|")
    .map((item) => item.trim())
    .filter(Boolean);

  const last = parts[parts.length - 1] || raw;

  return last
    .replace(/^Fraccionamiento\s+/i, "")
    .replace(/^Condominio\s+/i, "")
    .replace(/^Colonia\s+/i, "")
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

export function drawCenteredTracked(
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

export function drawPemSun(page: PDFPage, x: number, y: number, gold: RGB) {
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

export function drawPemFooter(params: {
  page: PDFPage;
  width: number;
  regular: PDFFont;
  gold: RGB;
  line: RGB;
}) {
  const { page, width, regular, gold, line } = params;

  drawPemSun(page, width / 2, 50, gold);

  page.drawLine({
    start: { x: 44, y: 43 },
    end: { x: width / 2 - 78, y: 43 },
    thickness: 0.45,
    color: line,
  });

  page.drawLine({
    start: { x: width / 2 + 78, y: 43 },
    end: { x: width - 44, y: 43 },
    thickness: 0.45,
    color: line,
  });

  drawCenteredTracked(page, regular, "PRIVATE ESTATES MEXICO", width, 26, 7, gold, 4);
}

export function drawImageCover(
  page: PDFPage,
  image: any,
  box: { x: number; y: number; width: number; height: number },
  borderColor?: RGB,
  borderWidth = 0.45,
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

  if (borderColor) {
    page.drawRectangle({
      ...box,
      borderColor,
      borderWidth,
    });
  }
}
