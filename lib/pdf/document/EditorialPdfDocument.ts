export interface EditorialPdfDocument {

  portada: EditorialPdfPortada;

  arquitectura: EditorialPdfArquitectura;

  espacios: EditorialPdfEspacios;

  materiales: EditorialPdfMateriales;

  amenidades: EditorialPdfAmenidades;

  galeria: EditorialPdfGaleria;

  destino: EditorialPdfDestino;

  inversion: EditorialPdfInversion;

  cierre: EditorialPdfCierre;

}

export interface EditorialPdfPortada {

  title: string;

  classification: string;

  subtitle: string;

  editorialQuote: string;

  collection: string;

  price: string;

  bedrooms: string;

  bathrooms: string;

  area: string;

  phone: string;

  luxuryScore: string;

  coverImage: string | null;

}

export interface EditorialPdfArquitectura {

  titulo: string;

  descripcion: string;

  factores: EditorialPdfFactor[];

  image: string | null;

}

export interface EditorialPdfFactor {

  titulo: string;

  descripcion: string;

}

export interface EditorialPdfEspacios {

  titulo: string;

  subtitulo: string;

  espacios: EditorialPdfEspacio[];

  fraseEditorial: string;

  images: string[];

}

export interface EditorialPdfEspacio {

  titulo: string;

  descripcion: string;

}

export interface EditorialPdfMateriales {

  titulo: string;

  subtitulo: string;

  fraseEditorial: string;

  heroImage: string | null;

  materiales: EditorialPdfMaterial[];

}

export interface EditorialPdfMaterial {

  titulo: string;

  descripcion: string;

  muestra: string;

}

export interface EditorialPdfAmenidades {

  titulo: string;

  subtitulo: string;

  fraseEditorial: string;

  amenidades: EditorialPdfAmenidad[];

  images: string[];

}

export interface EditorialPdfGaleria {

  titulo: string;

  subtitulo: string;

  images: string[];

}

export interface EditorialPdfDestino {

  titulo: string;

  subtitulo: string;

  descripcion: string;

  lugaresCercanos: EditorialPdfLugarCercano[];

  mapImage: string | null;

}

export interface EditorialPdfLugarCercano {

  nombre: string;

  tiempo: string;

}

export interface EditorialPdfInversion {

  titulo: string;

  descripcion: string;

  beneficios: string[];

  fraseEditorial: string;

  graph: string | null;

}

export interface EditorialPdfCierre {

  titulo: string;

  subtitulo: string;

  fraseFinal: string;

  qr: string | null;

}

export interface EditorialPdfAmenidad {

  titulo: string;

  descripcion: string;

}
