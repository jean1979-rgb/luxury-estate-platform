export type PanoramaHotspot = {
  id: string;
  label: string;
  targetSceneId: string;
  yaw: number;
  pitch: number;
};

export type PanoramaScene = {
  id: string;
  label: string;
  image: string;
  thumbnail?: string;
  initialYaw?: number;
  initialPitch?: number;
  hotspots?: PanoramaHotspot[];
};

export type Property = {
  id: string;
  title: string;
  location: string;
  price: string;
  tagline: string;
  description: string;
  bedrooms: number;
  bathrooms: number;
  area: string;
  luxuryScore: number;
  coverImage: string;
  gallery: string[];
  heroVideo: string;
  panorama360: string;
  panoramaScenes: PanoramaScene[];
  featured: boolean;
};

export const properties: Property[] = [
  {
    id: "villa-azure-diamante",
    title: "Villa Azure Diamante",
    location: "Acapulco Diamante, Guerrero",
    price: "$38,500,000 MXN",
    tagline: "Arquitectura serena frente al mar con privacidad absoluta.",
    description:
      "Una residencia curada para compradores que priorizan diseño, amplitud y experiencia. Espacios abiertos, terrazas envolventes y una narrativa visual pensada para un mercado premium.",
    bedrooms: 5,
    bathrooms: 6,
    area: "920 m²",
    luxuryScore: 96,
    coverImage: "/images/acapulco/villa-1.jpg",
    gallery: [
      "/images/acapulco/villa-1.jpg",
      "/images/acapulco/villa-2.jpg",
      "/images/acapulco/beach-1.jpg"
    ],
    heroVideo: "/videos/property-hero.mp4",
    panorama360: "/360/panorama-1.jpg",
    panoramaScenes: [
      {
        id: "living-room",
        label: "Sala principal",
        image: "/360/panorama-1.jpg",
        thumbnail: "/360/panorama-1.jpg",
        initialYaw: 0,
        initialPitch: 0,
        hotspots: [
          {
            id: "to-terrace",
            label: "Ir a terraza",
            targetSceneId: "terrace",
            yaw: 18,
            pitch: -2
          },
          {
            id: "to-master-suite",
            label: "Ir a recámara",
            targetSceneId: "master-suite",
            yaw: -28,
            pitch: 0
          }
        ]
      },
      {
        id: "terrace",
        label: "Terraza",
        image: "/360/panorama-1.jpg",
        thumbnail: "/360/panorama-1.jpg",
        initialYaw: 25,
        initialPitch: 0,
        hotspots: [
          {
            id: "terrace-to-living",
            label: "Ir a sala",
            targetSceneId: "living-room",
            yaw: -10,
            pitch: -3
          },
          {
            id: "terrace-to-master",
            label: "Ir a recámara",
            targetSceneId: "master-suite",
            yaw: 35,
            pitch: 1
          }
        ]
      },
      {
        id: "master-suite",
        label: "Recámara principal",
        image: "/360/panorama-1.jpg",
        thumbnail: "/360/panorama-1.jpg",
        initialYaw: -20,
        initialPitch: 0,
        hotspots: [
          {
            id: "master-to-living",
            label: "Ir a sala",
            targetSceneId: "living-room",
            yaw: 8,
            pitch: 0
          },
          {
            id: "master-to-terrace",
            label: "Ir a terraza",
            targetSceneId: "terrace",
            yaw: -40,
            pitch: -2
          }
        ]
      }
    ],
    featured: true
  },
  {
    id: "penthouse-costa-luna",
    title: "Penthouse Costa Luna",
    location: "Punta Diamante, Guerrero",
    price: "$24,900,000 MXN",
    tagline: "Vistas abiertas, interiorismo sobrio y roof privado.",
    description:
      "Un penthouse de alto perfil con visuales dominantes, materiales nobles y composición limpia. Ideal para un escaparate inmobiliario aspiracional.",
    bedrooms: 4,
    bathrooms: 4,
    area: "480 m²",
    luxuryScore: 91,
    coverImage: "/images/acapulco/villa-2.jpg",
    gallery: [
      "/images/acapulco/villa-2.jpg",
      "/images/acapulco/beach-1.jpg",
      "/images/acapulco/villa-1.jpg"
    ],
    heroVideo: "/videos/property-hero.mp4",
    panorama360: "/360/panorama-1.jpg",
    panoramaScenes: [
      {
        id: "main-area",
        label: "Área social",
        image: "/360/panorama-1.jpg",
        thumbnail: "/360/panorama-1.jpg",
        initialYaw: 0,
        initialPitch: 0,
        hotspots: [
          {
            id: "main-to-roof",
            label: "Ir a roof",
            targetSceneId: "roof-garden",
            yaw: 24,
            pitch: -1
          }
        ]
      },
      {
        id: "roof-garden",
        label: "Roof garden",
        image: "/360/panorama-1.jpg",
        thumbnail: "/360/panorama-1.jpg",
        initialYaw: 15,
        initialPitch: 0,
        hotspots: [
          {
            id: "roof-to-main",
            label: "Ir a área social",
            targetSceneId: "main-area",
            yaw: -18,
            pitch: 0
          }
        ]
      }
    ],
    featured: false
  }
];

export function getPropertyById(id: string) {
  return properties.find((property) => property.id === id);
}
