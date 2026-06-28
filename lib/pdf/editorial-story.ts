import type { PDFFont, PDFPage, RGB } from "pdf-lib";

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
  description: string;
  pemFactorItems: string[];
  cleanText: (value: unknown) => string;
  wrapText: (text: string, maxChars: number) => string[];
};

export function drawEditorialStory(params: Params) {
  const { page, width, height, property, fonts, colors, description, pemFactorItems, cleanText, wrapText } = params;
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

  page.drawText("EDITORIAL NARRATIVE", {
    x: 44,
    y: height - 72,
    size: 8,
    font: bold,
    color: gold,
  });

  page.drawText("Architecture & Experience", {
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

  if (property.tagline) {
    let taglineY = height - 185;
    for (const lineText of wrapText(cleanText(property.tagline), 58).slice(0, 3)) {
      page.drawText(lineText, {
        x: 44,
        y: taglineY,
        size: 12.5,
        font: serif,
        color: gold,
      });
      taglineY -= 20;
    }
  }

  const bodyLines = wrapText(cleanText(description), 62).slice(0, 22);
  let bodyY = height - 265;

  for (const lineText of bodyLines) {
    page.drawText(lineText, {
      x: 44,
      y: bodyY,
      size: 10.5,
      font: regular,
      color: muted,
    });
    bodyY -= 16;
  }

  page.drawText("PEM CURATION", {
    x: 365,
    y: height - 185,
    size: 8,
    font: bold,
    color: gold,
  });

  let factorY = height - 220;
  for (const item of pemFactorItems.slice(0, 9)) {
    page.drawLine({
      start: { x: 365, y: factorY + 4 },
      end: { x: 378, y: factorY + 4 },
      thickness: 0.6,
      color: gold,
    });

    page.drawText(cleanText(item).slice(0, 28), {
      x: 388,
      y: factorY,
      size: 9.5,
      font: regular,
      color: white,
    });

    factorY -= 24;
  }

  page.drawText("Private Estates Mexico · Editorial Collection", {
    x: 44,
    y: 50,
    size: 7.5,
    font: regular,
    color: muted,
  });
}
