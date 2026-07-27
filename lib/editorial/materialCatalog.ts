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
  { id:"arabescato", title:"Arabescato", category:"stone", family:"Piedra Natural", sample:"/pem-assets/materials/piedra-natural/arabescato.png", description:"Mármol de vetas dinámicas y gran riqueza visual, apreciado por aportar profundidad, sofisticación y una identidad arquitectónica contemporánea." },
  { id:"calacatta", title:"Calacatta", category:"stone", family:"Piedra Natural", sample:"/pem-assets/materials/piedra-natural/calacatta.png", description:"Mármol italiano de fondo claro y vetas marcadas que transmite elegancia, amplitud visual y un carácter atemporal." },
  { id:"cantera", title:"Cantera", category:"stone", family:"Piedra Natural", sample:"/pem-assets/materials/piedra-natural/cantera.png", description:"Piedra natural ampliamente utilizada en la arquitectura mexicana por su textura, durabilidad y capacidad para integrarse con el entorno." },
  { id:"carrara", title:"Carrara", category:"stone", family:"Piedra Natural", sample:"/pem-assets/materials/piedra-natural/carrara.png", description:"Mármol clásico de origen italiano reconocido por sus vetas suaves y tonalidades claras que aportan luminosidad y refinamiento." },
  { id:"cuarcita_blanca", title:"Cuarcita Blanca", category:"stone", family:"Piedra Natural", sample:"/pem-assets/materials/piedra-natural/cuarcita-blanca.png", description:"Piedra natural de alta resistencia con apariencia elegante, ideal para superficies que combinan desempeño y belleza natural." },
  { id:"pizarra", title:"Pizarra", category:"stone", family:"Piedra Natural", sample:"/pem-assets/materials/piedra-natural/pizarra.png", description:"Roca natural de textura distintiva que aporta contraste, profundidad y una expresión arquitectónica sobria." },
  { id:"taj_mahal", title:"Taj Mahal", category:"stone", family:"Piedra Natural", sample:"/pem-assets/materials/piedra-natural/taj-mahal.png", description:"Cuarcita natural de tonos cálidos y vetas delicadas que combina una estética refinada con excelente desempeño técnico." },
  { id:"travertino", title:"Travertino", category:"stone", family:"Piedra Natural", sample:"/pem-assets/materials/piedra-natural/travertino.png", description:"Piedra natural de tonos cálidos y vetas suaves que aporta continuidad visual, elegancia y una presencia atemporal." },

  { id:"cedro", title:"Cedro", category:"wood", family:"Madera", sample:"/pem-assets/materials/madera/cedro.png", description:"" },
  { id:"ebano", title:"Ebano", category:"wood", family:"Madera", sample:"/pem-assets/materials/madera/ebano.png", description:"" },
  { id:"encino", title:"Encino", category:"wood", family:"Madera", sample:"/pem-assets/materials/madera/encino.png", description:"" },
  { id:"nogal_americano", title:"Nogal Americano", category:"wood", family:"Madera", sample:"/pem-assets/materials/madera/nogal-americano.png", description:"" },
  { id:"parota", title:"Parota", category:"wood", family:"Madera", sample:"/pem-assets/materials/madera/parota.png", description:"" },
  { id:"roble_europeo", title:"Roble Europeo", category:"wood", family:"Madera", sample:"/pem-assets/materials/madera/roble-europeo.png", description:"" },
  { id:"teca", title:"Teca", category:"wood", family:"Madera", sample:"/pem-assets/materials/madera/teca.png", description:"" },
  { id:"tzalam", title:"Tzalam", category:"wood", family:"Madera", sample:"/pem-assets/materials/madera/tzalam.png", description:"" },

  { id:"boucle", title:"Boucle", category:"textile", family:"Textiles", sample:"/pem-assets/materials/textiles/boucle.png", description:"Tejido de textura envolvente que aporta profundidad visual, confort y una sensación contemporánea en tapicerías y mobiliario." },
  { id:"chenille", title:"Chenille", category:"textile", family:"Textiles", sample:"/pem-assets/materials/textiles/chenille.png", description:"Textil de tacto suave y excelente resistencia al uso, seleccionado por su comodidad y apariencia elegante." },
  { id:"lino", title:"Lino", category:"textile", family:"Textiles", sample:"/pem-assets/materials/textiles/lino.png", description:"Fibra natural apreciada por su frescura, textura orgánica y capacidad para generar ambientes luminosos y relajados." },
  { id:"piel", title:"Piel", category:"textile", family:"Textiles", sample:"/pem-assets/materials/textiles/piel.png", description:"Material natural de gran durabilidad que incorpora carácter, sofisticación y una agradable evolución estética con el paso del tiempo." },
  { id:"terciopelo", title:"Terciopelo", category:"textile", family:"Textiles", sample:"/pem-assets/materials/textiles/terciopelo.png", description:"Tejido de superficie aterciopelada que añade riqueza visual, confort y una presencia distinguida en los interiores." },

  { id:"acero_inoxidable_cepillado", title:"Acero Inoxidable Cepillado", category:"metal", family:"Detalles Metálicos", sample:"/pem-assets/materials/metales/acero-inoxidable-cepillado.png", description:"Acabado metálico de apariencia sobria y contemporánea que ofrece alta resistencia a la corrosión y un mantenimiento sencillo." },
  { id:"bronce_envejecido", title:"Bronce Envejecido", category:"metal", family:"Detalles Metálicos", sample:"/pem-assets/materials/metales/bronce-envejecido.png", description:"Acabado de tonalidad cálida que aporta profundidad visual, carácter y una elegancia atemporal en herrajes y detalles arquitectónicos." },
  { id:"laton_cepillado", title:"Laton Cepillado", category:"metal", family:"Detalles Metálicos", sample:"/pem-assets/materials/metales/laton-cepillado.png", description:"Metal de acabado satinado que incorpora sofisticación, calidez y un acento distintivo en los espacios." },
  { id:"negro_mate", title:"Negro Mate", category:"metal", family:"Detalles Metálicos", sample:"/pem-assets/materials/metales/negro-mate.png", description:"Acabado contemporáneo que genera contraste, definición y una estética minimalista de gran presencia visual." },
  { id:"niquel_satinado", title:"Niquel Satinado", category:"metal", family:"Detalles Metálicos", sample:"/pem-assets/materials/metales/niquel-satinado.png", description:"Acabado metálico de brillo discreto que combina resistencia, versatilidad y una imagen refinada." },

  { id:"chukum", title:"Chukum", category:"finish", family:"Acabados", sample:"/pem-assets/materials/acabados/chukum.png", description:"Acabado mineral tradicional de origen natural reconocido por su textura orgánica, tonalidades cálidas y excelente comportamiento en climas tropicales." },
  { id:"concreto_aparente", title:"Concreto Aparente", category:"finish", family:"Acabados", sample:"/pem-assets/materials/acabados/concreto-aparente.png", description:"Acabado arquitectónico que expresa honestidad estructural mediante superficies limpias, sobrias y de carácter contemporáneo." },
  { id:"estuco_mineral", title:"Estuco Mineral", category:"finish", family:"Acabados", sample:"/pem-assets/materials/acabados/estuco-mineral.png", description:"Revestimiento mineral que aporta profundidad visual, textura artesanal y una apariencia elegante de larga duración." },
  { id:"microcemento", title:"Microcemento", category:"finish", family:"Acabados", sample:"/pem-assets/materials/acabados/microcemento.png", description:"Acabado continuo de estética contemporánea que permite superficies uniformes, resistentes y de fácil mantenimiento." },
  { id:"mortero_fino", title:"Mortero Fino", category:"finish", family:"Acabados", sample:"/pem-assets/materials/acabados/mortero-fino.png", description:"Acabado de textura delicada que genera continuidad visual y una expresión arquitectónica sobria y refinada." },

  { id:"cristal_ahumado", title:"Cristal Ahumado", category:"glass", family:"Cristal", sample:"/pem-assets/materials/cristal/cristal-ahumado.png", description:"Cristal de tonalidad tenue que aporta privacidad, control lumínico y una imagen elegante y contemporánea." },
  { id:"cristal_claro", title:"Cristal Claro", category:"glass", family:"Cristal", sample:"/pem-assets/materials/cristal/cristal-claro.png", description:"Cristal de alta transparencia que favorece la entrada de luz natural y la integración visual entre los espacios." },
  { id:"cristal_estriado", title:"Cristal Estriado", category:"glass", family:"Cristal", sample:"/pem-assets/materials/cristal/cristal-estriado.png", description:"Cristal texturizado que proporciona privacidad parcial sin sacrificar iluminación natural ni ligereza visual." },
  { id:"low_iron", title:"Low Iron", category:"glass", family:"Cristal", sample:"/pem-assets/materials/cristal/low-iron.png", description:"Cristal extraclaro de mínima tonalidad verdosa que maximiza la transparencia y resalta las vistas con gran fidelidad." },

  { id:"caesarstone", title:"Caesarstone", category:"quartz", family:"Cuarzo", sample:"/pem-assets/materials/cuarzo/caesarstone.png", description:"Superficie de cuarzo de ingeniería reconocida por su durabilidad, baja porosidad y excelente comportamiento en aplicaciones de alto uso." },
  { id:"dekton", title:"Dekton", category:"quartz", family:"Cuarzo", sample:"/pem-assets/materials/cuarzo/dekton.png", description:"Superficie ultracompacta de alto desempeño, resistente al calor, rayaduras y manchas, ideal para aplicaciones arquitectónicas exigentes." },
  { id:"silestone_blanco", title:"Silestone Blanco", category:"quartz", family:"Cuarzo", sample:"/pem-assets/materials/cuarzo/silestone-blanco.png", description:"Superficie de cuarzo de acabado claro que combina resistencia, higiene y una estética luminosa y contemporánea." },
  { id:"silestone_gris", title:"Silestone Gris", category:"quartz", family:"Cuarzo", sample:"/pem-assets/materials/cuarzo/silestone-gris.png", description:"Superficie de cuarzo de tonalidad neutra que aporta versatilidad, resistencia y una imagen arquitectónica equilibrada." },

  { id:"black_galaxy", title:"Black Galaxy", category:"granite", family:"Granito", sample:"/pem-assets/materials/granito/black-galaxy.png", description:"Granito negro con destellos minerales que aporta profundidad visual, resistencia y una presencia elegante en superficies arquitectónicas." },
  { id:"negro_san_gabriel", title:"Negro San Gabriel", category:"granite", family:"Granito", sample:"/pem-assets/materials/granito/negro-san-gabriel.png", description:"Granito mexicano de color uniforme reconocido por su durabilidad, sobriedad y excelente desempeño en interiores y exteriores." },
  { id:"via_lactea", title:"Via Lactea", category:"granite", family:"Granito", sample:"/pem-assets/materials/granito/via-lactea.png", description:"Granito de fondo oscuro con vetas claras que genera un contraste natural de gran fuerza visual." },
  { id:"white_ice", title:"White Ice", category:"granite", family:"Granito", sample:"/pem-assets/materials/granito/white-ice.png", description:"Granito claro de vetas dinámicas que combina resistencia estructural con una apariencia luminosa y sofisticada." },

  { id:"luz_calida", title:"Luz Calida", category:"lighting", family:"Iluminación", sample:"/pem-assets/materials/iluminacion/luz-calida.png", description:"Temperatura de color que favorece ambientes acogedores, confortables y visualmente equilibrados en áreas habitables." },
  { id:"luz_indirecta", title:"Luz Indirecta", category:"lighting", family:"Iluminación", sample:"/pem-assets/materials/iluminacion/luz-indirecta.png", description:"Sistema de iluminación diseñado para resaltar la arquitectura mediante una distribución uniforme y sin deslumbramientos." },

];