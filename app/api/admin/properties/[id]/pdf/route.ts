import { NextResponse } from "next/server";
import {
  PDFDocument,
  StandardFonts,
  rgb,
} from "pdf-lib";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

function formatPrice(price?: string | null, currency?: string | null) {
  const raw = String(price ?? "").trim();

  if (!raw) return "Precio disponible bajo solicitud";
  if (/bajo solicitud/i.test(raw)) return raw;

  const clean = raw.replace(/[$,\s]/g, "");
  const numericPrice = Number(clean);

  const formatted = Number.isFinite(numericPrice)
    ? `$${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(numericPrice)}`
    : raw;

  return `${formatted}${currency ? ` ${currency}` : ""}`;
}

function formatArea(value?: number | null) {
  if (value == null) return "N/D";
  return `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value)} m²`;
}

function safeFileName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

function cleanText(value: unknown) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function wrapText(text: string, maxChars: number) {
  const words = cleanText(text).split(" ").filter(Boolean);
  const lines: string[] = [];
  let line = "";

  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > maxChars && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }

  if (line) lines.push(line);
  return lines;
}

async function fetchImageBuffer(url?: string | null) {
  if (!url) return null;

  try {
    const res = await fetch(url);
    if (!res.ok) return null;

    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("image/")) return null;

    const arrayBuffer = await res.arrayBuffer();
    return {
      bytes: new Uint8Array(arrayBuffer),
      contentType,
    };
  } catch {
    return null;
  }
}

async function embedImage(pdfDoc: PDFDocument, url?: string | null) {
  const image = await fetchImageBuffer(url);
  if (!image) return null;

  try {
    if (image.contentType.includes("png")) {
      return await pdfDoc.embedPng(image.bytes);
    }

    return await pdfDoc.embedJpg(image.bytes);
  } catch {
    return null;
  }
}

function getGalleryUrls(value: unknown, coverImage?: string | null) {
  let gallery: string[] = [];

  if (Array.isArray(value)) {
    gallery = value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
  }

  const urls = [coverImage, ...gallery]
    .filter((item): item is string => typeof item === "string" && item.trim().length > 0);

  return Array.from(new Set(urls)).slice(0, 16);
}

function drawImageCover(
  page: any,
  image: any,
  box: { x: number; y: number; width: number; height: number },
  borderColor: any,
) {
  const scale = Math.max(box.width / image.width, box.height / image.height);
  const drawWidth = image.width * scale;
  const drawHeight = image.height * scale;

  page.drawImage(image, {
    x: box.x + (box.width - drawWidth) / 2,
    y: box.y + (box.height - drawHeight) / 2,
    width: drawWidth,
    height: drawHeight,
  });

  page.drawRectangle({
    ...box,
    borderColor,
    borderWidth: 1,
  });
}

export async function GET(_req: Request, { params }: PageProps) {
  const { id } = await params;

  const property = await prisma.brokerProperty.findUnique({
    where: { id },
  });

  if (!property) {
    return NextResponse.json({ error: "Propiedad no encontrada." }, { status: 404 });
  }

  const pdfDoc = await PDFDocument.create();
  pdfDoc.setTitle(property.title);
  pdfDoc.setAuthor("Private Estates Mexico");
  pdfDoc.setSubject("Ficha de propiedad");

  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const page = pdfDoc.addPage([595.28, 841.89]);
  const { width, height } = page.getSize();

  const black = rgb(0.04, 0.04, 0.04);
  const white = rgb(0.96, 0.94, 0.91);
  const gold = rgb(0.84, 0.76, 0.63);
  const muted = rgb(0.72, 0.68, 0.62);
  const line = rgb(0.25, 0.22, 0.18);

  page.drawRectangle({
    x: 0,
    y: 0,
    width,
    height,
    color: black,
  });

  page.drawText("PRIVATE ESTATES MEXICO", {
    x: 165,
    y: height - 48,
    size: 9,
    font: boldFont,
    color: gold,
  });

  const image = await embedImage(pdfDoc, property.coverImage);

  if (image) {
    const imageBox = { x: 44, y: height - 394, width: width - 88, height: 305 };
    const scale = Math.max(imageBox.width / image.width, imageBox.height / image.height);
    const drawWidth = image.width * scale;
    const drawHeight = image.height * scale;

    page.drawImage(image, {
      x: imageBox.x + (imageBox.width - drawWidth) / 2,
      y: imageBox.y + (imageBox.height - drawHeight) / 2,
      width: drawWidth,
      height: drawHeight,
    });

    page.drawRectangle({
      ...imageBox,
      borderColor: line,
      borderWidth: 1,
    });
  } else {
    page.drawRectangle({
      x: 44,
      y: height - 394,
      width: width - 88,
      height: 305,
      color: rgb(0.08, 0.08, 0.08),
      borderColor: line,
      borderWidth: 1,
    });

    page.drawText("Imagen no disponible", {
      x: 232,
      y: height - 250,
      size: 12,
      font: regularFont,
      color: muted,
    });
  }

  const titleLines = wrapText(property.title, 34).slice(0, 3);
  let y = height - 430;

  for (const titleLine of titleLines) {
    page.drawText(titleLine, {
      x: 44,
      y,
      size: 25,
      font: regularFont,
      color: white,
    });
    y -= 30;
  }

  if (property.tagline) {
    y -= 8;
    for (const taglineLine of wrapText(property.tagline, 72).slice(0, 3)) {
      page.drawText(taglineLine, {
        x: 44,
        y,
        size: 12,
        font: regularFont,
        color: muted,
      });
      y -= 18;
    }
  }

  y -= 18;
  page.drawLine({
    start: { x: 44, y },
    end: { x: width - 44, y },
    thickness: 1,
    color: line,
  });

  y -= 30;

  const facts = [
    ["Precio", formatPrice(property.price, property.currency)],
    ["Ubicación", property.location || property.city || "Ubicación premium"],
    ["Recámaras", property.bedrooms ?? "N/D"],
    ["Baños", property.bathrooms ?? "N/D"],
    ["Superficie", formatArea(property.areaTotal ?? property.areaInterior)],
  ];

  for (const [label, value] of facts) {
    page.drawText(String(label).toUpperCase(), {
      x: 44,
      y,
      size: 8,
      font: boldFont,
      color: gold,
    });

    page.drawText(cleanText(value), {
      x: 170,
      y,
      size: 11,
      font: regularFont,
      color: white,
    });

    y -= 27;
  }

  const publicUrl = `https://privateestatesmexico.com/properties/${property.slug || property.id}`;

  page.drawLine({
    start: { x: 44, y: 82 },
    end: { x: width - 44, y: 82 },
    thickness: 1,
    color: line,
  });

  page.drawText(publicUrl, {
    x: 44,
    y: 55,
    size: 9,
    font: regularFont,
    color: muted,
  });

  page.drawText("Ficha generada por Private Estates Mexico", {
    x: 44,
    y: 35,
    size: 8,
    font: regularFont,
    color: rgb(0.45, 0.45, 0.45),
  });

  const score = property.luxuryScore ?? 0;
  const selectionLabel =
    score >= 98
      ? "SIGNATURE COLLECTION"
      : score >= 94
        ? "RESERVE COLLECTION"
        : "CURATED COLLECTION";

  const selectionReason =
    score >= 98
      ? "Seleccionada por Private Estates Mexico por su ubicación privilegiada, amplitud arquitectónica y experiencia residencial excepcional."
      : score >= 94
        ? "Seleccionada por Private Estates Mexico por su equilibrio entre ubicación, diseño, amenidades y valor residencial."
        : "Seleccionada por Private Estates Mexico como parte de una curaduría editorial de residencias con alto valor residencial.";

  const page2 = pdfDoc.addPage([595.28, 841.89]);
  page2.drawRectangle({
    x: 0,
    y: 0,
    width,
    height,
    color: black,
  });

  page2.drawText("PRIVATE ESTATES SELECTION", {
    x: 44,
    y: height - 76,
    size: 9,
    font: boldFont,
    color: gold,
  });

  page2.drawLine({
    start: { x: 44, y: height - 104 },
    end: { x: width - 44, y: height - 104 },
    thickness: 1,
    color: line,
  });

  page2.drawText(selectionLabel, {
    x: 44,
    y: height - 142,
    size: 33,
    font: regularFont,
    color: white,
  });

  page2.drawText("LUXURY SCORE", {
    x: 44,
    y: height - 198,
    size: 9,
    font: boldFont,
    color: gold,
  });

  page2.drawText(`${score} / 100`, {
    x: 44,
    y: height - 248,
    size: 54,
    font: regularFont,
    color: white,
  });

  page2.drawText(property.title, {
    x: 44,
    y: height - 306,
    size: 20,
    font: regularFont,
    color: gold,
  });

  let reasonY = height - 342;
  for (const reasonLine of wrapText(selectionReason, 66).slice(0, 4)) {
    page2.drawText(reasonLine, {
      x: 44,
      y: reasonY,
      size: 12,
      font: regularFont,
      color: muted,
    });
    reasonY -= 19;
  }

  page2.drawLine({
    start: { x: 44, y: height - 430 },
    end: { x: width - 44, y: height - 430 },
    thickness: 1,
    color: line,
  });

  let scoreFactY = height - 470;
  const selectionFacts = [
    ["Precio", formatPrice(property.price, property.currency)],
    ["Ubicación", property.location || property.city || "Ubicación premium"],
    ["Recámaras", property.bedrooms ?? "N/D"],
    ["Baños", property.bathrooms ?? "N/D"],
    ["Superficie", formatArea(property.areaTotal ?? property.areaInterior)],
  ];

  for (const [label, value] of selectionFacts) {
    page2.drawText(String(label).toUpperCase(), {
      x: 44,
      y: scoreFactY,
      size: 8,
      font: boldFont,
      color: gold,
    });

    page2.drawText(cleanText(value), {
      x: 170,
      y: scoreFactY,
      size: 11,
      font: regularFont,
      color: white,
    });

    scoreFactY -= 28;
  }

  page2.drawText("Propiedad seleccionada para la colección editorial de Private Estates Mexico.", {
    x: 44,
    y: 54,
    size: 9,
    font: regularFont,
    color: rgb(0.45, 0.45, 0.45),
  });

  if (property.description) {
    const page3 = pdfDoc.addPage([595.28, 841.89]);
    page3.drawRectangle({
      x: 0,
      y: 0,
      width,
      height,
      color: black,
    });

    page3.drawText("CONCEPTO", {
      x: 44,
      y: height - 72,
      size: 9,
      font: boldFont,
      color: gold,
    });

    page3.drawText("Arquitectura & Experiencia", {
      x: 44,
      y: height - 108,
      size: 24,
      font: regularFont,
      color: white,
    });

    let bodyY = height - 155;
    for (const bodyLine of wrapText(property.description, 86).slice(0, 30)) {
      page3.drawText(bodyLine, {
        x: 44,
        y: bodyY,
        size: 11,
        font: regularFont,
        color: muted,
      });
      bodyY -= 18;
    }
  }

  const galleryUrls = getGalleryUrls(property.gallery, property.coverImage);

  if (galleryUrls.length > 1) {
    const galleryImages = [];

    for (const url of galleryUrls.slice(1)) {
      const img = await embedImage(pdfDoc, url);
      if (img) galleryImages.push(img);
      if (galleryImages.length >= 18) break;
    }

    for (let index = 0; index < galleryImages.length; index += 6) {
      const galleryPage = pdfDoc.addPage([595.28, 841.89]);
      galleryPage.drawRectangle({
        x: 0,
        y: 0,
        width,
        height,
        color: black,
      });

      galleryPage.drawText("GALERÍA", {
        x: 44,
        y: height - 56,
        size: 9,
        font: boldFont,
        color: gold,
      });

      galleryPage.drawText(property.title, {
        x: 44,
        y: height - 84,
        size: 18,
        font: regularFont,
        color: white,
      });

      const boxes = [
        { x: 44, y: height - 275, width: 240, height: 150 },
        { x: 311, y: height - 275, width: 240, height: 150 },
        { x: 44, y: height - 445, width: 240, height: 150 },
        { x: 311, y: height - 445, width: 240, height: 150 },
        { x: 44, y: height - 615, width: 240, height: 150 },
        { x: 311, y: height - 615, width: 240, height: 150 },
      ];

      galleryImages.slice(index, index + 6).forEach((img, boxIndex) => {
        drawImageCover(galleryPage, img, boxes[boxIndex], line);
      });

      galleryPage.drawText("Private Estates Mexico", {
        x: 44,
        y: 42,
        size: 8,
        font: regularFont,
        color: rgb(0.45, 0.45, 0.45),
      });
    }
  }

  const pdfBytes = await pdfDoc.save();
  const fileName = `${safeFileName(property.title || "propiedad")}.pdf`;

  return new NextResponse(new Uint8Array(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${fileName}"`,
      "Cache-Control": "no-store",
    },
  });
}
