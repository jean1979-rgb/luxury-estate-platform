import { PDFDocument } from "pdf-lib";

import { prisma } from "@/lib/prisma";

export type Property = NonNullable<
  Awaited<ReturnType<typeof prisma.brokerProperty.findUnique>>
>;

export interface RenderContext {
  pdf: PDFDocument;
  property: Property;
}
