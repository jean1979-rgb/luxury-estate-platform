export type PemMaterialCategory =
  | "stone"
  | "wood"
  | "textile"
  | "metal"
  | "finish"
  | "lighting"
  | "glass"
  | "quartz"
  | "granite";

export type PemMaterial = {
  id: string;
  title: string;
  category: PemMaterialCategory;
  family: string;
  description: string;
  sample: string;
};

export const materialCatalog: PemMaterial[] = [
  { id:"travertino", title:"Travertino", category:"stone", family:"Piedra Natural", sample:"/pem-assets/materials/piedra-natural/travertino.png", description:"Piedra natural para interiores y exteriores." },
  { id:"calacatta", title:"Calacatta", category:"stone", family:"Piedra Natural", sample:"/pem-assets/materials/piedra-natural/calacatta.png", description:"Mármol de alta gama con vetas elegantes." },
  { id:"carrara", title:"Carrara", category:"stone", family:"Piedra Natural", sample:"/pem-assets/materials/piedra-natural/carrara.png", description:"Mármol clásico de tonalidad clara." },
  { id:"arabescato", title:"Arabescato", category:"stone", family:"Piedra Natural", sample:"/pem-assets/materials/piedra-natural/arabescato.png", description:"Piedra natural con veta decorativa." },
  { id:"taj_mahal", title:"Taj Mahal", category:"stone", family:"Piedra Natural", sample:"/pem-assets/materials/piedra-natural/taj-mahal.png", description:"Cuarcita premium de tonos cálidos." },
  { id:"cuarcita_blanca", title:"Cuarcita Blanca", category:"stone", family:"Piedra Natural", sample:"/pem-assets/materials/piedra-natural/cuarcita-blanca.png", description:"Piedra natural de apariencia luminosa." },
  { id:"cantera", title:"Cantera", category:"stone", family:"Piedra Natural", sample:"/pem-assets/materials/piedra-natural/cantera.png", description:"Piedra mexicana para arquitectura." },
  { id:"pizarra", title:"Pizarra", category:"stone", family:"Piedra Natural", sample:"/pem-assets/materials/piedra-natural/pizarra.png", description:"Piedra oscura de textura natural." },

  { id:"nogal_americano", title:"Nogal Americano", category:"wood", family:"Madera", sample:"/pem-assets/materials/madera/nogal-americano.png", description:"Madera noble de tonalidad cálida." },
  { id:"tzalam", title:"Tzalam", category:"wood", family:"Madera", sample:"/pem-assets/materials/madera/tzalam.png", description:"Madera tropical resistente." },
  { id:"parota", title:"Parota", category:"wood", family:"Madera", sample:"/pem-assets/materials/madera/parota.png", description:"Madera mexicana de gran presencia." },
  { id:"encino", title:"Encino", category:"wood", family:"Madera", sample:"/pem-assets/materials/madera/encino.png", description:"Madera clara contemporánea." },
  { id:"roble_europeo", title:"Roble Europeo", category:"wood", family:"Madera", sample:"/pem-assets/materials/madera/roble-europeo.png", description:"Madera elegante para carpintería fina." },
  { id:"cedro", title:"Cedro", category:"wood", family:"Madera", sample:"/pem-assets/materials/madera/cedro.png", description:"Madera aromática de acabado cálido." },
  { id:"teca", title:"Teca", category:"wood", family:"Madera", sample:"/pem-assets/materials/madera/teca.png", description:"Madera resistente para exteriores." },
  { id:"ebano", title:"Ébano", category:"wood", family:"Madera", sample:"/pem-assets/materials/madera/ebano.png", description:"Madera oscura de carácter premium." },

  { id:"boucle", title:"Bouclé", category:"textile", family:"Textiles", sample:"/pem-assets/materials/textiles/boucle.png", description:"Textil de textura suave." },
  { id:"chenille", title:"Chenille", category:"textile", family:"Textiles", sample:"/pem-assets/materials/textiles/chenille.png", description:"Textil residencial sofisticado." },
  { id:"lino", title:"Lino", category:"textile", family:"Textiles", sample:"/pem-assets/materials/textiles/lino.png", description:"Fibra natural ligera." },
  { id:"piel", title:"Piel", category:"textile", family:"Textiles", sample:"/pem-assets/materials/textiles/piel.png", description:"Acabado cálido y atemporal." },
  { id:"terciopelo", title:"Terciopelo", category:"textile", family:"Textiles", sample:"/pem-assets/materials/textiles/terciopelo.png", description:"Textura profunda para interiores." },

  { id:"microcemento", title:"Microcemento", category:"finish", family:"Acabados", sample:"/pem-assets/materials/acabados/microcemento.png", description:"Acabado continuo contemporáneo." },
  { id:"concreto_aparente", title:"Concreto Aparente", category:"finish", family:"Acabados", sample:"/pem-assets/materials/acabados/concreto-aparente.png", description:"Superficie arquitectónica moderna." },
  { id:"chukum", title:"Chukum", category:"finish", family:"Acabados", sample:"/pem-assets/materials/acabados/chukum.png", description:"Acabado natural mexicano." },

  { id:"luz_calida", title:"Iluminación Cálida", category:"lighting", family:"Iluminación", sample:"/pem-assets/materials/iluminacion/luz-calida.png", description:"Luz ambiental residencial." },
  { id:"luz_indirecta", title:"Luz Indirecta", category:"lighting", family:"Iluminación", sample:"/pem-assets/materials/iluminacion/luz-indirecta.png", description:"Iluminación arquitectónica." },
];
