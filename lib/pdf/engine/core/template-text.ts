import { PDFPage, PDFFont, rgb } from "pdf-lib";
import type { Bounds, Artboard, TemplateItem } from "./types";


export function cleanText(value: unknown): string {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

export function toPdfBounds(
  bounds: Bounds,
  artboard: Artboard,
) {
  return {
    x: bounds.left - artboard.left,
    y: bounds.bottom - artboard.bottom,
    width: bounds.width,
    height: bounds.height,
  };
}

export function drawCenteredText(
  page: PDFPage,
  item: TemplateItem,
  artboard: Artboard,
  text: string,
  font: PDFFont,
  preferredSize: number,
  color: ReturnType<typeof rgb>,
) {
  const box = toPdfBounds(item.bounds, artboard);

  if (item.field === "title") {
    box.x = 55;
    box.width = page.getWidth() - 110;
  }

  const size = preferredSize;

  const textWidth = font.widthOfTextAtSize(
    text,
    size,
  );

  page.drawRectangle({
    x: box.x - 3,
    y: box.y - 3,
    width: box.width + 6,
    height: box.height + 6,
    color: rgb(0, 0, 0),
  });

  page.drawText(text, {
    x: box.x + (box.width - textWidth) / 2,
    y: box.y,
    size,
    font,
    color,
  });
}
