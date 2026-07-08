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
  family: string;
  description: string;
  sample: string;
};

export const materialCatalog: PemMaterial[] = [
  { id: "travertino_veracruz", title: "Travertino Veracruz", category: "stone", family: "Piedra Natural", sample: "/pem-assets/materials/travertino-veracruz.jpg", description: "Piedra natural de tonos cálidos para pisos, muros y revestimientos arquitectónicos." },
  { id: "travertino_romano", title: "Travertino Romano", category: "stone", family: "Piedra Natural", sample: "/pem-assets/materials/travertino-romano.jpg", description: "Travertino de apariencia clásica con textura mineral y carácter atemporal." },
  { id: "calacatta_oro", title: "Calacatta Oro", category: "stone", family: "Piedra Natural", sample: "/pem-assets/materials/calacatta-oro.jpg", description: "Mármol blanco con vetas doradas, asociado con interiores de alta gama." },
  { id: "carrara", title: "Carrara", category: "stone", family: "Piedra Natural", sample: "/pem-assets/materials/carrara.jpg", description: "Mármol clásico de base clara y veta sutil para espacios elegantes." },
  { id: "taj_mahal", title: "Quartzita Taj Mahal", category: "stone", family: "Piedra Natural", sample: "/pem-assets/materials/taj-mahal.jpg", description: "Quartzita premium de tonalidad cálida y gran resistencia." },
  { id: "gris_oxford", title: "Mármol Gris Oxford", category: "stone", family: "Piedra Natural", sample: "/pem-assets/materials/gris-oxford.jpg", description: "Piedra gris elegante para baños, pisos y acentos sobrios." },
  { id: "negro_marquina", title: "Negro Marquina", category: "stone", family: "Piedra Natural", sample: "/pem-assets/materials/negro-marquina.jpg", description: "Mármol negro de alto contraste con veta blanca." },
  { id: "cantera_galarza", title: "Cantera Galarza", category: "stone", family: "Piedra Natural", sample: "/pem-assets/materials/cantera-galarza.jpg", description: "Piedra mexicana de tono claro para muros, pisos y exteriores." },
  { id: "onyx_honey", title: "Ónix Honey", category: "stone", family: "Piedra Natural", sample: "/pem-assets/materials/onyx-honey.jpg", description: "Piedra translúcida de carácter escultórico y tonos dorados." },

  { id: "nogal_americano", title: "Nogal Americano", category: "wood", family: "Madera", sample: "/pem-assets/materials/nogal-americano.jpg", description: "Carpintería noble con veta profunda y tonalidad cálida." },
  { id: "tzalam", title: "Tzalam", category: "wood", family: "Madera", sample: "/pem-assets/materials/tzalam.jpg", description: "Madera tropical de gran presencia visual, resistencia y carácter natural." },
  { id: "parota", title: "Parota", category: "wood", family: "Madera", sample: "/pem-assets/materials/parota.jpg", description: "Madera mexicana de veta marcada para piezas protagonistas." },
  { id: "encino", title: "Encino", category: "wood", family: "Madera", sample: "/pem-assets/materials/encino.jpg", description: "Madera clara y versátil para interiores contemporáneos." },
  { id: "roble_europeo", title: "Roble Europeo", category: "wood", family: "Madera", sample: "/pem-assets/materials/roble-europeo.jpg", description: "Madera elegante de textura uniforme para carpintería fina." },

  { id: "lino_natural", title: "Lino Natural", category: "textile", family: "Telas Naturales", sample: "/pem-assets/materials/lino-natural.jpg", description: "Textil orgánico de apariencia fresca, ligera y sofisticada." },
  { id: "boucle", title: "Bouclé", category: "textile", family: "Telas Naturales", sample: "/pem-assets/materials/boucle.jpg", description: "Textura suave y envolvente para interiores cálidos." },
  { id: "chenille", title: "Chenille", category: "textile", family: "Telas Naturales", sample: "/pem-assets/materials/chenille.jpg", description: "Textil residencial de tacto suave y acabado refinado." },
  { id: "piel_cognac", title: "Piel Cognac", category: "textile", family: "Telas Naturales", sample: "/pem-assets/materials/piel-cognac.jpg", description: "Piel cálida para acentos de carácter atemporal." },

  { id: "bronce_cepillado", title: "Bronce Cepillado", category: "metal", family: "Detalles Metálicos", sample: "/pem-assets/materials/bronce-cepillado.jpg", description: "Metal cálido para herrajes, grifería, luminarias y acentos decorativos." },
  { id: "laton_satinado", title: "Latón Satinado", category: "metal", family: "Detalles Metálicos", sample: "/pem-assets/materials/laton-satinado.jpg", description: "Acabado metálico elegante con brillo controlado." },
  { id: "champagne_gold", title: "Champagne Gold", category: "metal", family: "Detalles Metálicos", sample: "/pem-assets/materials/champagne-gold.jpg", description: "Tono metálico suave para detalles contemporáneos." },
  { id: "acero_inoxidable", title: "Acero Inoxidable", category: "metal", family: "Detalles Metálicos", sample: "/pem-assets/materials/acero-inoxidable.jpg", description: "Acabado durable para cocinas, baños y elementos funcionales." },

  { id: "chukum", title: "Chukum", category: "finish", family: "Acabados", sample: "/pem-assets/materials/chukum.jpg", description: "Acabado natural de inspiración yucateca, ideal para muros, baños y albercas." },
  { id: "microcemento", title: "Microcemento", category: "finish", family: "Acabados", sample: "/pem-assets/materials/microcemento.jpg", description: "Acabado continuo de estética limpia y contemporánea." },
  { id: "concreto_aparente", title: "Concreto Aparente", category: "finish", family: "Acabados", sample: "/pem-assets/materials/concreto-aparente.jpg", description: "Superficie arquitectónica sobria de carácter moderno." },
  { id: "estuco_veneciano", title: "Estuco Veneciano", category: "finish", family: "Acabados", sample: "/pem-assets/materials/estuco-veneciano.jpg", description: "Acabado artesanal de textura pulida y apariencia sofisticada." },
  { id: "mosaico_artesanal", title: "Mosaico Artesanal", category: "finish", family: "Acabados", sample: "/pem-assets/materials/mosaico-artesanal.jpg", description: "Detalle decorativo hecho a mano para acentos únicos." },

  { id: "luz_calida", title: "Iluminación Cálida", category: "lighting", family: "Iluminación", sample: "/pem-assets/materials/luz-calida.jpg", description: "Temperatura cálida para atmósferas residenciales envolventes." },
  { id: "luz_indirecta", title: "Luz Indirecta", category: "lighting", family: "Iluminación", sample: "/pem-assets/materials/luz-indirecta.jpg", description: "Iluminación arquitectónica integrada para profundidad y confort visual." },
];
