import type { BrokerProperty } from "@prisma/client";

import type { EditorialResult } from "@/lib/editorial/types";

import {
  getImageForEditorialPage,
  getImagesForEditorialPage,
} from "@/lib/pdf/engine/core/image-resolver";


import type {
  EditorialPdfDocument,
} from "./EditorialPdfDocument";

export function buildEditorialPdfDocument(

  property: BrokerProperty,

  editorial: EditorialResult,

): EditorialPdfDocument {

  return {

    portada: {
      title: property.title,
      classification: "",
      subtitle: property.tagline ?? "",
      editorialQuote: editorial.portada.editorialTagline,
      collection: property.zoneLabel ?? "",
      price: property.price ?? "",
      bedrooms: property.bedrooms != null ? String(property.bedrooms) : "",
      bathrooms:
        property.bathrooms != null
          ? String(
              property.bathrooms +
              (property.halfBathrooms ? 0.5 : 0)
            )
          : "",
      area:
        property.areaInterior != null
          ? `${property.areaInterior} m²`
          : "",
      phone: "",
      luxuryScore:
        property.luxuryScore != null
          ? String(property.luxuryScore)
          : "",
      coverImage: property.coverImage,
    },

    arquitectura: {

      titulo: editorial.arquitectura.titulo,

      descripcion: editorial.arquitectura.descripcion,

      factores: editorial.arquitectura.factores.map(

        factor => ({

          titulo: factor.titulo,

          descripcion: factor.descripcion,

        })

      ),

      image: null,

    },

    espacios: {

      titulo: editorial.espacios.titulo,

      subtitulo: editorial.espacios.subtitulo,

      espacios: editorial.espacios.espacios.map(

        espacio => ({

          titulo: espacio.titulo,

          descripcion: espacio.descripcion,

        })

      ),

      fraseEditorial: editorial.espacios.fraseEditorial,

      images: getImagesForEditorialPage(
        property as any,
        "spaces",
      ),

    },

    materiales: {

      titulo: editorial.materiales.titulo,

      subtitulo: editorial.materiales.subtitulo,

      fraseEditorial: editorial.materiales.fraseEditorial,

      heroImage: getImageForEditorialPage(
        property as any,
        "materials",
      ),

      materiales: editorial.materiales.materiales.map(

        material => ({

          titulo: material.titulo,

          descripcion: material.descripcion,

          muestra: material.muestra,

        })

      ),

    },

    amenidades: {

      titulo: editorial.amenidades.titulo,

      subtitulo: editorial.amenidades.subtitulo,

      fraseEditorial: editorial.amenidades.fraseEditorial,

      amenidades: editorial.amenidades.amenidades.map(

        amenidad => ({

          titulo: amenidad.titulo,

          descripcion: amenidad.descripcion,

        })

      ),

      images: getImagesForEditorialPage(
        property as any,
        "wellness",
      ),

    },

    galeria: {

      titulo: editorial.galeria.titulo,

      subtitulo: editorial.galeria.subtitulo,

      images: getImagesForEditorialPage(
        property as any,
        "gallery",
      ),

    },

    destino: {

      titulo: editorial.destino.titulo,

      subtitulo: editorial.destino.subtitulo,

      descripcion: editorial.destino.descripcion,

      lugaresCercanos: editorial.destino.lugaresCercanos.map(

        lugar => ({

          nombre: lugar.nombre,

          tiempo: lugar.tiempo,

        })

      ),

      mapImage: null,

    },

    inversion: {

      titulo: editorial.inversion.titulo,

      descripcion: editorial.inversion.descripcion,

      beneficios: editorial.inversion.beneficios,

      fraseEditorial: editorial.inversion.fraseEditorial,

      graph: null,

    },

    cierre: {

      titulo: editorial.cierre.titulo,

      subtitulo: editorial.cierre.subtitulo,

      fraseFinal: editorial.cierre.fraseFinal,

      qr: null,

    },

  };

}
