import { prisma } from "@/lib/prisma";

export type PublicPartnerCard = {
  name: string;
  slug?: string;
  category: string;
  note: string;
  coverImage?: string;
};

const FALLBACK: PublicPartnerCard[] = [
  {
    name: "Zibu",
    category: "Fine Dining",
    note: "Experiencia gastronómica clave para compradores de alto perfil.",
    coverImage:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=80",
  },
  {
    name: "Beach Club Reserve",
    category: "Private Club",
    note: "Acceso exclusivo frente al mar, lifestyle y hospitalidad.",
    coverImage:
      "https://image-tc.galaxy.tf/wijpeg-b96yoft5pgi30004mtfr8wz3t/beach-club-by-la-fisherii-a-3_wide.jpg?crop=0%2C0%2C1920%2C1080",
  },
  {
    name: "Marina Signature",
    category: "Yachting",
    note: "Charters, concierge y vida náutica premium.",
    coverImage:
      "https://image-tc.galaxy.tf/wijpeg-4vkjqkgb85o0alamyvada55wp/princess-2015-12.jpg",
  },
];

const EXACT_PARTNER_IMAGES: Record<string, string> = {
  "aman essentials":
    "https://image-tc.galaxy.tf/wijpeg-1h8a7vg10icm5swuzifnpcgnh/spa-40.jpg",
  zibu:
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=80",
  "beach club reserve":
    "https://image-tc.galaxy.tf/wijpeg-b96yoft5pgi30004mtfr8wz3t/beach-club-by-la-fisherii-a-3_wide.jpg?crop=0%2C0%2C1920%2C1080",
  "marina signature":
    "https://image-tc.galaxy.tf/wijpeg-4vkjqkgb85o0alamyvada55wp/princess-2015-12.jpg",
};

const GENERIC_PARTNER_IMAGES: Record<string, string> = {
  "fine dining":
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=80",
  "private club":
    "https://image-tc.galaxy.tf/wijpeg-b96yoft5pgi30004mtfr8wz3t/beach-club-by-la-fisherii-a-3_wide.jpg?crop=0%2C0%2C1920%2C1080",
  yachting:
    "https://image-tc.galaxy.tf/wijpeg-4vkjqkgb85o0alamyvada55wp/princess-2015-12.jpg",
  golf:
    "https://golf.mundoimperial.com/wp-content/uploads/2023/12/Turtle.png.webp",
  wellness:
    "https://image-tc.galaxy.tf/wijpeg-1h8a7vg10icm5swuzifnpcgnh/spa-40.jpg",
  lifestyle:
    "https://image-tc.galaxy.tf/wijpeg-4vkjqkgb85o0alamyvada55wp/princess-2015-12.jpg",
  "luxury partner":
    "https://image-tc.galaxy.tf/wijpeg-1h8a7vg10icm5swuzifnpcgnh/spa-40.jpg",
  default:
    "https://image-tc.galaxy.tf/wijpeg-4vkjqkgb85o0alamyvada55wp/princess-2015-12.jpg",
};

function withPartnerImage(item: PublicPartnerCard): PublicPartnerCard {
  if (item.coverImage && item.coverImage.length > 10) return item;

  const nameKey = item.name.trim().toLowerCase();
  const categoryKey = item.category.trim().toLowerCase();

  return {
    ...item,
    coverImage:
      EXACT_PARTNER_IMAGES[nameKey] ||
      GENERIC_PARTNER_IMAGES[categoryKey] ||
      GENERIC_PARTNER_IMAGES.default,
  };
}

function mergePartners(rows: PublicPartnerCard[]) {
  const seen = new Set<string>();
  const merged: PublicPartnerCard[] = [];

  for (const item of [...rows.map(withPartnerImage), ...FALLBACK]) {
    const key = item.name.trim().toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(item);
  }

  return merged.slice(0, 6);
}

export async function getPublicPartners(): Promise<PublicPartnerCard[]> {
  try {
    const rows = await prisma.publicPartner.findMany({
      where: { isVisible: true },
      orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
    });

    const mapped = rows.map((row) => ({
      name: row.name,
      slug: row.slug || "",
      category: row.category || "Luxury Partner",
      note: row.shortDescription || row.longDescription || "",
      coverImage: row.coverImage || row.logoUrl || "",
    }));

    return mergePartners(mapped);
  } catch {
    return FALLBACK;
  }
}
