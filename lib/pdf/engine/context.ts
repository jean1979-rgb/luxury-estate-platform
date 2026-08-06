import { PDFDocument } from "pdf-lib";

import { prisma } from "@/lib/prisma";

import type { EditorialPdfDocument } from "@/lib/pdf/document/EditorialPdfDocument";

export type Property = NonNullable<
  Awaited<ReturnType<typeof prisma.brokerProperty.findUnique>>
>;

export interface RenderContext {

  pdf: PDFDocument;

  property: Property;

  document: EditorialPdfDocument;

}
