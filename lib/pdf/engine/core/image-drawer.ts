import fs from "node:fs/promises";
import path from "node:path";

import {
  PDFDocument,
  PDFPage,
} from "pdf-lib";

import type { Artboard, Bounds } from "./types";
import { toPdfBounds } from "./template-text";

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
  artboard: Artboard,
) {
  console.log("IMAGE BOUNDS:", JSON.stringify(bounds));
  if (!imagePath) return;

  let bytes: Uint8Array;

  if (
    imagePath.startsWith("http://") ||
    imagePath.startsWith("https://")
  ) {
    console.log("DRAW IMAGE URL:", imagePath);
    const response = await fetch(imagePath);
    console.log("DRAW IMAGE STATUS:", response.status, response.ok);

    if (!response.ok) {
      throw new Error(
        `No se pudo descargar la imagen: ${imagePath}`,
      );
    }

    bytes = new Uint8Array(
      await response.arrayBuffer(),
    );
  } else {
    const absolute = path.join(
      process.cwd(),
      "public",
      imagePath.replace(/^\/+/, ""),
    );

    bytes = await fs.readFile(absolute);
  }

  const image =
    imagePath.toLowerCase().endsWith(".png")
      ? await pdf.embedPng(bytes)
      : await pdf.embedJpg(bytes);

  const pdfBounds = toPdfBounds(
    bounds,
    artboard,
  );

  const size = fitCover(
    image.width,
    image.height,
    pdfBounds.width,
    pdfBounds.height,
  );

  page.drawImage(image, {
    x: pdfBounds.x - (size.width - pdfBounds.width) / 2,
    y: pdfBounds.y - (size.height - pdfBounds.height) / 2,
    width: size.width,
    height: size.height,
  });
}
