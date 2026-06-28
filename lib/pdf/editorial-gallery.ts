import type { PDFFont, PDFPage, RGB } from "pdf-lib";
import { drawImageCover, drawPemFooter } from "./editorial-shared";

type Params = {
  page: PDFPage;
  width: number;
  height: number;
  property: any;
  images: any[];
  pageIndex: number;
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

export function drawEditorialGallery(params: Params) {
  const { page, width, height, property, images, pageIndex, fonts, colors, cleanText, wrapText } = params;
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

  page.drawText("PRIVATE ESTATES EDITORIAL", {
    x: 44,
    y: height - 72,
    size: 8,
    font: bold,
    color: gold,
  });

  page.drawText(pageIndex === 0 ? "Property Gallery" : "Gallery Continued", {
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

  const hero = images[0];
  const second = images[1];
  const third = images[2];

  if (hero) {
    drawImageCover(page, hero, { x: 44, y: 420, width: width - 88, height: 245 }, line, 0.45);
  }

  if (second) {
    drawImageCover(page, second, { x: 44, y: 178, width: 244, height: 190 }, line, 0.45);
  }

  if (third) {
    drawImageCover(page, third, { x: 307, y: 178, width: 244, height: 190 }, line, 0.45);
  }

  page.drawText("CURATED VISUAL SELECTION", {
    x: 44,
    y: 145,
    size: 8,
    font: bold,
    color: gold,
  });

  page.drawText("A visual sequence selected to communicate scale, atmosphere and residential character.", {
    x: 44,
    y: 124,
    size: 9,
    font: regular,
    color: muted,
  });

  drawPemFooter({ page, width, regular, gold, line });
}
