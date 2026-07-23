import type { AdminPropertyInput } from "@/types/admin";
import { EDITORIAL_CATALOG } from "./editorialCatalog";
import { amenityEditorialCatalog } from "./amenityEditorialCatalog";

export type EditorialResult = {
  tagline: string;
  description: string;
};

import type { AdminPemFactors } from "@/types/admin";

type PropertyProfile = {
  type: string;
  location: string;
  bedrooms: number;
  bathrooms: number;
  area: string;
  factors: AdminPemFactors;
};

function buildPropertyProfile(property: AdminPropertyInput): PropertyProfile {
  return {
    type: property.propertyType,
    location: property.zoneLabel || property.location,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    area: property.areaInterior || property.areaTotal,
    factors: property.pemFactors ?? {},
  };
}

function generateTagline(profile: PropertyProfile): string {
  const names: Record<string, string> = {
    villa: "Villa",
    penthouse: "Penthouse",
    residence: "Residencia",
    estate: "Estate",
    condo: "Condominio",
    land: "Terreno",
  };

  const type = names[profile.type] ?? "Propiedad";

  return `${type} de lujo en ${profile.location}`;
}

function generateDescription(profile: PropertyProfile): string {
  const p1 =
    `Ubicada en ${profile.location}, esta residencia ha sido concebida para ofrecer una experiencia donde la amplitud, la privacidad y la arquitectura conviven de forma natural. Cada espacio busca aprovechar su entorno y brindar una sensación permanente de confort.`;

  const editorial = describeFactors(profile.factors);

  const p2 =
    editorial ||
    `Con ${profile.area} m² de construcción, ${profile.bedrooms} recámaras y ${profile.bathrooms} baños, la distribución privilegia áreas sociales generosas, espacios privados bien definidos y una circulación pensada para disfrutar la propiedad en cualquier momento del día.`;

  const p3 =
    describeAmenities(profile.factors) ||
    `Más que una propiedad, representa una oportunidad para vivir dentro de una de las colecciones residenciales más exclusivas, combinando diseño, funcionalidad y un estilo de vida orientado al bienestar.`;

  return [p1, p2, p3].join("\n\n");
}





function describeFactors(factors: AdminPemFactors): string {
  const lines: string[] = [];

  switch (factors.oceanRelation) {
    case "oceanfront":
      lines.push("El mar forma parte de la experiencia cotidiana de la residencia.");
      break;
    case "ocean_view":
      lines.push("Las vistas al océano acompañan los principales espacios de la propiedad.");
      break;
    case "beach_access":
      lines.push("La cercanía al mar permite disfrutar un estilo de vida orientado a la playa.");
      break;
  }

  switch (factors.viewQuality) {
    case "panoramic":
      lines.push("Las vistas panorámicas enriquecen la experiencia residencial.");
      break;
    case "iconic":
      lines.push("La residencia disfruta de vistas emblemáticas dentro de su entorno.");
      break;
  }

  return lines.join(" ");
}


function describeAmenities(factors: AdminPemFactors): string {
  const amenities = factors.amenities ?? [];

  const matches = amenityEditorialCatalog
    .map(entry => ({
      paragraph:
        entry.paragraphs[
          Math.floor(Math.random() * entry.paragraphs.length)
        ],
      score: entry.amenities.filter(a => amenities.includes(a)).length,
    }))
    .filter(entry => entry.score > 0)
    .sort((a, b) => b.score - a.score);

  if (matches.length === 0) {
    return "";
  }

  if (matches.length === 1) {
    return matches[0].paragraph;
  }

  return matches
    .slice(0, 2)
    .map(m => m.paragraph)
    .join(" ");
}


export function generateEditorial(
  property: AdminPropertyInput
): EditorialResult {
  const profile = buildPropertyProfile(property);

  return {
    tagline: generateTagline(profile),
    description: generateDescription(profile),
  };
}
