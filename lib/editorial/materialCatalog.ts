export type PemMaterialCategory =
  | "stone"
  | "wood"
  | "textile"
  | "metal"
  | "finish"
  | "lighting";

export type PemMaterial = {
  id: string;
  title: string;
  category: PemMaterialCategory;
  description: string;
};

export const materialCatalog: PemMaterial[] = [
  { id: "travertino", title: "Travertino", category: "stone", description: "Piedra natural de tonos cálidos para pisos, muros y detalles arquitectónicos." },
  { id: "calacatta", title: "Calacatta", category: "stone", description: "Mármol de veta expresiva asociado con interiores de alta gama." },
  { id: "carrara", title: "Carrara", category: "stone", description: "Mármol clásico de base clara y veta sutil." },
  { id: "taj_mahal", title: "Quartzita Taj Mahal", category: "stone", description: "Piedra premium de tonalidad cálida y alta resistencia." },
  { id: "gris_oxford", title: "Mármol Gris Oxford", category: "stone", description: "Piedra gris elegante para baños, pisos y acentos sobrios." },
  { id: "negro_marquina", title: "Negro Marquina", category: "stone", description: "Mármol negro de alto contraste con veta blanca." },
  { id: "cantera", title: "Cantera", category: "stone", description: "Piedra natural mexicana para muros, pisos y exteriores." },
  { id: "onyx_honey", title: "Ónix Honey", category: "stone", description: "Piedra translúcida de carácter escultórico y tonos dorados." },

  { id: "nogal", title: "Nogal", category: "wood", description: "Carpintería noble con veta profunda y tono cálido." },
  { id: "tzalam", title: "Tzalam", category: "wood", description: "Madera tropical de gran presencia visual y resistencia." },
  { id: "encino", title: "Encino", category: "wood", description: "Madera clara y versátil para interiores contemporáneos." },
  { id: "parota", title: "Parota", category: "wood", description: "Madera mexicana de veta marcada para piezas protagonistas." },
  { id: "roble", title: "Roble Europeo", category: "wood", description: "Madera elegante de textura uniforme para carpintería fina." },

  { id: "lino", title: "Lino Natural", category: "textile", description: "Textil orgánico de apariencia fresca y sofisticada." },
  { id: "boucle", title: "Bouclé", category: "textile", description: "Textura suave y envolvente para interiores cálidos." },
  { id: "chenille", title: "Chenille", category: "textile", description: "Textil residencial de tacto suave y acabado refinado." },
  { id: "piel_cognac", title: "Piel Cognac", category: "textile", description: "Piel cálida para acentos de carácter atemporal." },

  { id: "bronce_cepillado", title: "Bronce Cepillado", category: "metal", description: "Metal cálido para herrajes, grifería y acentos decorativos." },
  { id: "laton_satinado", title: "Latón Satinado", category: "metal", description: "Acabado metálico elegante con brillo controlado." },
  { id: "champagne", title: "Champagne Gold", category: "metal", description: "Tono metálico suave para detalles contemporáneos." },
  { id: "acero_inoxidable", title: "Acero Inoxidable", category: "metal", description: "Acabado durable para cocinas, baños y elementos funcionales." },

  { id: "microcemento", title: "Microcemento", category: "finish", description: "Acabado continuo de estética limpia y contemporánea." },
  { id: "concreto_aparente", title: "Concreto Aparente", category: "finish", description: "Superficie arquitectónica sobria de carácter moderno." },
  { id: "estuco_veneciano", title: "Estuco Veneciano", category: "finish", description: "Acabado artesanal de textura pulida y apariencia sofisticada." },
  { id: "mosaico_artesanal", title: "Mosaico Artesanal", category: "finish", description: "Detalle decorativo hecho a mano para acentos únicos." },
  { id: "chukum", title: "Chukum", category: "finish", description: "Acabado natural de inspiración yucateca, ideal para muros, baños y albercas." },

  { id: "luz_calida", title: "Iluminación Cálida", category: "lighting", description: "Temperatura cálida para atmósferas residenciales envolventes." },
  { id: "luz_indirecta", title: "Luz Indirecta", category: "lighting", description: "Iluminación arquitectónica integrada para profundidad y confort visual." },
];
