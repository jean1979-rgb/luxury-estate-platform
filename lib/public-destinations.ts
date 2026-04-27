import { prisma } from "@/lib/prisma";

export type PublicDestinationCard = {
  name: string;
  href: string;
  image: string;
  status: string;
  text: string;
};

const DESTINATION_IMAGES: Record<string, string> = {
  acapulco:
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2200&q=85",
  "ciudad-de-mexico":
    "https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?auto=format&fit=crop&w=2200&q=85",
  queretaro:
    "https://images.unsplash.com/photo-1605640840605-14ac1855827b?auto=format&fit=crop&w=2200&q=85",
  "riviera-maya":
    "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=2200&q=85",
  "los-cabos":
    "https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=2200&q=85",
  "valle-de-bravo":
    "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=2200&q=85",
};

const ACAPULCO_LEGACY: PublicDestinationCard = {
  name: "Acapulco",
  href: "/acapulco",
  image: DESTINATION_IMAGES.acapulco,
  status: "published",
  text: "Villas, penthouses, branded residences y propiedades frente al mar.",
};

export async function getPublicDestinations(): Promise<PublicDestinationCard[]> {
  try {
    const items = await prisma.publicDestination.findMany({
      where: {
        status: {
          in: ["published", "coming_soon"],
        },
      },
      orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
    });

    const cmsItems = items
      .filter((item) => item.slug !== "acapulco")
      .map((item) => ({
        name: item.name,
        href: `/${item.slug}`,
        image: item.heroImage || DESTINATION_IMAGES[item.slug] || DESTINATION_IMAGES["riviera-maya"],
        status: item.status || "coming_soon",
        text:
          item.heroSubtitle ||
          item.overviewBody ||
          "Luxury destination experience.",
      }));

    return [ACAPULCO_LEGACY, ...cmsItems];
  } catch {
    return [ACAPULCO_LEGACY];
  }
}
