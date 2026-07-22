import { NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";

import { prisma } from "@/lib/prisma";

import { renderPage1 } from "./pages/page1";
import { renderPage2 } from "./pages/page2";
import { renderPage3 } from "./pages/page3";
import { renderPage4 } from "./pages/page4";
import { renderPage5 } from "./pages/page5";
import { renderPage6 } from "./pages/page6";
import { renderPage7 } from "./pages/page7";
import { renderPage8 } from "./pages/page8";
import { renderPage9 } from "./pages/page9";

type PageProps = {
  params: Promise<{ id: string }>;
};

function safeFileName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

export async function renderEditorialPdf(
  _request: Request,
  { params }: PageProps,
) {
  const { id } = await params;

  console.log("\n==============================");
  console.log("PDF ID:", id);

  const property = await prisma.brokerProperty.findUnique({
    where: { id },
  });

  console.log("PROPERTY FOUND:", property?.title);
  console.log("==============================\n");

  if (!property) {
    return NextResponse.json(
      { error: "Propiedad no encontrada." },
      { status: 404 },
    );
  }

  const pdf = await PDFDocument.create();

  const ctx = {
    pdf,
    property,
  };

  await renderPage1(ctx);
  await renderPage2(ctx);
  await renderPage3(ctx);
  await renderPage4(ctx);
  await renderPage5(ctx);
  await renderPage6(ctx);
  await renderPage7(ctx);
  await renderPage8(ctx);
  await renderPage9(ctx);

  const bytes = await pdf.save();

  return new NextResponse(
    new Uint8Array(bytes),
    {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition":
          `inline; filename="${safeFileName(property.title)}.pdf"`,
      },
    },
  );
}
