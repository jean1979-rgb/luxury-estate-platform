import type { PDFPage, PDFFont, RGB, PDFImage } from "pdf-lib";
import { materialCatalog } from "@/lib/editorial/materialCatalog";
import { drawImageCover, drawPemFooter } from "@/lib/pdf/editorial-shared";

type Params = {
  page: PDFPage;
  width: number;
  height: number;
  property: any;
  image?: PDFImage | null;
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
  assets?: {
    footer?: PDFImage | null;
  };
  cleanText: (value: unknown) => string;
  wrapText: (text: string, maxChars: number) => string[];
};

const CATEGORY_LABELS: Record<string, string> = {
  stone: "PIEDRA NATURAL",
  wood: "MADERA",
  textile: "TELAS NATURALES",
  metal: "DETALLES METÁLICOS",
  finish: "ACABADOS",
  lighting: "ILUMINACIÓN",
};

export function drawEditorialMaterials(params: Params) {
  const { page, width, height, property, image, fonts, colors, assets, cleanText, wrapText } = params;
  const { regular, bold, serif } = fonts;
  const { black, white, gold, muted, line } = colors;

  const selectedIds = Array.isArray(property.materials) ? property.materials : [];
  const selected = selectedIds
    .map((id: string) => materialCatalog.find((item) => item.id === id))
    .filter(Boolean)
    .slice(0, 6) as typeof materialCatalog;

  if (selected.length === 0) return;

  page.drawRectangle({ x: 0, y: 0, width, height, color: black });

  page.drawRectangle({
    x: 18,
    y: 18,
    width: width - 36,
    height: height - 36,
    borderColor: line,
    borderWidth: 0.8,
  });

  page.drawText("ICONIC RESIDENCE", {
    x: 42,
    y: height - 56,
    size: 9,
    font: bold,
    color: gold,
  });

  page.drawLine({
    start: { x: 158, y: height - 52 },
    end: { x: width - 105, y: height - 52 },
    thickness: 0.7,
    color: line,
  });

  page.drawText("04", {
    x: width - 74,
    y: height - 62,
    size: 26,
    font: serif,
    color: gold,
  });

  page.drawText("Materialidad", {
    x: 42,
    y: height - 112,
    size: 43,
    font: serif,
    color: white,
  });

  page.drawText("y Acabados", {
    x: 42,
    y: height - 160,
    size: 43,
    font: serif,
    color: white,
  });

  page.drawLine({
    start: { x: 42, y: height - 180 },
    end: { x: 155, y: height - 180 },
    thickness: 0.9,
    color: line,
  });

  page.drawText("UNA SELECCIÓN CUIDADA DE MATERIALES NOBLES Y DETALLES ARTESANALES.", {
    x: 42,
    y: height - 205,
    size: 8.8,
    font: regular,
    color: white,
  });

  if (image) {
    drawImageCover(page, image, { x: 38, y: 188, width: 345, height: 455 }, line, 0);
  }

  const sideX = 408;
  page.drawText("SELECCIÓN DE MATERIALES", {
    x: sideX + 8,
    y: height - 205,
    size: 9,
    font: bold,
    color: gold,
  });

  page.drawLine({
    start: { x: sideX - 8, y: height - 224 },
    end: { x: width - 44, y: height - 224 },
    thickness: 0.8,
    color: line,
  });

  let y = height - 263;

  for (const material of selected) {
    const label = CATEGORY_LABELS[material.category] || material.family.toUpperCase();

    page.drawText(label, {
      x: sideX + 46,
      y,
      size: 8.8,
      font: bold,
      color: gold,
    });

    const lines = wrapText(cleanText(material.description), 28).slice(0, 3);
    let textY = y - 16;
    for (const textLine of lines) {
      page.drawText(textLine, {
        x: sideX + 46,
        y: textY,
        size: 8.2,
        font: regular,
        color: white,
      });
      textY -= 11;
    }

    page.drawRectangle({
      x: sideX + 2,
      y: y - 28,
      width: 28,
      height: 28,
      borderColor: gold,
      borderWidth: 0.7,
    });

    page.drawText(material.title.slice(0, 2).toUpperCase(), {
      x: sideX + 8,
      y: y - 11,
      size: 8,
      font: bold,
      color: gold,
    });

    page.drawLine({
      start: { x: sideX - 8, y: y - 52 },
      end: { x: width - 44, y: y - 52 },
      thickness: 0.45,
      color: line,
      opacity: 0.65,
    });

    y -= 72;
  }

  page.drawText("“", {
    x: sideX - 8,
    y: 183,
    size: 22,
    font: serif,
    color: gold,
  });

  const quote = [
    "Cada material fue elegido",
    "para crear una experiencia",
    "atemporal y sofisticada.",
  ];

  let quoteY = 170;
  for (const lineText of quote) {
    page.drawText(lineText, {
      x: sideX + 24,
      y: quoteY,
      size: 14,
      font: serif,
      color: white,
    });
    quoteY -= 18;
  }

  page.drawText("”", {
    x: width - 62,
    y: 125,
    size: 22,
    font: serif,
    color: gold,
  });

  const sampleCount = selected.length;
  const gap = 14;
  const sampleW = Math.min(74, (width - 84 - gap * (sampleCount - 1)) / sampleCount);
  const startX = (width - (sampleW * sampleCount + gap * (sampleCount - 1))) / 2;

  selected.forEach((material, index) => {
    const x = startX + index * (sampleW + gap);

    page.drawRectangle({
      x,
      y: 80,
      width: sampleW,
      height: 58,
      borderColor: line,
      borderWidth: 0.45,
      color: black,
      opacity: 0.35,
    });

    page.drawText(material.title.toUpperCase().slice(0, 18), {
      x,
      y: 58,
      size: 6.8,
      font: regular,
      color: white,
      maxWidth: sampleW,
    });
  });

  drawPemFooter({ page, width, regular, gold, line, footer: assets?.footer });
}
