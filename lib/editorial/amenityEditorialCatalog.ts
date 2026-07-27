export type AmenityEditorialCategory =
  | "wellness"
  | "resort"
  | "nautical"
  | "sports"
  | "family"
  | "entertainment"
  | "business"
  | "rooftop"
  | "security"
  | "golf"
  | "pet"
  | "beach";

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
},


{
  category: "business",
  amenities: [
    "business_center",
    "cowork",
    "meeting_room"
  ],
  paragraphs: [
    "Los espacios de trabajo incorporados al desarrollo permiten combinar productividad y comodidad dentro del mismo entorno residencial.",
    "Las áreas destinadas al trabajo y las reuniones complementan un estilo de vida contemporáneo, facilitando actividades profesionales sin salir del desarrollo.",
    "El proyecto incorpora espacios diseñados para responder a las necesidades del trabajo remoto y las reuniones ejecutivas con comodidad y privacidad."
  ]
},

{
  category: "family",
  amenities: [
    "kids_club",
    "playground",
    "ludoteca"
  ],
  paragraphs: [
    "Las amenidades familiares ofrecen espacios seguros y atractivos para la convivencia, el juego y el desarrollo de los más pequeños.",
    "Las áreas infantiles complementan la experiencia residencial con espacios diseñados para fomentar la recreación y la convivencia familiar.",
    "Cada espacio destinado a las familias ha sido concebido para ofrecer diversión, seguridad y momentos compartidos dentro del desarrollo."
  ]
},

{
  category: "rooftop",
  amenities: [
    "roof_garden",
    "sky_lounge",
    "fire_pit"
  ],
  paragraphs: [
    "Los espacios elevados del desarrollo permiten disfrutar vistas privilegiadas y ambientes ideales para la convivencia y el descanso.",
    "Las terrazas y áreas panorámicas amplían la experiencia residencial con escenarios concebidos para relajarse y compartir momentos memorables.",
    "Los espacios en altura integran arquitectura, paisaje y confort para ofrecer una experiencia residencial de carácter exclusivo."
  ]
},

{
  category: "security",
  amenities: [
    "security",
    "controlled_access",
    "cctv"
  ],
  paragraphs: [
    "La seguridad forma parte esencial del desarrollo mediante sistemas de acceso controlado e infraestructura diseñada para brindar tranquilidad cotidiana.",
    "El proyecto integra medidas de seguridad que fortalecen la privacidad y permiten disfrutar la residencia con mayor confianza.",
    "La combinación de control de acceso, vigilancia e infraestructura especializada contribuye a crear un entorno residencial seguro y bien protegido."
  ]
}



,

{
  category: "golf",
  amenities: [
    "golf",
    "golf_course",
    "practice_green"
  ],
  paragraphs: [
    "La cercanía con instalaciones de golf complementa una experiencia residencial orientada al deporte, la convivencia y el contacto con amplios espacios abiertos.",
    "Los espacios dedicados al golf enriquecen el estilo de vida con escenarios concebidos para disfrutar una de las actividades recreativas más exclusivas.",
    "El entorno incorpora instalaciones que permiten integrar la práctica del golf como parte natural de la experiencia residencial."
  ]
},

{
  category: "pet",
  amenities: [
    "pet_park",
    "pet_spa"
  ],
  paragraphs: [
    "El desarrollo incorpora espacios destinados al bienestar de las mascotas, favoreciendo una convivencia más cómoda y completa para toda la familia.",
    "Las amenidades para mascotas complementan un estilo de vida donde cada integrante del hogar encuentra espacios diseñados para disfrutar plenamente.",
    "Las áreas pet friendly fortalecen la experiencia residencial mediante espacios seguros y especialmente acondicionados para las mascotas."
  ]
},

{
  category: "beach",
  amenities: [
    "beach",
    "beach_access",
    "oceanfront"
  ],
  paragraphs: [
    "La cercanía con el mar permite disfrutar un estilo de vida profundamente vinculado al entorno costero, donde cada día ofrece una experiencia privilegiada.",
    "El acceso directo a la playa convierte al desarrollo en un escenario ideal para disfrutar la naturaleza, el descanso y la vida frente al océano.",
    "El entorno marítimo aporta un carácter exclusivo que enriquece la experiencia residencial con vistas, privacidad y contacto permanente con el mar."
  ]
},

{
  category: "entertainment",
  amenities: [
    "cinema",
    "game_room",
    "wine_cellar",
    "lounge"
  ],
  paragraphs: [
    "Los espacios de entretenimiento complementan la propuesta residencial con ambientes concebidos para la convivencia, el descanso y el disfrute cotidiano.",
    "Las áreas recreativas ofrecen escenarios ideales para compartir momentos memorables con familiares y amigos dentro del mismo desarrollo.",
    "Cada espacio destinado al entretenimiento amplía las posibilidades de convivencia y fortalece la experiencia residencial."
  ]
}

];
