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
    y: height - 78,
    size: 7.5,
    font: bold,
    color: gold,
  });

  page.drawText("Spatial Experience", {
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

  const subtitle = has360 ? "IMMERSIVE TOUR AVAILABLE" : "DIGITAL PROPERTY PROFILE";

  page.drawText(subtitle, {
    x: 44,
    y: 610,
    size: 8,
    font: bold,
    color: gold,
  });

  const body = has360
    ? "Scan to access the property profile, full gallery, private inquiry and immersive 360 experience."
    : "Scan to access the property profile, full gallery and private inquiry.";

  let bodyY = 580;
  for (const lineText of wrapText(body, 52).slice(0, 3)) {
    page.drawText(lineText, {
      x: 44,
      y: bodyY,
      size: 11,
      font: regular,
      color: muted,
    });
    bodyY -= 18;
  }

  page.drawRectangle({
    x: width / 2 - 112,
    y: 305,
    width: 224,
    height: 224,
    color: white,
  });

  if (qrImage) {
    page.drawImage(qrImage, {
      x: width / 2 - 98,
      y: 319,
      width: 196,
      height: 196,
    });
  }

  page.drawText("SCAN TO EXPLORE", {
    x: width / 2 - bold.widthOfTextAtSize("SCAN TO EXPLORE", 8) / 2,
    y: 270,
    size: 8,
    font: bold,
    color: gold,
  });

  const cleanUrl = publicUrl.replace(/^https?:\/\//, "");
  const urlLines = wrapText(cleanUrl, 54).slice(0, 2);
  let urlY = 242;
  for (const lineText of urlLines) {
    page.drawText(lineText, {
      x: width / 2 - regular.widthOfTextAtSize(lineText, 8) / 2,
      y: urlY,
      size: 8,
      font: regular,
      color: muted,
    });
    urlY -= 13;
  }

  drawPemFooter({ page, width, regular, gold, line });
}
