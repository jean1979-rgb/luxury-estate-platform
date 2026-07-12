export type PemFactorGroup =
  | "viewQuality"
  | "privacy"
  | "oceanRelation"
  | "pemClassification"
  | "experience"
  | "amenities"
  | "architecture";

export type PemFactorDefinition = {
  id: string;
  label: string;
  shortLabel: string;
  group: PemFactorGroup;
  icon?: string;
  description: string;
  priority: number;
};

export const pemFactorCatalog: PemFactorDefinition[] = [
  // =========================================================
  // CALIDAD DE VISTA
  // =========================================================
  {
    id: "partial",
    label: "Vista parcial",
    shortLabel: "Vista parcial",
    group: "viewQuality",
    icon: "/pem-assets/icons/vistas/vista-parcial.svg",
    description:
      "La propiedad ofrece visuales parciales hacia su entorno inmediato.",
    priority: 40,
  },
  {
    id: "open",
    label: "Vista abierta",
    shortLabel: "Vista abierta",
    group: "viewQuality",
    icon: "/pem-assets/icons/vistas/vista-abierta.svg",
    description:
      "La orientación permite visuales amplias y una sensación de mayor apertura.",
    priority: 60,
  },
  {
    id: "panoramic",
    label: "Vista panorámica",
    shortLabel: "Vista panorámica",
    group: "viewQuality",
    icon: "/pem-assets/icons/vistas/vista-panoramica.svg",
    description:
      "La residencia disfruta una perspectiva panorámica de gran amplitud.",
    priority: 80,
  },
  {
    id: "iconic",
    label: "Vista icónica",
    shortLabel: "Vista icónica",
    group: "viewQuality",
    icon: "/pem-assets/icons/vistas/vista-iconica.svg",
    description:
      "La propiedad ofrece una visual excepcional que define su experiencia residencial.",
    priority: 100,
  },

  // =========================================================
  // PRIVACIDAD
  // =========================================================
  {
    id: "medium",
    label: "Privacidad media",
    shortLabel: "Privacidad media",
    group: "privacy",
    description:
      "La propiedad mantiene un nivel funcional de privacidad residencial.",
    priority: 40,
  },
  {
    id: "high",
    label: "Privacidad alta",
    shortLabel: "Privacidad alta",
    group: "privacy",
    description:
      "La implantación y distribución ofrecen un nivel elevado de privacidad.",
    priority: 65,
  },
  {
    id: "very_high",
    label: "Privacidad muy alta",
    shortLabel: "Privacidad muy alta",
    group: "privacy",
    description:
      "La residencia ofrece una experiencia altamente privada y protegida.",
    priority: 85,
  },
  {
    id: "estate",
    label: "Privacidad estate-level",
    shortLabel: "Privacidad estate-level",
    group: "privacy",
    description:
      "La propiedad alcanza un estándar excepcional de privacidad y control de acceso.",
    priority: 100,
  },

  // =========================================================
  // RELACIÓN CON EL MAR
  // =========================================================
  {
    id: "none",
    label: "Sin relación directa con el mar",
    shortLabel: "Sin relación directa",
    group: "oceanRelation",
    description:
      "La propiedad no mantiene una relación visual o física directa con el mar.",
    priority: 10,
  },
  {
    id: "near_ocean",
    label: "Cercano al mar",
    shortLabel: "Cercano al mar",
    group: "oceanRelation",
    icon: "/pem-assets/icons/relacion-mar/cercano-al-mar.svg",
    description:
      "La residencia se encuentra a corta distancia del litoral.",
    priority: 45,
  },
  {
    id: "ocean_view",
    label: "Vista al mar",
    shortLabel: "Vista al mar",
    group: "oceanRelation",
    icon: "/pem-assets/icons/relacion-mar/vista-al-mar.svg",
    description:
      "La propiedad incorpora visuales hacia el océano desde uno o varios espacios.",
    priority: 70,
  },
  {
    id: "oceanfront",
    label: "Frente al mar",
    shortLabel: "Frente al mar",
    group: "oceanRelation",
    icon: "/pem-assets/icons/relacion-mar/frente-al-mar.svg",
    description:
      "La residencia se ubica directamente frente al litoral.",
    priority: 90,
  },
  {
    id: "beach_access",
    label: "Acceso directo a playa",
    shortLabel: "Acceso directo a playa",
    group: "oceanRelation",
    icon: "/pem-assets/icons/relacion-mar/acceso-directo-playa.svg",
    description:
      "La propiedad o el desarrollo ofrecen acceso directo a la playa.",
    priority: 100,
  },

  // =========================================================
  // CLASIFICACIÓN PEM
  // =========================================================
  {
    id: "selection",
    label: "Selección PEM",
    shortLabel: "Selección PEM",
    group: "pemClassification",
    description:
      "Residencia incorporada a la curaduría editorial de Private Estates México.",
    priority: 60,
  },
  {
    id: "signature",
    label: "Residencia Signature",
    shortLabel: "Signature",
    group: "pemClassification",
    description:
      "Propiedad distinguida por su diseño, ubicación y experiencia residencial.",
    priority: 85,
  },
  {
    id: "iconic",
    label: "Residencia Iconic",
    shortLabel: "Iconic",
    group: "pemClassification",
    description:
      "Residencia excepcional con atributos irrepetibles dentro de su mercado.",
    priority: 100,
  },

  // =========================================================
  // EXPERIENCIA
  // =========================================================
  {
    id: "resort",
    label: "Lifestyle resort",
    shortLabel: "Lifestyle resort",
    group: "experience",
    icon: "/pem-assets/icons/experiencia/lifestyle-resort.svg",
    description:
      "Una experiencia residencial inspirada en la comodidad y servicios de un resort.",
    priority: 75,
  },
  {
    id: "family",
    label: "Family retreat",
    shortLabel: "Family retreat",
    group: "experience",
    icon: "/pem-assets/icons/experiencia/family-retreat.svg",
    description:
      "Espacios concebidos para la convivencia, el descanso y la vida familiar.",
    priority: 70,
  },
  {
    id: "wellness",
    label: "Wellness",
    shortLabel: "Wellness",
    group: "experience",
    icon: "/pem-assets/icons/experiencia/wellness.svg",
    description:
      "Una propuesta residencial orientada al bienestar, descanso y equilibrio.",
    priority: 75,
  },
  {
    id: "entertainment",
    label: "Entretenimiento",
    shortLabel: "Entretenimiento",
    group: "experience",
    icon: "/pem-assets/icons/experiencia/entretenimiento.svg",
    description:
      "La propiedad integra espacios y amenidades pensados para recibir y convivir.",
    priority: 65,
  },
  {
    id: "investment",
    label: "Inversión patrimonial",
    shortLabel: "Inversión patrimonial",
    group: "experience",
    icon: "/pem-assets/icons/experiencia/inversion-patrimonial.svg",
    description:
      "Una propiedad con atributos relevantes para la conservación y crecimiento patrimonial.",
    priority: 80,
  },
  {
    id: "second_home",
    label: "Segunda residencia",
    shortLabel: "Segunda residencia",
    group: "experience",
    icon: "/pem-assets/icons/experiencia/segunda-residencia.svg",
    description:
      "Una residencia diseñada para temporadas de descanso y estancias prolongadas.",
    priority: 60,
  },
  {
    id: "primary_home",
    label: "Residencia permanente",
    shortLabel: "Residencia permanente",
    group: "experience",
    icon: "/pem-assets/icons/experiencia/residencia-permanente.svg",
    description:
      "La distribución y servicios permiten una experiencia residencial permanente.",
    priority: 65,
  },

  // =========================================================
  // AMENIDADES
  // =========================================================
  {
    id: "beach_club",
    label: "Club de playa",
    shortLabel: "Club de playa",
    group: "amenities",
    icon: "/pem-assets/icons/amenidades/club-de-playa.svg",
    description:
      "Acceso a instalaciones de playa para residentes y propietarios.",
    priority: 90,
  },
  {
    id: "spa",
    label: "Spa",
    shortLabel: "Spa",
    group: "amenities",
    icon: "/pem-assets/icons/amenidades/spa.svg",
    description:
      "Instalaciones destinadas al descanso, bienestar y tratamientos personales.",
    priority: 75,
  },
  {
    id: "gym",
    label: "Gimnasio",
    shortLabel: "Gimnasio",
    group: "amenities",
    icon: "/pem-assets/icons/amenidades/gimnasio.svg",
    description:
      "Área equipada para entrenamiento físico y acondicionamiento.",
    priority: 70,
  },
  {
    id: "padel",
    label: "Pádel",
    shortLabel: "Pádel",
    group: "amenities",
    icon: "/pem-assets/icons/amenidades/padel.svg",
    description:
      "Cancha de pádel disponible dentro del desarrollo residencial.",
    priority: 65,
  },
  {
    id: "tennis",
    label: "Tenis",
    shortLabel: "Tenis",
    group: "amenities",
    icon: "/pem-assets/icons/amenidades/tenis.svg",
    description:
      "Cancha de tenis disponible para residentes.",
    priority: 60,
  },
  {
    id: "marina",
    label: "Marina",
    shortLabel: "Marina",
    group: "amenities",
    icon: "/pem-assets/icons/amenidades/marina.svg",
    description:
      "Acceso o proximidad inmediata a instalaciones de marina.",
    priority: 85,
  },
  {
    id: "private_pool",
    label: "Alberca privada",
    shortLabel: "Alberca privada",
    group: "amenities",
    icon: "/pem-assets/icons/amenidades/alberca-privada.svg",
    description:
      "Alberca de uso exclusivo integrada a la residencia.",
    priority: 90,
  },
  {
    id: "roof_garden",
    label: "Roof garden",
    shortLabel: "Roof garden",
    group: "amenities",
    icon: "/pem-assets/icons/amenidades/roof-garden.svg",
    description:
      "Terraza superior acondicionada para convivencia y disfrute exterior.",
    priority: 70,
  },
  {
    id: "dock",
    label: "Muelle",
    shortLabel: "Muelle",
    group: "amenities",
    icon: "/pem-assets/icons/amenidades/muelle.svg",
    description:
      "Infraestructura de acceso acuático para embarcaciones.",
    priority: 85,
  },
  {
    id: "helipad",
    label: "Helipuerto",
    shortLabel: "Helipuerto",
    group: "amenities",
    icon: "/pem-assets/icons/amenidades/helipuerto.svg",
    description:
      "Área habilitada para operaciones de llegada y salida en helicóptero.",
    priority: 95,
  },

  // Preparados para agregarlos al Admin.
  {
    id: "condo_pool",
    label: "Alberca del condominio",
    shortLabel: "Alberca del condominio",
    group: "amenities",
    icon: "/pem-assets/icons/amenidades/alberca-condominio.svg",
    description:
      "Alberca de uso común para residentes y propietarios.",
    priority: 65,
  },
  {
    id: "playroom",
    label: "Ludoteca",
    shortLabel: "Ludoteca",
    group: "amenities",
    icon: "/pem-assets/icons/amenidades/ludoteca.svg",
    description:
      "Espacio infantil diseñado para juego, convivencia y actividades recreativas.",
    priority: 55,
  },

  // =========================================================
  // ARQUITECTURA
  // =========================================================
  {
    id: "contemporary",
    label: "Arquitectura contemporánea",
    shortLabel: "Diseño contemporáneo",
    group: "architecture",
    icon: "/pem-assets/icons/arquitectura/arquitectura-contemporanea.svg",
    description:
      "Líneas limpias, proporciones actuales y una estética residencial contemporánea.",
    priority: 75,
  },
  {
    id: "author_design",
    label: "Arquitectura de autor",
    shortLabel: "Arquitectura de autor",
    group: "architecture",
    icon: "/pem-assets/icons/arquitectura/arquitectura-de-autor.svg",
    description:
      "Una propuesta arquitectónica con lenguaje propio y criterios de diseño definidos.",
    priority: 90,
  },
  {
    id: "curated_interiors",
    label: "Diseño interior curado",
    shortLabel: "Interiores curados",
    group: "architecture",
    icon: "/pem-assets/icons/arquitectura/diseno-interior-curado.svg",
    description:
      "Los interiores presentan una selección coherente de mobiliario, materiales y proporciones.",
    priority: 80,
  },
  {
    id: "double_height",
    label: "Doble altura",
    shortLabel: "Doble altura",
    group: "architecture",
    icon: "/pem-assets/icons/arquitectura/doble-altura.svg",
    description:
      "Los espacios de doble altura incrementan la amplitud visual y la entrada de luz.",
    priority: 85,
  },
  {
    id: "natural_stone",
    label: "Piedra / mármol natural",
    shortLabel: "Piedra natural",
    group: "architecture",
    icon: "/pem-assets/icons/materiales/piedra-natural.svg",
    description:
      "La propiedad incorpora piedra o mármol natural en sus acabados arquitectónicos.",
    priority: 75,
  },
  {
    id: "luxury_millwork",
    label: "Carpintería de lujo",
    shortLabel: "Carpintería de lujo",
    group: "architecture",
    icon: "/pem-assets/icons/arquitectura/carpinteria-de-lujo.svg",
    description:
      "La carpintería presenta materiales, proporciones y ejecución de alto nivel.",
    priority: 80,
  },
  {
    id: "floor_to_ceiling",
    label: "Ventanales piso-techo",
    shortLabel: "Ventanales piso-techo",
    group: "architecture",
    icon: "/pem-assets/icons/arquitectura/ventanales-piso-techo.svg",
    description:
      "Los ventanales de gran formato favorecen la iluminación y la relación con el entorno.",
    priority: 85,
  },
  {
    id: "premium_materials",
    label: "Materiales premium",
    shortLabel: "Materiales premium",
    group: "architecture",
    icon: "/pem-assets/icons/arquitectura/materiales-premium.svg",
    description:
      "La residencia incorpora materiales seleccionados por su calidad, durabilidad y presencia.",
    priority: 80,
  },
];

const catalogById = new Map<string, PemFactorDefinition>();

for (const factor of pemFactorCatalog) {
  // Algunos IDs existen en grupos distintos, como "iconic".
  // El catálogo general conserva la primera coincidencia.
  if (!catalogById.has(factor.id)) {
    catalogById.set(factor.id, factor);
  }
}

export function getPemFactor(
  id: unknown,
  group?: PemFactorGroup
): PemFactorDefinition | undefined {
  const normalizedId = String(id || "").trim();

  if (!normalizedId) return undefined;

  if (group) {
    return pemFactorCatalog.find(
      (factor) => factor.id === normalizedId && factor.group === group
    );
  }

  return catalogById.get(normalizedId);
}

export function getPemFactorsByGroup(
  group: PemFactorGroup
): PemFactorDefinition[] {
  return pemFactorCatalog
    .filter((factor) => factor.group === group)
    .sort((a, b) => b.priority - a.priority);
}

export function labelPemFactor(
  id: unknown,
  group?: PemFactorGroup
): string {
  const normalizedId = String(id || "").trim();

  if (!normalizedId) return "";

  return getPemFactor(normalizedId, group)?.label || normalizedId;
}

export function iconPemFactor(
  id: unknown,
  group?: PemFactorGroup
): string | undefined {
  return getPemFactor(id, group)?.icon;
}

export function descriptionPemFactor(
  id: unknown,
  group?: PemFactorGroup
): string {
  return getPemFactor(id, group)?.description || "";
}
