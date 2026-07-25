import fs from "node:fs/promises";
import path from "node:path";

import {
  PDFDocument,
  PDFPage,
} from "pdf-lib";

import type { Bounds } from "./types";

function fitCover(
  imgWidth: number,
  imgHeight: number,
  boxWidth: number,
  boxHeight: number,
) {
  const scale = Math.max(
    boxWidth / imgWidth,
    boxHeight / imgHeight,
  );

  return {
    width: imgWidth * scale,
    height: imgHeight * scale,
  };
}

export async function drawImageCover(
  pdf: PDFDocument,
  page: PDFPage,
  imagePath: string,
  bounds: Bounds,
) {
  if (!imagePath) return;

  const absolute = path.join(
    process.cwd(),
    "public",
    imagePath.replace(/^\/+/, ""),
  );

  const bytes = await fs.readFile(absolute);

  const image =
    imagePath.toLowerCase().endsWith(".png")
      ? await pdf.embedPng(bytes)
      : await pdf.embedJpg(bytes);

  const size = fitCover(
    image.width,
    image.height,
    bounds.width,
    bounds.height,
  );

  page.drawImage(image, {
    x: bounds.left - (size.width - bounds.width) / 2,
    y: bounds.bottom - (size.height - bounds.height) / 2,
    width: size.width,
    height: size.height,
  });
}
