import type { PDFFont, PDFPage, RGB } from "pdf-lib";
import { drawPemFooter } from "./editorial-shared";

type Params = {
  page: PDFPage;
  width: number;
  height: number;
  property: any;
  qrImage: any;
  publicUrl: string;
  has360: boolean;
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

export function drawEditorialSpatial(params: Params) {
  const { page, width, height, property, qrImage, publicUrl, has360, fonts, colors, cleanText, wrapText } = params;
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

  page.drawText("PRIVATE ESTATES DIGITAL EXPERIENCE", {
    x: 44,
    y: height - 72,
    size: 8,
    font: bold,
    color: gold,
  });

  page.drawText("Spatial Experience", {
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

  page.drawText(has360 ? "IMMERSIVE TOUR AVAILABLE" : "DIGITAL PROPERTY PROFILE", {
    x: 44,
    y: 565,
    size: 9,
    font: bold,
    color: gold,
  });

  const body = has360
    ? "Scan the code to access the digital property profile, full gallery and immersive 360 experience curated by Private Estates Mexico."
    : "Scan the code to access the digital property profile, extended gallery and private inquiry options curated by Private Estates Mexico.";

  let bodyY = 530;
  for (const lineText of wrapText(body, 58).slice(0, 4)) {
    page.drawText(lineText, {
      x: 44,
      y: bodyY,
      size: 12,
      font: regular,
      color: muted,
    });
    bodyY -= 19;
  }

  page.drawRectangle({
    x: 335,
    y: 365,
    width: 170,
    height: 170,
    color: white,
  });

  if (qrImage) {
    page.drawImage(qrImage, {
      x: 347,
      y: 377,
      width: 146,
      height: 146,
    });
  }

  page.drawText("SCAN TO EXPLORE", {
    x: 350,
    y: 333,
    size: 8,
    font: bold,
    color: gold,
  });

  const urlLines = wrapText(publicUrl.replace(/^https?:\/\//, ""), 36).slice(0, 2);
  let urlY = 305;
  for (const lineText of urlLines) {
    page.drawText(lineText, {
      x: 305,
      y: urlY,
      size: 8.5,
      font: regular,
      color: muted,
    });
    urlY -= 13;
  }

  const features = has360
    ? ["360 Experience", "Extended Gallery", "Private Showing", "WhatsApp Inquiry"]
    : ["Extended Gallery", "Property Profile", "Private Showing", "WhatsApp Inquiry"];

  let fy = 365;
  for (const item of features) {
    page.drawLine({
      start: { x: 44, y: fy + 4 },
      end: { x: 62, y: fy + 4 },
      thickness: 0.6,
      color: gold,
    });

    page.drawText(item, {
      x: 76,
      y: fy,
      size: 11,
      font: regular,
      color: white,
    });

    fy -= 32;
  }

  drawPemFooter({ page, width, regular, gold, line });
}
