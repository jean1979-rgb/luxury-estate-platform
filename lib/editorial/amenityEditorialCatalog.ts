export type AmenityEditorialCategory =
  | "wellness"
  | "resort"
  | "nautical"
  | "sports"
  | "family"
  | "entertainment";

export type AmenityEditorial = {
  category: AmenityEditorialCategory;
  amenities: string[];
  paragraphs: string[];
};

export const amenityEditorialCatalog: AmenityEditorial[] = [

{
  category: "wellness",
  amenities: [
    "spa",
    "gym",
    "private_pool"
  ],
  paragraphs: [
      "La propuesta residencial se complementa con espacios orientados al bienestar y al descanso. Amenidades como el spa, el gimnasio y las áreas de recreación permiten disfrutar un estilo de vida equilibrado, donde cada jornada puede combinar confort, privacidad y actividades pensadas para el cuidado personal.",

      "Las amenidades dedicadas al bienestar enriquecen la experiencia residencial con espacios diseñados para relajarse, mantenerse activo y disfrutar el tiempo libre. El equilibrio entre confort y funcionalidad convierte cada día en una experiencia más placentera.",

      "El desarrollo incorpora instalaciones concebidas para favorecer el descanso, la actividad física y el bienestar personal. Cada espacio ha sido pensado para complementar la vida cotidiana con experiencias que elevan la calidad de vida.",

      "Más allá de la residencia, el conjunto ofrece áreas enfocadas en el bienestar integral. Espacios para ejercitarse, relajarse y disfrutar momentos de tranquilidad forman parte natural del estilo de vida que propone esta propiedad.",

      "La presencia de amenidades orientadas al bienestar permite disfrutar una experiencia residencial completa, donde el confort, la privacidad y el cuidado personal encuentran un equilibrio natural dentro del desarrollo."
    ]
},

{
  category: "resort",
  amenities: [
    "beach_club",
    "condo_pool"
  ],
  paragraphs: [
    "El desarrollo ofrece amenidades que evocan la experiencia de un resort privado. Las áreas comunes, los espacios recreativos y las instalaciones de descanso permiten disfrutar un estilo de vida donde el confort y la convivencia forman parte de la experiencia cotidiana."
    ]
},

{
  category: "nautical",
  amenities: [
    "marina",
    "dock"
  ],
  paragraphs: [
    "La cercanía con la marina y las instalaciones náuticas convierten a la residencia en una excelente opción para quienes disfrutan la navegación y la vida frente al mar. Cada espacio complementa un estilo de vida profundamente ligado al entorno costero."
    ]
},

{
  category: "sports",
  amenities: [
    "padel",
    "tennis"
  ],
  paragraphs: [
    "Las instalaciones deportivas complementan la experiencia residencial con espacios pensados para mantener un estilo de vida activo. La integración de canchas y áreas recreativas favorece tanto la actividad física como la convivencia cotidiana."
    ]
}

];
