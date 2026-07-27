import type { AdminPropertyInput } from "@/types/admin";
import { EDITORIAL_CATALOG } from "./editorialCatalog";
import { amenityEditorialCatalog } from "./amenityEditorialCatalog";
import type {
  EditorialAmenidades,
  EditorialArquitectura,
  EditorialCierre,
  EditorialDestino,
  EditorialEspacios,
  EditorialGaleria,
  EditorialInversion,
  EditorialMateriales,
  EditorialResult,
} from "./types";


import type { AdminPemFactors } from "@/types/admin";
import { editorialPhrases } from "./editorialPhrases";
import { materialCatalog } from "./materialCatalog";
import {
  labelPemFactor,
  descriptionPemFactor,
} from "./pemFactorCatalog";

type PropertyProfile = {
  type: string;
  location: string;
  bedrooms: number;
  bathrooms: number;
  area: string;
  factors: AdminPemFactors;
  materials: string[];
};

function buildPropertyProfile(property: AdminPropertyInput): PropertyProfile {
  return {
    type: property.propertyType,
    location: property.zoneLabel || property.location,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    area: property.areaInterior || property.areaTotal,
    factors: property.pemFactors ?? {},
    materials: property.materials ?? [],
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









function describeEnvironment(
  profile: PropertyProfile
): EditorialArquitectura {
  const lines: string[] = [];

  switch (profile.factors.oceanRelation) {
    case "oceanfront":
      lines.push(
        "El mar se integra de forma natural a la vida diaria, ofreciendo una relación permanente con el paisaje costero."
      );
      break;

    case "ocean_view":
      lines.push(
        "Las vistas hacia el océano acompañan los principales espacios de la residencia y enriquecen cada momento del día."
      );
      break;

    case "beach_access":
      lines.push(
        "La cercanía a la playa permite disfrutar un estilo de vida relajado y conectado con el entorno."
      );
      break;
  }

  switch (profile.factors.viewQuality) {
    case "panoramic":
      lines.push(
        "Las panorámicas abiertas aportan profundidad, amplitud y una conexión constante con el paisaje."
      );
      break;

    case "iconic":
      lines.push(
        "Las vistas emblemáticas convierten al entorno en uno de los principales atributos de la propiedad."
      );
      break;
  }

  if (lines.length === 0) {
    lines.push(
      "La ubicación ofrece un equilibrio entre privacidad, conectividad y calidad de vida."
    );
  }

  return {
    titulo: "Arquitectura y entorno",
    descripcion: lines.join(" "),
    factores: [],
  };
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







function describeMaterialFamily(family: string): string {

  switch (family) {

    case "Piedra Natural":
      return "Seleccionada por su carácter atemporal, profundidad visual y resistencia, aporta una presencia arquitectónica sólida en cada espacio.";

    case "Madera":
      return "La calidez y riqueza natural de la madera equilibran la arquitectura contemporánea con una sensación de confort permanente.";

    case "Textiles":
      return "Los textiles complementan los interiores mediante textura, confort y una estética cuidadosamente integrada al proyecto.";

    case "Detalles Metálicos":
      return "Los acabados metálicos incorporan precisión, durabilidad y un lenguaje contemporáneo en los detalles constructivos.";

    case "Acabados":
      return "Los acabados fueron elegidos para generar continuidad visual, fácil mantenimiento y una apariencia refinada.";

    case "Cristal":
      return "El cristal favorece la entrada de luz natural, la amplitud visual y la integración entre interiores y exteriores.";

    case "Cuarzo":
      return "El cuarzo combina elevada resistencia con una apariencia uniforme, ideal para superficies de uso cotidiano.";

    case "Granito":
      return "El granito aporta resistencia estructural, durabilidad y una estética natural de gran presencia.";

    case "Iluminación":
      return "La estrategia de iluminación contribuye a resaltar materiales, volúmenes y atmósferas durante todo el día.";

    default:
      return "Material seleccionado por su calidad, durabilidad y aportación estética dentro del proyecto.";

  }

}


function buildEditorialMateriales(
  profile: PropertyProfile
): EditorialMateriales {

  const materiales = profile.materials
    .map(id => materialCatalog.find(item => item.id === id))
    .filter((item): item is typeof materialCatalog[number] => Boolean(item))
    .map(item => ({
      titulo: item.title,
      descripcion:
        item.description ||
        describeMaterialFamily(item.family),
      muestra: item.sample,
    }));

  return {
    titulo: "Materiales",
    subtitulo: "Selección de acabados",
    materiales,
    fraseEditorial:
      materiales.length > 0
        ? "La selección de materiales privilegia calidad, permanencia y coherencia estética."
        : "",
  };

}

function describeSpaces(
  profile: PropertyProfile
): EditorialEspacios {
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

  return {
    titulo: "Espacios",
    subtitulo: "Distribución y funcionalidad",
    espacios: [
      {
        titulo: "Distribución",
        descripcion: parts.join(" "),
      },
    ],
    fraseEditorial: "",
  };

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

if (profile.factors.amenities?.length) {
  ideas.push("el estilo de vida");
}

if (ideas.length === 0) {
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



function buildEditorialAmenities(
  profile: PropertyProfile
): EditorialAmenidades {

  const amenities = profile.factors.amenities ?? [];

  return {
    titulo: "Amenidades",
    subtitulo: "Espacios complementarios",
    amenidades: amenities.map((name: string) => ({
      titulo: labelPemFactor(name, "amenities"),
      descripcion: descriptionPemFactor(name, "amenities"),
    })),
    fraseEditorial: describeAmenities(profile.factors),
  };

}



function buildEditorialDestino(
  profile: PropertyProfile
): EditorialDestino {

  return {
    titulo: profile.location,
    subtitulo: "Entorno y ubicación",
    descripcion: `La propiedad se encuentra en ${profile.location}, un entorno que aporta identidad, conectividad y valor residencial.`,
    lugaresCercanos: [],
  };

}



function buildEditorialInversion(
  profile: PropertyProfile
): EditorialInversion {

  return {
    titulo: "Valor patrimonial",
    descripcion:
      "La combinación de ubicación, atributos arquitectónicos y calidad residencial fortalece el valor patrimonial de esta propiedad.",
    beneficios: [
      "Ubicación consolidada",
      "Calidad arquitectónica",
      "Valor patrimonial",
    ],
    fraseEditorial:
      "Una propiedad concebida para preservar su atractivo y permanencia en el tiempo.",
  };

}



function buildEditorialCierre(
  profile: PropertyProfile
): EditorialCierre {

  return {
    titulo: "Una residencia para disfrutar",
    subtitulo: profile.location,
    fraseFinal:
      `La combinación de arquitectura, ubicación y calidad constructiva convierte esta propiedad en una oportunidad excepcional dentro de ${profile.location}.`,
  };

}


export function generateEditorial(
  property: AdminPropertyInput
): EditorialResult {
  const profile = buildPropertyProfile(property);

return {
  portada: {
    tagline: generateTagline(profile),
    editorialTagline: generateEditorialTagline(profile),
  },

arquitectura: describeEnvironment(profile),
  espacios: describeSpaces(profile),

  materiales: buildEditorialMateriales(profile),

  amenidades: buildEditorialAmenities(profile),

  galeria: {} as EditorialGaleria,

  destino: buildEditorialDestino(profile),

  inversion: buildEditorialInversion(profile),

  cierre: buildEditorialCierre(profile),
};
}
