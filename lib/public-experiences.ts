import { prisma } from "@/lib/prisma";

export type PublicExperienceCard = {
  eyebrow: string;
  title: string;
  slug?: string;
  text: string;
  coverImage?: string;
};

const FALLBACK: PublicExperienceCard[] = [
  {
    eyebrow: "Gastronomía",
    title: "Restaurantes que elevan el valor del destino",
    text: "El comprador no solo adquiere una propiedad. Compra el ecosistema culinario y social que lo rodea.",
    coverImage:
      "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1600&q=80",
  },
  {
    eyebrow: "Beach Clubs",
    title: "Hospitalidad privada como extensión del lujo",
    text: "Los clubes correctos refuerzan la permanencia, pertenencia y estilo de vida.",
    coverImage:
      "https://image-tc.galaxy.tf/wijpeg-b96yoft5pgi30004mtfr8wz3t/beach-club-by-la-fisherii-a-3_wide.jpg?crop=0%2C0%2C1920%2C1080",
  },
  {
    eyebrow: "Lifestyle",
    title: "Golf, marina y concierge como parte del cierre",
    text: "El lujo se construye con experiencias. No solo con arquitectura.",
    coverImage:
      "https://image-tc.galaxy.tf/wijpeg-5xemuxwzz927gb8vz2u47871j/dsc07371.jpg",
  },
];

const EXACT_EXPERIENCE_IMAGES: Record<string, string> = {
  "sunset yacht escape":
    "https://image-tc.galaxy.tf/wijpeg-4vkjqkgb85o0alamyvada55wp/princess-2015-12.jpg",
  "restaurantes que elevan el valor del destino":
    "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1600&q=80",
  "hospitalidad privada como extensión del lujo":
    "https://image-tc.galaxy.tf/wijpeg-b96yoft5pgi30004mtfr8wz3t/beach-club-by-la-fisherii-a-3_wide.jpg?crop=0%2C0%2C1920%2C1080",
  "golf, marina y concierge como parte del cierre":
    "https://image-tc.galaxy.tf/wijpeg-5xemuxwzz927gb8vz2u47871j/dsc07371.jpg",
};

const GENERIC_EXPERIENCE_IMAGES: Record<string, string> = {
  gastronomía:
    "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1600&q=80",
  "beach clubs":
    "https://image-tc.galaxy.tf/wijpeg-b96yoft5pgi30004mtfr8wz3t/beach-club-by-la-fisherii-a-3_wide.jpg?crop=0%2C0%2C1920%2C1080",
  lifestyle:
    "https://image-tc.galaxy.tf/wijpeg-5xemuxwzz927gb8vz2u47871j/dsc07371.jpg",
  marina:
    "https://image-tc.galaxy.tf/wijpeg-4vkjqkgb85o0alamyvada55wp/princess-2015-12.jpg",
  golf:
    "https://image-tc.galaxy.tf/wijpeg-5xemuxwzz927gb8vz2u47871j/dsc07371.jpg",
  experience:
    "https://image-tc.galaxy.tf/wijpeg-4vkjqkgb85o0alamyvada55wp/princess-2015-12.jpg",
  default:
    "https://image-tc.galaxy.tf/wijpeg-4vkjqkgb85o0alamyvada55wp/princess-2015-12.jpg",
};

function slugifyExperience(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function withExperienceImage(item: PublicExperienceCard): PublicExperienceCard {
  if (item.coverImage && item.coverImage.length > 10) return item;

  const titleKey = item.title.trim().toLowerCase();
  const eyebrowKey = item.eyebrow.trim().toLowerCase();

  return {
    ...item,
    slug: item.slug || slugifyExperience(item.title),
    coverImage:
      EXACT_EXPERIENCE_IMAGES[titleKey] ||
      GENERIC_EXPERIENCE_IMAGES[eyebrowKey] ||
      GENERIC_EXPERIENCE_IMAGES.default,
  };
}

function mergeExperiences(rows: PublicExperienceCard[]) {
  const seen = new Set<string>();
  const merged: PublicExperienceCard[] = [];

  for (const item of [...rows.map(withExperienceImage), ...FALLBACK.map(withExperienceImage)]) {
    const key = item.title.trim().toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(item);
  }

  return merged.slice(0, 6);
}

export async function getPublicExperiences(): Promise<PublicExperienceCard[]> {
  try {
    const rows = await prisma.publicExperience.findMany({
      where: { isVisible: true },
      orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
    });

    const mapped = rows.map((row) => ({
      eyebrow: row.category || "Experience",
      title: row.name,
      slug: slugifyExperience(row.name),
      text: row.shortDescription || row.longDescription || "",
      coverImage: row.coverImage || "",
    }));

    return mergeExperiences(mapped);
  } catch {
    return FALLBACK;
  }
}
