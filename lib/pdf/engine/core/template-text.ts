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

export function drawCenteredTextAutoFit(
  page: PDFPage,
  item: TemplateItem,
  artboard: Artboard,
  text: string,
  font: PDFFont,
  preferredSize: number,
  color: ReturnType<typeof rgb>,
) {
  const box = toPdfBounds(
    item.bounds,
    artboard,
  );

  const words = text
    .replace(/\r?\n/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  const minimumSize = 8;
  const step = 0.5;
  const lineHeightFactor = 1.15;

  let size = preferredSize;
  let lines: string[] = [];

  function buildLines(
    currentSize: number,
  ): string[] {
    const result: string[] = [];
    let currentLine = "";

    for (const word of words) {
      const candidate =
        currentLine.length > 0
          ? `${currentLine} ${word}`
          : word;

      const candidateWidth =
        font.widthOfTextAtSize(
          candidate,
          currentSize,
        );

      if (
        currentLine.length > 0 &&
        candidateWidth > box.width
      ) {
        result.push(currentLine);
        currentLine = word;
      } else {
        currentLine = candidate;
      }
    }

    if (currentLine.length > 0) {
      result.push(currentLine);
    }

    return result.length > 0
      ? result
      : [""];
  }

  while (size > minimumSize) {
    lines = buildLines(size);

    const widestLine = Math.max(
      ...lines.map((line) =>
        font.widthOfTextAtSize(
          line,
          size,
        ),
      ),
    );

    const totalHeight =
      lines.length *
      size *
      lineHeightFactor;

    if (
      widestLine <= box.width &&
      totalHeight <= box.height
    ) {
      break;
    }

    size = Math.max(
      minimumSize,
      size - step,
    );
  }

  lines = buildLines(size);

  const lineHeight =
    size * lineHeightFactor;

  const totalHeight =
    lines.length * lineHeight;

  const firstBaseline =
    box.y +
    (box.height - totalHeight) / 2 +
    totalHeight -
    size;

  page.drawRectangle({
    x: box.x - 3,
    y: box.y - 3,
    width: box.width + 6,
    height: box.height + 6,
    color: rgb(0, 0, 0),
  });

  lines.forEach(
    (line, index) => {
      const lineWidth =
        font.widthOfTextAtSize(
          line,
          size,
        );

      page.drawText(line, {
        x:
          box.x +
          (box.width - lineWidth) / 2,
        y:
          firstBaseline -
          index * lineHeight,
        size,
        font,
        color,
      });
    },
  );
}

export function drawLeftAlignedText(
  page: PDFPage,
  item: TemplateItem,
  artboard: Artboard,
  text: string,
  font: PDFFont,
  preferredSize: number,
  color: ReturnType<typeof rgb>,
) {
  const box = toPdfBounds(
    item.bounds,
    artboard,
  );

  page.drawRectangle({
    x: box.x - 3,
    y: box.y - 3,
    width: box.width + 6,
    height: box.height + 6,
    color: rgb(0, 0, 0),
  });

  page.drawText(text, {
    x: box.x,
    y: box.y,
    size: preferredSize,
    font,
    color,
  });
}

