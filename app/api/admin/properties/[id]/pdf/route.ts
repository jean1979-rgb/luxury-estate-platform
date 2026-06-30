import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  PDFDocument,
  StandardFonts,
  rgb,
} from "pdf-lib";
import { prisma } from "@/lib/prisma";
import { drawEditorialCover } from "@/lib/pdf/editorial-cover";
import { drawEditorialAssessment } from "@/lib/pdf/editorial-assessment";
import { drawEditorialStory } from "@/lib/pdf/editorial-story";
import { drawEditorialGallery } from "@/lib/pdf/editorial-gallery";
import { drawEditorialLifestyle } from "@/lib/pdf/editorial-lifestyle";
import { drawEditorialSpatial } from "@/lib/pdf/editorial-spatial";
import { drawEditorialContact } from "@/lib/pdf/editorial-contact";
import QRCode from "qrcode";

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


async function embedLocalImage(pdfDoc: PDFDocument, relativePath: string) {
  try {
    const bytes = await readFile(path.join(process.cwd(), relativePath));
    const data = new Uint8Array(bytes);

    if (/\.png$/i.test(relativePath)) {
      return await pdfDoc.embedPng(data);
    }

    return await pdfDoc.embedJpg(data);
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

  const image = await embedImage(pdfDoc, property.coverImage);

  const pemAssets = {
    headerLogo: await embedLocalImage(pdfDoc, "public/pem-assets/Logo.jpg"),
    laurel: await embedLocalImage(pdfDoc, "public/pem-assets/Laurel.png"),
    footer: await embedLocalImage(pdfDoc, "public/pem-assets/Logo footer.png"),
    icons: {
      price: await embedLocalImage(pdfDoc, "public/pem-assets/Precio.png"),
      location: await embedLocalImage(pdfDoc, "public/pem-assets/Ubicacion.png"),
      bedrooms: await embedLocalImage(pdfDoc, "public/pem-assets/Recamara.png"),
      bathrooms: await embedLocalImage(pdfDoc, "public/pem-assets/Banos.png"),
      area: await embedLocalImage(pdfDoc, "public/pem-assets/Superficie.png"),
    },
  };

  drawEditorialCover({
    pdfDoc,
    page,
    width,
    height,
    property,
    fonts: {
      regular: regularFont,
      bold: boldFont,
      serif: serifFont,
      serifBold: serifBoldFont,
    },
    colors: {
      black,
      white,
      gold,
      muted,
      line,
    },
    image,
    assets: pemAssets,
    formatPrice,
    formatCount,
    formatArea,
    cleanText,
    wrapText,
  });

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

  drawEditorialAssessment({
    page: page2,
    width,
    height,
    property,
    fonts: {
      regular: regularFont,
      bold: boldFont,
      serif: serifFont,
      serifBold: serifBoldFont,
    },
    colors: {
      black,
      white,
      gold,
      muted,
      line,
    },
    score,
    selectionLabel,
    selectionReason,
    pemFactorItems,
    formatPrice,
    formatCount,
    formatArea,
    cleanText,
    wrapText,
  });

  if (property.description) {
    const page3 = pdfDoc.addPage([595.28, 841.89]);

    drawEditorialStory({
      page: page3,
      width,
      height,
      property,
      fonts: {
        regular: regularFont,
        bold: boldFont,
        serif: serifFont,
        serifBold: serifBoldFont,
      },
      colors: {
        black,
        white,
        gold,
        muted,
        line,
      },
      description: property.description,
      pemFactorItems,
      cleanText,
      wrapText,
    });
  }

  const publicUrl = `https://www.privateestatesmexico.com/properties/${property.slug || property.id}`;
  const qrDataUrl = await QRCode.toDataURL(publicUrl, {
    margin: 1,
    width: 512,
    color: {
      dark: "#000000",
      light: "#FFFFFF",
    },
  });
  const qrBase64 = qrDataUrl.split(",")[1] || "";
  const qrImage = await pdfDoc.embedPng(Buffer.from(qrBase64, "base64"));
  const propertyWithScenes = property as typeof property & { scenes360?: unknown[] };
  const has360 = Array.isArray(propertyWithScenes.scenes360) && propertyWithScenes.scenes360.length > 0;

  const spatialPage = pdfDoc.addPage([595.28, 841.89]);

  drawEditorialSpatial({
    page: spatialPage,
    width,
    height,
    property,
    qrImage,
    publicUrl,
    has360,
    fonts: {
      regular: regularFont,
      bold: boldFont,
      serif: serifFont,
      serifBold: serifBoldFont,
    },
    colors: {
      black,
      white,
      gold,
      muted,
      line,
    },
    cleanText,
    wrapText,
  });

  const galleryUrls = getGalleryUrls(property.gallery, property.coverImage);

  if (galleryUrls.length > 1) {
    const lifestyleImage = await embedImage(pdfDoc, galleryUrls[1] || property.coverImage);

    const lifestylePage = pdfDoc.addPage([595.28, 841.89]);

    drawEditorialLifestyle({
      page: lifestylePage,
      width,
      height,
      property,
      image: lifestyleImage,
      lifestyleItems: pemFactorItems,
      fonts: {
        regular: regularFont,
        bold: boldFont,
        serif: serifFont,
        serifBold: serifBoldFont,
      },
      colors: {
        black,
        white,
        gold,
        muted,
        line,
      },
      cleanText,
      wrapText,
    });
  }

  if (galleryUrls.length > 1) {
    const galleryImages = [];

    for (const url of galleryUrls.slice(1)) {
      const img = await embedImage(pdfDoc, url);
      if (img) galleryImages.push(img);
      if (galleryImages.length >= 12) break;
    }

    for (let index = 0; index < galleryImages.length; index += 1) {
      const galleryPage = pdfDoc.addPage([595.28, 841.89]);

      drawEditorialGallery({
        page: galleryPage,
        width,
        height,
        property,
        images: galleryImages.slice(index, index + 1),
        pageIndex: index / 3,
        fonts: {
          regular: regularFont,
          bold: boldFont,
          serif: serifFont,
          serifBold: serifBoldFont,
        },
        colors: {
          black,
          white,
          gold,
          muted,
          line,
        },
        cleanText,
        wrapText,
      });
    }
  }

  const contactPage = pdfDoc.addPage([595.28,841.89]);

  drawEditorialContact({

    page:contactPage,

    width,
    height,

    fonts:{
      regular:regularFont,
      bold:boldFont,
      serif:serifFont,
      serifBold:serifBoldFont
    },

    colors:{
      black,
      white,
      gold,
      muted,
      line
    }

  });

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
