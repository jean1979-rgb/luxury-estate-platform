export type AdminPropertyStatus = "draft" | "published" | "archived";

export type AdminPropertyType =
  | "villa"
  | "penthouse"
  | "residence"
  | "estate"
  | "condo"
  | "land";

export type AdminHotspotType =
  | "nav"
  | "stairs-up"
  | "stairs-down"
  | "terrace"
  | "room"
  | "amenity"
  | "kitchen"
  | "living"
  | "bedroom"
  | "bathroom"
  | "pool"
  | "beach"
  | "view"
  | "garden"
  | "parking"
  | "elevator"
  | "gym"
  | "spa"
  | "lobby"
  | "dining";

export type AdminHotspotSize = "sm" | "md" | "lg";

export type AdminHotspot = {
  id: string;
  pitch: number;
  yaw: number;
  label: string;
  targetSceneId?: string;
  type?: AdminHotspotType;
  size?: AdminHotspotSize;
};

export type AdminScene360 = {
  id: string;
  title: string;
  image: string;
  thumbnail?: string;
  initialYaw?: number;
  initialPitch?: number;
  hotspots: AdminHotspot[];
};

export type AdminPemFactors = {
  viewQuality?: "partial" | "open" | "panoramic" | "iconic";
  privacy?: "medium" | "high" | "very_high" | "estate";
  oceanRelation?: "none" | "near_ocean" | "ocean_view" | "oceanfront" | "beach_access";
  experience?: string[];
  amenities?: string[];
  architecture?: string[];
  pemClassification?: "selection" | "signature" | "iconic";
};

export type AdminPropertySource = {
  provider: "manual" | "tokko" | "csv" | "xml";
  externalId?: string;
};

export type AdminPropertyRecord = {
  id: string;
  title: string;
  slug: string;
  status: AdminPropertyStatus;
  propertyType: AdminPropertyType;
  location: string;
  zoneSlug: string;
  zoneLabel: string;
  price: string;
  currency: string;
  bedrooms: number;
  bathrooms: number;
  halfBathrooms: number;
  areaInterior: string;
  areaTotal: string;
  tagline: string;
  coverImage: string;
  gallery: string[];
  videoUrl: string;
  videoPoster: string;
  videoType: string;
  scenes360: AdminScene360[];
  source?: AdminPropertySource;
  featured: boolean;
  published: boolean;
  luxuryScore: number;
  pemFactors: AdminPemFactors;
  description: string;
  createdAt: string;
  updatedAt: string;
};

export type AdminPropertyInput = Omit<AdminPropertyRecord, "createdAt" | "updatedAt">;

export const EMPTY_ADMIN_PROPERTY: AdminPropertyInput = {
  id: "",
  title: "",
  slug: "",
  status: "draft",
  propertyType: "villa",
  location: "",
  zoneSlug: "",
  zoneLabel: "",
  price: "",
  currency: "MXN",
  bedrooms: 0,
  bathrooms: 0,
  halfBathrooms: 0,
  areaInterior: "",
  areaTotal: "",
  tagline: "",
  coverImage: "",
  gallery: [],
  videoUrl: "",
  videoPoster: "",
  videoType: "upload",
  scenes360: [],
  source: { provider: "manual" },
  featured: false,
  published: false,
  luxuryScore: 85,
  pemFactors: {},
  description: "",
};
