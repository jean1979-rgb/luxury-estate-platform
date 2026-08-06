import { readFile } from "node:fs/promises";
import path from "node:path";
import { PDFDocument, PDFEmbeddedPage } from "pdf-lib";

export async function loadTemplatePage(
  pdfDoc: PDFDocument,
  pageNumber: number,
): Promise<PDFEmbeddedPage> {
  console.log("LOADING TEMPLATE FILE:", path.join(process.cwd(),"lib","pdf","templates",`page${pageNumber}.ai`));

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

  console.log("EMBEDDED PAGE SIZE:", pages[0].width, pages[0].height);
  return pages[0];
}
