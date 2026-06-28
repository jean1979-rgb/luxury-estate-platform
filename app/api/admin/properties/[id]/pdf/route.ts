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
  if (value == null || value <= 0) return "";
  return `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value)} m²`;
}

function formatCount(value?: number | null) {
  if (value == null || value <= 0) return "";
  return String(value);
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

function drawLuxuryLaurel(params: {
  page: any;
  centerX: number;
  centerY: number;
  score: number;
  gold: any;
  white: any;
  regularFont: any;
  boldFont: any;
}) {
  const { page, centerX, centerY, score, gold, white, regularFont, boldFont } = params;

  const leafW = 3.7;
  const leafH = 10.5;

  for (let i = 0; i < 11; i++) {
    const t = i / 10;
    const y = centerY - 52 + t * 104;

    // Laurel cóncavo: más abierto abajo/arriba, más cercano al score al centro.
    const curve = Math.sin(t * Math.PI);
    const distance = 54 - curve * 16;

    const leftX = centerX - distance;
    const rightX = centerX + distance;

    const leftAngle = 26 - t * 42;
    const rightAngle = -26 + t * 42;

    page.drawEllipse({
      x: leftX,
      y,
      xScale: leafW,
      yScale: leafH,
      rotate: { type: "degrees", angle: leftAngle },
      color: gold,
      opacity: 0.9,
    });

    page.drawEllipse({
      x: rightX,
      y,
      xScale: leafW,
      yScale: leafH,
      rotate: { type: "degrees", angle: rightAngle },
      color: gold,
      opacity: 0.9,
    });
  }

  // base discreta del laurel
  page.drawLine({
    start: { x: centerX - 34, y: centerY - 64 },
    end: { x: centerX - 6, y: centerY - 58 },
    thickness: 0.8,
    color: gold,
  });

  page.drawLine({
    start: { x: centerX + 34, y: centerY - 64 },
    end: { x: centerX + 6, y: centerY - 58 },
    thickness: 0.8,
    color: gold,
  });

  page.drawText("LUXURY SCORE", {
    x: centerX - boldFont.widthOfTextAtSize("LUXURY SCORE", 8) / 2,
    y: centerY + 50,
    size: 8,
    font: boldFont,
    color: gold,
  });

  const scoreText = String(score);
  page.drawText(scoreText, {
    x: centerX - regularFont.widthOfTextAtSize(scoreText, 58) / 2,
    y: centerY - 12,
    size: 58,
    font: regularFont,
    color: gold,
  });

  page.drawText("/ 100", {
    x: centerX - regularFont.widthOfTextAtSize("/ 100", 14) / 2,
    y: centerY - 36,
    size: 14,
    font: regularFont,
    color: white,
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
  const serifFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const serifBoldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

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

  const coverScore = property.luxuryScore ?? 0;
  const coverLabel =
    coverScore >= 95
      ? "ICONIC RESIDENCE"
      : coverScore >= 90
        ? "SIGNATURE RESIDENCE"
        : coverScore >= 85
          ? "EXCEPTIONAL RESIDENCE"
          : "PRIVATE ESTATES SELECTION";

  const publicUrl = `https://privateestatesmexico.com/properties/${property.slug || property.id}`;
  const image = await embedImage(pdfDoc, property.coverImage);

  // Portada editorial full-bleed
  if (image) {
    const scale = Math.max(width / image.width, height / image.height);
    const drawWidth = image.width * scale;
    const drawHeight = image.height * scale;

    page.drawImage(image, {
      x: (width - drawWidth) / 2,
      y: (height - drawHeight) / 2,
      width: drawWidth,
      height: drawHeight,
    });
  } else {
    page.drawRectangle({ x: 0, y: 0, width, height, color: black });
  }

  // Overlay oscuro para lectura editorial
  page.drawRectangle({
    x: 0,
    y: 0,
    width,
    height,
    color: black,
    opacity: 0.28,
  });

  page.drawRectangle({
    x: 0,
    y: 0,
    width,
    height: 330,
    color: black,
    opacity: 0.78,
  });

  page.drawRectangle({
    x: 0,
    y: height - 210,
    width,
    height: 210,
    color: black,
    opacity: 0.52,
  });

  // borde exterior muy fino
  page.drawRectangle({
    x: 14,
    y: 14,
    width: width - 28,
    height: height - 28,
    borderColor: gold,
    borderWidth: 0.45,
  });

  function centerText(text: string, yPos: number, size: number, font: any, color: any, tracking = 0) {
    const textWidth = font.widthOfTextAtSize(text, size) + Math.max(0, text.length - 1) * tracking;
    let x = (width - textWidth) / 2;

    for (const char of text) {
      page.drawText(char, { x, y: yPos, size, font, color });
      x += font.widthOfTextAtSize(char, size) + tracking;
    }
  }

  centerText("PE", height - 78, 42, serifFont, gold, -2);
  centerText("PRIVATE ESTATES", height - 118, 18, serifFont, white, 7);
  centerText("MEXICO", height - 150, 13, serifFont, gold, 6);
  centerText("EDITORIAL COLLECTION", height - 176, 7, boldFont, gold, 4);

  page.drawLine({ start: { x: 154, y: height - 139 }, end: { x: 244, y: height - 139 }, thickness: 0.6, color: gold });
  page.drawLine({ start: { x: 352, y: height - 139 }, end: { x: 442, y: height - 139 }, thickness: 0.6, color: gold });

  // Título y score sobre panel inferior
  page.drawText(coverLabel, {
    x: 44,
    y: 286,
    size: 8,
    font: boldFont,
    color: gold,
  });

  page.drawLine({
    start: { x: 44, y: 274 },
    end: { x: 225, y: 274 },
    thickness: 0.7,
    color: gold,
  });

  const titleLines = wrapText(property.title, 30).slice(0, 3);
  let titleY = 238;
  for (const titleLine of titleLines) {
    page.drawText(titleLine, {
      x: 44,
      y: titleY,
      size: 25,
      font: serifFont,
      color: white,
    });
    titleY -= 30;
  }

  page.drawLine({
    start: { x: 350, y: 286 },
    end: { x: 350, y: 110 },
    thickness: 0.55,
    color: gold,
  });

  page.drawText("LUXURY SCORE", {
    x: 420,
    y: 250,
    size: 8,
    font: boldFont,
    color: gold,
  });

  const scoreText = String(coverScore);
  page.drawText(scoreText, {
    x: 440 - serifFont.widthOfTextAtSize(scoreText, 62) / 2,
    y: 188,
    size: 62,
    font: serifFont,
    color: gold,
  });

  page.drawText("/ 100", {
    x: 422,
    y: 166,
    size: 14,
    font: serifFont,
    color: white,
  });

  page.drawLine({
    start: { x: 395, y: 143 },
    end: { x: 490, y: 143 },
    thickness: 0.65,
    color: gold,
  });

  // Facts inferiores limpios
  const coverFacts = [
    ["PRECIO", formatPrice(property.price, property.currency)],
    ["UBICACIÓN", property.location || property.city || "Ubicación premium"],
    ["RECÁMARAS", formatCount(property.bedrooms)],
    ["BAÑOS", formatCount(property.bathrooms)],
    ["SUPERFICIE", formatArea(property.areaTotal ?? property.areaInterior)],
  ].filter(([, value]) => cleanText(value));

  let factY = 148;
  for (const [label, value] of coverFacts.slice(0, 5)) {
    page.drawText(label, {
      x: 44,
      y: factY,
      size: 7.5,
      font: boldFont,
      color: gold,
    });

    page.drawText(cleanText(value), {
      x: 128,
      y: factY,
      size: 9,
      font: regularFont,
      color: white,
    });

    factY -= 22;
  }

  page.drawLine({
    start: { x: 44, y: 57 },
    end: { x: 236, y: 57 },
    thickness: 0.45,
    color: gold,
  });

  page.drawLine({
    start: { x: 360, y: 57 },
    end: { x: width - 44, y: 57 },
    thickness: 0.45,
    color: gold,
  });

  centerText("PRIVATE ESTATES MEXICO", 43, 7, regularFont, gold, 4);

  const score = property.luxuryScore ?? 0;
  const selectionLabel =
    score >= 95
      ? "ICONIC RESIDENCE"
      : score >= 90
        ? "SIGNATURE RESIDENCE"
        : score >= 85
          ? "EXCEPTIONAL RESIDENCE"
          : "PRIVATE ESTATES SELECTION";

  const selectionReason =
    score >= 98
      ? "Seleccionada por Private Estates Mexico por su ubicación privilegiada, amplitud arquitectónica y experiencia residencial excepcional."
      : score >= 94
        ? "Seleccionada por Private Estates Mexico por su equilibrio entre ubicación, diseño, amenidades y valor residencial."
        : "Seleccionada por Private Estates Mexico como parte de una curaduría editorial de residencias con alto valor residencial.";

  const pemFactorLabels: Record<string, string> = {
    partial: "Vista parcial",
    open: "Vista abierta",
    panoramic: "Vista panorámica",
    iconic: "Vista icónica",
    medium: "Privacidad media",
    high: "Privacidad alta",
    very_high: "Privacidad muy alta",
    estate: "Privacidad estate-level",
    none: "Sin relación directa con el mar",
    near_ocean: "Cercano al mar",
    ocean_view: "Vista al mar",
    oceanfront: "Frente al mar",
    beach_access: "Acceso directo a playa",
    selection: "Selección PEM",
    signature: "Residencia Signature",
    resort: "Lifestyle resort",
    family: "Family retreat",
    wellness: "Wellness",
    entertainment: "Entretenimiento",
    investment: "Inversión patrimonial",
    second_home: "Segunda residencia",
    primary_home: "Residencia permanente",
    beach_club: "Club de playa",
    spa: "Spa",
    gym: "Gimnasio",
    padel: "Pádel",
    tennis: "Tenis",
    marina: "Marina",
    private_pool: "Alberca privada",
    roof_garden: "Roof garden",
    dock: "Muelle",
    helipad: "Helipuerto",
    contemporary: "Arquitectura contemporánea",
    author_design: "Arquitectura de autor",
    curated_interiors: "Diseño interior curado",
    double_height: "Doble altura",
    natural_stone: "Piedra / mármol natural",
    luxury_millwork: "Carpintería de lujo",
    floor_to_ceiling: "Ventanales piso-techo",
    premium_materials: "Materiales premium",
  };

  function labelPemFactor(value: unknown) {
    const key = String(value || "").trim();
    return pemFactorLabels[key] || key;
  }

  function getPemFactorItems(value: unknown) {
    if (!value || typeof value !== "object" || Array.isArray(value)) return [];
    const factors = value as Record<string, unknown>;
    const items: string[] = [];

    for (const key of ["viewQuality", "privacy", "oceanRelation", "pemClassification"]) {
      if (typeof factors[key] === "string" && factors[key]) {
        items.push(labelPemFactor(factors[key]));
      }
    }

    for (const key of ["experience", "amenities", "architecture"]) {
      const list = factors[key];
      if (Array.isArray(list)) {
        for (const item of list) {
          if (typeof item === "string" && item) items.push(labelPemFactor(item));
        }
      }
    }

    return items.filter(Boolean).slice(0, 12);
  }

  const pemFactorItems = getPemFactorItems(property.pemFactors);

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
    ["Recámaras", formatCount(property.bedrooms)],
    ["Baños", formatCount(property.bathrooms)],
    ["Superficie", formatArea(property.areaTotal ?? property.areaInterior)],
  ];

  for (const [label, value] of selectionFacts) {
    if (!cleanText(value)) continue;
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

  if (pemFactorItems.length > 0) {
    scoreFactY -= 18;

    page2.drawLine({
      start: { x: 44, y: scoreFactY },
      end: { x: width - 44, y: scoreFactY },
      thickness: 1,
      color: line,
    });

    scoreFactY -= 34;

    page2.drawText("FACTORES DESTACADOS PEM", {
      x: 44,
      y: scoreFactY,
      size: 9,
      font: boldFont,
      color: gold,
    });

    scoreFactY -= 28;

    let chipX = 44;
    let chipY = scoreFactY;
    const chipGap = 8;
    const chipHeight = 24;

    pemFactorItems.forEach((item) => {
      const label = cleanText(item);
      const chipWidth = Math.min(220, Math.max(82, label.length * 5.8 + 24));

      if (chipX + chipWidth > width - 44) {
        chipX = 44;
        chipY -= chipHeight + 10;
      }

      page2.drawRectangle({
        x: chipX,
        y: chipY - 7,
        width: chipWidth,
        height: chipHeight,
        borderColor: gold,
        borderWidth: 0.6,
        color: rgb(0.08, 0.075, 0.06),
      });

      page2.drawText(label, {
        x: chipX + 12,
        y: chipY,
        size: 9,
        font: regularFont,
        color: white,
      });

      chipX += chipWidth + chipGap;
    });
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
