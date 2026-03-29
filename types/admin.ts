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
  | "kitchen";

export type AdminHotspot = {
  id: string;
  pitch: number;
  yaw: number;
  label: string;
  targetSceneId?: string;
  type?: AdminHotspotType;
};

export type AdminScene360 = {
  id: string;
  title: string;
  image: string;
  thumbnail?: string;
  hotspots: AdminHotspot[];
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
  price: string;
  currency: string;
  bedrooms: number;
  bathrooms: number;
  areaInterior: string;
  areaTotal: string;
  tagline: string;
  coverImage: string;
  gallery: string[];
  scenes360: AdminScene360[];
  source?: AdminPropertySource;
  featured: boolean;
  published: boolean;
  luxuryScore: number;
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
  price: "",
  currency: "MXN",
  bedrooms: 0,
  bathrooms: 0,
  areaInterior: "",
  areaTotal: "",
  tagline: "",
  coverImage: "",
  gallery: [],
  scenes360: [],
  source: { provider: "manual" },
  featured: false,
  published: false,
  luxuryScore: 85,
  description: "",
};
