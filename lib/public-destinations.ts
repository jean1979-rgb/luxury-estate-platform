import { prisma } from "@/lib/prisma";

export type PublicDestinationCard = {
  name: string;
  href: string;
  status: string;
  text: string;
  image: string;
};

const FALLBACK: PublicDestinationCard[] = [
  {
    name: "Acapulco",
    href: "/acapulco",
    image: "",
    status: "Live Destination",
    text: "Villas, penthouses, branded residences y propiedades frente al mar.",
  },
];

export async function getPublicDestinations(): Promise<PublicDestinationCard[]> {
  try {
    const rows = await prisma.publicDestination.findMany({
      where: { status: "published" },
      orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
    });

    if (!rows.length) return FALLBACK;

    return rows.map((r) => ({
      name: r.name,
      href: `/${r.slug}`,
      status: r.status,
      text: r.heroSubtitle || "",
      image: r.heroImage || "",
    }));
  } catch {
    return FALLBACK;
  }
}
