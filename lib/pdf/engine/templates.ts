import { readFile } from "node:fs/promises";
import path from "node:path";
import { PDFDocument, PDFEmbeddedPage } from "pdf-lib";

export async function loadTemplatePage(
  pdfDoc: PDFDocument,
  pageNumber: number,
): Promise<PDFEmbeddedPage> {
  const bytes = await readFile(
    path.join(
      process.cwd(),
      "lib",
      "pdf",
      "templates",
      `page${pageNumber}.ai`,
    ),
  );

  const pages = await pdfDoc.embedPdf(bytes);

  if (!pages.length) {
    throw new Error(
      `Template page${pageNumber}.ai no contiene páginas PDF.`,
    );
  }

  return pages[0];
}
