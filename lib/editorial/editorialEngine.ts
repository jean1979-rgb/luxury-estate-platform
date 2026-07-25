import type { AdminPropertyInput } from "@/types/admin";
import { EDITORIAL_CATALOG } from "./editorialCatalog";
import { amenityEditorialCatalog } from "./amenityEditorialCatalog";

export type EditorialResult = {
  tagline: string;
  editorialTagline: string;
  description: string;
};

import type { AdminPemFactors } from "@/types/admin";
import { editorialPhrases } from "./editorialPhrases";

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


function randomFrom<T>(items:T[]):T{
  return items[Math.floor(Math.random()*items.length)];
}


function fillTemplate(template:string,data:Record<string,string>):string{

  let s=template;

  for(const [k,v] of Object.entries(data)){
    s=s.replaceAll("{"+k+"}",v);
  }

  return s;
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


function generateEditorialTagline(profile: PropertyProfile): string {

  const typeNames: Record<string,string> = {
    villa:"Una villa",
    penthouse:"Un penthouse",
    condo:"Un departamento",
    residence:"Una residencia",
    estate:"Una residencia",
    house:"Una casa",
    land:"Una propiedad"
  };

  const subject = typeNames[profile.type] ?? "Una propiedad";

  const architecture = randomFrom(editorialPhrases.architecture);
  const view = randomFrom(editorialPhrases.views);
  const lifestyle = randomFrom(editorialPhrases.lifestyle);

  const templates = [

    `${subject} que combina ${architecture}, ${view} y ${lifestyle} en ${profile.location}.`,

    `${subject} concebida para disfrutar ${view}, ${architecture} y un estilo de vida excepcional en ${profile.location}.`,

    `${subject} donde ${architecture}, ${view} y la calidad de vida se integran naturalmente en ${profile.location}.`,

    `${subject} diseñada para quienes buscan ${lifestyle}, ${view} y una ubicación privilegiada en ${profile.location}.`

  ];

  return randomFrom(templates);
}


function generateDescription(profile: PropertyProfile): string {
  const location =
    profile.location &&
    !/beachfront|real-diamante|las-brisas|collection|residences/i.test(profile.location)
      ? profile.location
      : "una de las zonas más exclusivas del destino";

  const p1 =
    `Ubicada en ${location}, esta propiedad integra arquitectura, amplitud y una distribución concebida para disfrutar cada espacio con absoluta comodidad. La relación entre los interiores, el entorno y la vida cotidiana crea una experiencia residencial elegante y natural.`;

  const editorial = describeEnvironment(profile);

  const p2 =
    editorial ||
    `El entorno aporta identidad a la propiedad, creando una relación natural entre la arquitectura, el paisaje y la ubicación privilegiada donde se desarrolla la experiencia residencial.`;

  const p3 =
    describeSpaces(profile);

  const p4 =
    describeAmenities(profile.factors) ||
    `Las amenidades complementan el estilo de vida, ofreciendo espacios pensados para el descanso, la convivencia y el bienestar cotidiano.`;

  const p5 =
    describeClosing(profile);

  return [p1, p2, p3, p4, p5].join("\n\n");
}






function describeEnvironment(profile: PropertyProfile): string {

  const lines:string[]=[];

  switch(profile.factors.oceanRelation){
    case "oceanfront":
      lines.push("El mar se integra de forma natural a la vida diaria, ofreciendo una relación permanente con el paisaje costero.");
      break;

    case "ocean_view":
      lines.push("Las vistas hacia el océano acompañan los principales espacios de la residencia y enriquecen cada momento del día.");
      break;

    case "beach_access":
      lines.push("La cercanía a la playa permite disfrutar un estilo de vida relajado y conectado con el entorno.");
      break;
  }

  switch(profile.factors.viewQuality){
    case "panoramic":
      lines.push("Las panorámicas abiertas aportan profundidad, amplitud y una conexión constante con el paisaje.");
      break;

    case "iconic":
      lines.push("Las vistas emblemáticas convierten al entorno en uno de los principales atributos de la propiedad.");
      break;
  }

  if(lines.length===0){
    lines.push("La ubicación ofrece un equilibrio entre privacidad, conectividad y calidad de vida.");
  }

  return lines.join(" ");
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




function describeSpaces(profile: PropertyProfile): string {

  const parts:string[]=[];

  parts.push(
    `Con ${profile.area} m² de construcción, ${profile.bedrooms} recámaras y ${profile.bathrooms} baños, la distribución privilegia áreas sociales generosas, espacios privados bien definidos y una circulación pensada para disfrutar la propiedad en cualquier momento del día.`
  );

  const architecture=profile.factors.architecture ?? [];

  if(architecture.length){

    const map:Record<string,string>={
      contemporary:"Su arquitectura contemporánea aporta líneas limpias y una relación equilibrada entre interior y exterior.",
      modern:"El lenguaje arquitectónico moderno enfatiza amplitud, iluminación y funcionalidad.",
      minimalist:"La propuesta minimalista privilegia la pureza de los espacios y la calidad de los materiales.",
      tropical:"La arquitectura tropical favorece la ventilación natural y la integración con el entorno.",
      mediterranean:"La inspiración mediterránea aporta calidez, proporción y elegancia atemporal."
    };

    for(const item of architecture){
      if(map[item]){
        parts.push(map[item]);
        break;
      }
    }

  }

  return parts.join(" ");

}


function describeClosing(profile: PropertyProfile): string {

  const ideas:string[]=[];

  if(profile.factors.privacy){
    ideas.push("la privacidad");
  }

  if(profile.factors.architecture?.length){
    ideas.push("la arquitectura");
  }

  if(profile.factors.viewQuality){
    ideas.push("el entorno");
  }

  if(profile.factors.amenities?.length){
    ideas.push("el estilo de vida");
  }

  if(ideas.length===0){
    ideas.push("su propuesta residencial");
  }

  return `Más que una propiedad, representa una oportunidad para formar parte de un entorno residencial cuidadosamente concebido, donde la arquitectura, la privacidad y la calidad de vida se integran con una visión patrimonial de largo plazo.`;
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

  return matches[0].paragraph;
}


export function generateEditorial(
  property: AdminPropertyInput
): EditorialResult {
  const profile = buildPropertyProfile(property);

  return {
    tagline: generateTagline(profile),
    editorialTagline: generateEditorialTagline(profile),
    description: generateDescription(profile),
  };
}
