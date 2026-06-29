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

const TITLES = [
  "The Residence",
  "Outdoor Living",
  "Architecture",
  "The View",
  "Private Setting",
  "Lifestyle",
  "Interior Sequence",
  "Arrival",
  "Terrace Living",
  "Residential Character",
];

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

  page.drawText("PRIVATE ESTATES MEXICO", {
    x: 44,
    y: height - 78,
    size: 7.5,
    font: bold,
    color: gold,
  });

  const title = TITLES[pageIndex] || "Private Collection";

  page.drawText(title, {
    x: 44,
    y: height - 132,
    size: 34,
    font: serif,
    color: white,
  });

  page.drawLine({
    start: { x: 44, y: height - 158 },
    end: { x: width - 44, y: height - 158 },
    thickness: 0.65,
    color: gold,
  });

  const image = images[0];

  if (image) {
    drawImageCover(page, image, { x: 44, y: 205, width: width - 88, height: 430 }, line, 0.35);
  }

  const titleLines = wrapText(cleanText(property.title), 58).slice(0, 2);
  let ty = 165;

  for (const lineText of titleLines) {
    page.drawText(lineText, {
      x: 44,
      y: ty,
      size: 10,
      font: regular,
      color: muted,
    });
    ty -= 14;
  }

  drawPemFooter({ page, width, regular, gold, line });
}
