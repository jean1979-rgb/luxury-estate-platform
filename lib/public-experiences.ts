import { prisma } from "@/lib/prisma";

export type PublicExperienceCard = {
  eyebrow: string;
  title: string;
  text: string;
};

const FALLBACK: PublicExperienceCard[] = [
  {
    eyebrow: "Gastronomía",
    title: "Restaurantes que elevan el valor del destino",
    text: "El comprador no solo adquiere una propiedad. Compra el ecosistema culinario y social que lo rodea.",
  },
  {
    eyebrow: "Beach Clubs",
    title: "Hospitalidad privada como extensión del lujo",
    text: "Los clubes correctos refuerzan la permanencia, pertenencia y estilo de vida.",
  },
  {
    eyebrow: "Lifestyle",
    title: "Golf, marina y concierge como parte del cierre",
    text: "El lujo se construye con experiencias. No solo con arquitectura.",
  },
];

export async function getPublicExperiences(): Promise<PublicExperienceCard[]> {
  try {
    const rows = await prisma.publicExperience.findMany({
      where: { isVisible: true },
      orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
    });

    if (!rows.length) return FALLBACK;

    return rows.map((row) => ({
      eyebrow: row.category || "Experience",
      title: row.name,
      text: row.shortDescription || row.longDescription || "",
    }));
  } catch {
    return FALLBACK;
  }
}
