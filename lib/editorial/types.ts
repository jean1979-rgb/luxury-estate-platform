export interface EditorialResult {
  portada: EditorialPortada;
  arquitectura: EditorialArquitectura;
  espacios: EditorialEspacios;
  materiales: EditorialMateriales;
  amenidades: EditorialAmenidades;
  galeria: EditorialGaleria;
  destino: EditorialDestino;
  inversion: EditorialInversion;
  cierre: EditorialCierre;
}

export interface EditorialPortada {
  tagline: string;
  editorialTagline: string;
}

export interface EditorialArquitectura {
  titulo: string;
  descripcion: string;
  factores: EditorialFactor[];
}

export interface EditorialFactor {
  titulo: string;
  descripcion: string;
}

export interface EditorialEspacios {
  titulo: string;
  subtitulo: string;
  espacios: EditorialEspacio[];
  fraseEditorial: string;
}

export interface EditorialEspacio {
  titulo: string;
  descripcion: string;
}

export interface EditorialMateriales {
  titulo: string;
  subtitulo: string;
  materiales: EditorialMaterial[];
  fraseEditorial: string;
}

export interface EditorialMaterial {
  titulo: string;
  descripcion: string;
  muestra: string;
}

export interface EditorialAmenidades {
  titulo: string;
  subtitulo: string;
  amenidades: EditorialAmenidad[];
  fraseEditorial: string;
}

export interface EditorialAmenidad {
  titulo: string;
  descripcion: string;
}

export interface EditorialGaleria {
  titulo: string;
  subtitulo: string;
}

export interface EditorialDestino {
  titulo: string;
  subtitulo: string;
  descripcion: string;
  lugaresCercanos: EditorialLugarCercano[];
}

export interface EditorialLugarCercano {
  nombre: string;
  tiempo: string;
}

export interface EditorialInversion {
  titulo: string;
  descripcion: string;
  beneficios: string[];
  fraseEditorial: string;
}

export interface EditorialCierre {
  titulo: string;
  subtitulo: string;
  fraseFinal: string;
}
