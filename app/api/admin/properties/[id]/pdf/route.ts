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
  serifFont: any;
}) {
  const { page, centerX, centerY, score, gold, white, regularFont, boldFont, serifFont } = params;

  // Laurel más cerrado, estilo sello, sin abrirse hacia afuera.
  for (let i = 0; i < 10; i++) {
    const t = i / 9;
    const y = centerY - 48 + t * 92;
    const curve = Math.sin(t * Math.PI);
    const dist = 49 - curve * 13;

    const leafW = 3.3;
    const leafH = 10.5;

    page.drawEllipse({
      x: centerX - dist,
      y,
      xScale: leafW,
      yScale: leafH,
      rotate: { type: "degrees", angle: 42 - t * 54 },
      color: gold,
      opacity: 0.92,
    });

    page.drawEllipse({
      x: centerX + dist,
      y,
      xScale: leafW,
      yScale: leafH,
      rotate: { type: "degrees", angle: -42 + t * 54 },
      color: gold,
      opacity: 0.92,
    });
  }

  page.drawLine({
    start: { x: centerX - 30, y: centerY - 58 },
    end: { x: centerX - 7, y: centerY - 53 },
    thickness: 0.75,
    color: gold,
  });

  page.drawLine({
    start: { x: centerX + 30, y: centerY - 58 },
    end: { x: centerX + 7, y: centerY - 53 },
    thickness: 0.75,
    color: gold,
  });

  page.drawText("LUXURY SCORE", {
    x: centerX - boldFont.widthOfTextAtSize("LUXURY SCORE", 8) / 2,
    y: centerY + 47,
    size: 8,
    font: boldFont,
    color: gold,
  });

  const scoreText = String(score);
  page.drawText(scoreText, {
    x: centerX - serifFont.widthOfTextAtSize(scoreText, 62) / 2,
    y: centerY - 16,
    size: 62,
    font: serifFont,
    color: gold,
  });

  page.drawText("/ 100", {
    x: centerX - serifFont.widthOfTextAtSize("/ 100", 14) / 2,
    y: centerY - 39,
    size: 14,
    font: serifFont,
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
  const white = rgb(0.97, 0.96, 0.93);
  const gold = rgb(0.70, 0.43, 0.13);
  const muted = rgb(0.70, 0.66, 0.58);
  const line = rgb(0.42, 0.28, 0.13);

  page.drawRectangle({
    x: 0,
    y: 0,
    width,
    height,
    color: black,
  });

  const coverScore = property.luxuryScore ?? 0;
  const coverLabel =
    coverScore >= 95 ? "ICONIC RESIDENCE" :
    coverScore >= 90 ? "SIGNATURE RESIDENCE" :
    coverScore >= 85 ? "EXCEPTIONAL RESIDENCE" :
    "PRIVATE ESTATES SELECTION";

  const publicUrl = `https://privateestatesmexico.com/properties/${property.slug || property.id}`;
  const image = await embedImage(pdfDoc, property.coverImage);

  // PORTADA V3 - imagen editorial, sin zoom agresivo
  if (image) {
    const imgBox = { x: 0, y: 250, width, height: 500 };
    const scale = Math.max(imgBox.width / image.width, imgBox.height / image.height);
    const drawWidth = image.width * scale;
    const drawHeight = image.height * scale;

    page.drawImage(image, {
      x: imgBox.x + (imgBox.width - drawWidth) / 2 - 55,
      y: imgBox.y + (imgBox.height - drawHeight) / 2,
      width: drawWidth,
      height: drawHeight,
    });
  }

  // negros reales y gradiente editorial por bloques
  page.drawRectangle({ x: 0, y: 0, width, height, color: black, opacity: 0.18 });
  page.drawRectangle({ x: 0, y: height - 230, width, height: 230, color: black, opacity: 0.992 });
  page.drawRectangle({ x: 0, y: height - 305, width, height: 95, color: black, opacity: 0.50 });
  page.drawRectangle({ x: 0, y: 0, width, height: 315, color: black, opacity: 0.995 });
  page.drawRectangle({ x: 0, y: 245, width, height: 120, color: black, opacity: 0.56 });

  // marco exterior fino
  page.drawRectangle({
    x: 18,
    y: 18,
    width: width - 36,
    height: height - 36,
    borderColor: line,
    borderWidth: 0.45,
  });

  function drawTrackedText(text: string, x: number, yPos: number, size: number, font: any, color: any, tracking = 0) {
    let cursorX = x;
    for (const char of text) {
      page.drawText(char, { x: cursorX, y: yPos, size, font, color });
      cursorX += font.widthOfTextAtSize(char, size) + tracking;
    }
  }

  function trackedWidth(text: string, size: number, font: any, tracking = 0) {
    return font.widthOfTextAtSize(text, size) + Math.max(0, text.length - 1) * tracking;
  }

  function centerText(text: string, yPos: number, size: number, font: any, color: any, tracking = 0) {
    const textWidth = trackedWidth(text, size, font, tracking);
    drawTrackedText(text, (width - textWidth) / 2, yPos, size, font, color, tracking);
  }

  // Branding editorial PEM
  // Monograma dibujado por separado para acercarlo más al render.
  const peY = height - 77;
  page.drawText("P", {
    x: width / 2 - 25,
    y: peY,
    size: 62,
    font: serifFont,
    color: gold,
  });
  page.drawText("E", {
    x: width / 2 - 1,
    y: peY - 9,
    size: 48,
    font: serifFont,
    color: gold,
  });

  centerText("PRIVATE ESTATES", height - 132, 23, serifFont, white, 9.5);
  centerText("MEXICO", height - 168, 15, serifFont, gold, 9);
  centerText("EXCLUSIVE PROPERTIES. EXTRAORDINARY LIFESTYLES.", height - 200, 7.2, boldFont, gold, 3.4);

  page.drawLine({ start: { x: 132, y: height - 155 }, end: { x: 246, y: height - 155 }, thickness: 0.75, color: gold });
  page.drawLine({ start: { x: 350, y: height - 155 }, end: { x: 464, y: height - 155 }, thickness: 0.75, color: gold });

  // Panel inferior editorial
  page.drawText(coverLabel, { x: 44, y: 265, size: 8, font: boldFont, color: gold });
  page.drawLine({ start: { x: 44, y: 252 }, end: { x: 220, y: 252 }, thickness: 0.7, color: gold });

  const titleLines = wrapText(property.title, 25).slice(0, 3);
  let titleY = 218;
  for (const titleLine of titleLines) {
    page.drawText(titleLine, {
      x: 44,
      y: titleY,
      size: 22,
      font: serifFont,
      color: white,
    });
    titleY -= 30;
  }

  page.drawLine({ start: { x: 372, y: 255 }, end: { x: 372, y: 105 }, thickness: 0.6, color: gold });

  drawLuxuryLaurel({
    page,
    centerX: 456,
    centerY: 177,
    score: coverScore,
    gold,
    white,
    regularFont,
    boldFont,
    serifFont,
  });

  page.drawLine({ start: { x: 405, y: 105 }, end: { x: 505, y: 105 }, thickness: 0.6, color: gold });

  page.drawText("CURATED COLLECTION", {
    x: 456 - serifFont.widthOfTextAtSize("CURATED COLLECTION", 11) / 2,
    y: 78,
    size: 11,
    font: serifFont,
    color: gold,
  });

  const coverFacts = [
    ["PRECIO", formatPrice(property.price, property.currency)],
    ["UBICACIÓN", property.location || property.city || "Ubicación premium"],
    ["RECÁMARAS", formatCount(property.bedrooms)],
    ["BAÑOS", formatCount(property.bathrooms)],
    ["SUPERFICIE", formatArea(property.areaTotal ?? property.areaInterior)],
  ].filter(([, value]) => cleanText(value));

  let factY = 126;
  for (const [label, value] of coverFacts.slice(0, 5)) {
    page.drawText(label, { x: 44, y: factY, size: 7.5, font: boldFont, color: gold });

    const valueLines = wrapText(cleanText(value), label === "UBICACIÓN" ? 42 : 30).slice(0, 2);
    let valueY = factY;

    for (const valueLine of valueLines) {
      page.drawText(valueLine, { x: 132, y: valueY, size: 8.5, font: regularFont, color: white });
      valueY -= 11;
    }

    factY -= label === "UBICACIÓN" ? 31 : 22;
  }

  // solecito simple abajo
  const sunX = width / 2;
  const sunY = 43;
  for (let i = 0; i < 9; i++) {
    const dx = (i - 4) * 4;
    page.drawLine({
      start: { x: sunX + dx, y: sunY },
      end: { x: sunX + dx * 1.35, y: sunY + 9 - Math.abs(i - 4) },
      thickness: 0.55,
      color: gold,
    });
  }

  page.drawLine({ start: { x: 44, y: 39 }, end: { x: 236, y: 39 }, thickness: 0.45, color: gold });
  page.drawLine({ start: { x: 360, y: 39 }, end: { x: width - 44, y: 39 }, thickness: 0.45, color: gold });
  centerText("PRIVATE ESTATES MEXICO", 25, 7, regularFont, gold, 4);

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
