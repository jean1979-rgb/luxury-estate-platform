import { PDFDocument, PDFEmbeddedPage } from "pdf-lib";

import { loadTemplate } from "@/lib/pdf/loadTemplate";

export async function loadTemplatePage(
  pdf: PDFDocument,
  pageNumber: number,
): Promise<PDFEmbeddedPage> {
  return loadTemplate(pdf, pageNumber);
}
