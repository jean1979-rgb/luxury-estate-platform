import fs from "node:fs/promises";
import path from "node:path";

import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, PDFFont } from "pdf-lib";

export interface EditorialFonts {
  trajanLight: PDFFont;
  trajanRegular: PDFFont;
  trajanSemibold: PDFFont;
  trajanBold: PDFFont;
  trajanBlack: PDFFont;
  trajanExtraLight: PDFFont;
}

async function loadFont(
  pdf: PDFDocument,
  fileName: string,
): Promise<PDFFont> {
  const bytes = await fs.readFile(
    path.join(
      process.cwd(),
      "assets",
      "fonts",
      fileName,
    ),
  );

  return pdf.embedFont(bytes);
}

export async function loadFonts(
  pdf: PDFDocument,
): Promise<EditorialFonts> {
  pdf.registerFontkit(fontkit);

  return {
    trajanLight: await loadFont(
      pdf,
      "TrajanPro3-Light.otf",
    ),
    trajanRegular: await loadFont(
      pdf,
      "TrajanPro3-Regular.otf",
    ),
    trajanSemibold: await loadFont(
      pdf,
      "TrajanPro3-Semibold.otf",
    ),
    trajanBold: await loadFont(
      pdf,
      "TrajanPro3-Bold.otf",
    ),
    trajanBlack: await loadFont(
      pdf,
      "TrajanPro3-Black.otf",
    ),
    trajanExtraLight: await loadFont(
      pdf,
      "TrajanPro3-ExtraLight.otf",
    ),
  };
}
