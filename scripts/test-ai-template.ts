import { readFile } from "node:fs/promises";
import { PDFDocument } from "pdf-lib";

async function main() {
  const bytes = await readFile("lib/pdf/templates/page1.ai");

  const pdf = await PDFDocument.create();
  const pages = await pdf.embedPdf(bytes);

  console.log("Páginas embebidas:", pages.length);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
