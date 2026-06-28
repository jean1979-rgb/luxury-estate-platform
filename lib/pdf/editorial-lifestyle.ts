import type { PDFFont, PDFPage, RGB } from "pdf-lib";
import { drawImageCover, drawPemFooter } from "./editorial-shared";

type Params = {
  page: PDFPage;
  width: number;
  height: number;
  property: any;
  image: any;
  lifestyleItems: string[];
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
  cleanText: (value: unknown) => string;
  wrapText: (text: string, maxChars: number) => string[];
};

export function drawEditorialLifestyle(params: Params) {
  const { page, width, height, property, image, lifestyleItems, fonts, colors, cleanText, wrapText } = params;
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

  page.drawText("PRIVATE ESTATES LIFESTYLE", {
    x: 44,
    y: height - 72,
    size: 8,
    font: bold,
    color: gold,
  });

  page.drawText("Curated Lifestyle", {
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

  const titleLines = wrapText(cleanText(property.title), 52).slice(0, 2);
  let titleY = height - 174;
  for (const lineText of titleLines) {
    page.drawText(lineText, {
      x: 44,
      y: titleY,
      size: 10.5,
      font: regular,
      color: muted,
    });
    titleY -= 15;
  }

  if (image) {
    drawImageCover(page, image, { x: 44, y: 375, width: width - 88, height: 255 }, line, 0.45);
  }

  page.drawText("RESIDENTIAL EXPERIENCE", {
    x: 44,
    y: 325,
    size: 8,
    font: bold,
    color: gold,
  });

  const intro =
    "A curated selection of lifestyle attributes that define the residential experience, atmosphere and everyday value of this property.";

  let introY = 298;
  for (const lineText of wrapText(intro, 78).slice(0, 2)) {
    page.drawText(lineText, {
      x: 44,
      y: introY,
      size: 9.5,
      font: regular,
      color: muted,
    });
    introY -= 15;
  }

  const items = lifestyleItems.length
    ? lifestyleItems
    : ["Private Residence", "Security", "Residential Comfort", "Lifestyle Value"];

  let itemX = 44;
  let itemY = 232;

  for (const item of items.slice(0, 12)) {
    page.drawLine({
      start: { x: itemX, y: itemY + 4 },
      end: { x: itemX + 15, y: itemY + 4 },
      thickness: 0.6,
      color: gold,
    });

    page.drawText(cleanText(item).slice(0, 32), {
      x: itemX + 26,
      y: itemY,
      size: 10,
      font: regular,
      color: white,
    });

    itemY -= 28;

    if (itemY < 130) {
      itemY = 232;
      itemX = 315;
    }
  }

  drawPemFooter({ page, width, regular, gold, line });
}
