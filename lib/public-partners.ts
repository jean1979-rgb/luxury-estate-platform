import { prisma } from "@/lib/prisma";

export type PublicPartnerCard = {
  name: string;
  category: string;
  note: string;
};

const FALLBACK: PublicPartnerCard[] = [
  {
    name: "Zibu",
    category: "Fine Dining",
    note: "Experiencia gastronómica clave para compradores de alto perfil.",
  },
  {
    name: "Beach Club Reserve",
    category: "Private Club",
    note: "Acceso exclusivo frente al mar, lifestyle y hospitalidad.",
  },
  {
    name: "Marina Signature",
    category: "Yachting",
    note: "Charters, concierge y vida náutica premium.",
  },
];

export async function getPublicPartners(): Promise<PublicPartnerCard[]> {
  try {
    const rows = await prisma.publicPartner.findMany({
      where: { isVisible: true },
      orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
    });

    if (!rows.length) return FALLBACK;

    return rows.map((row) => ({
      name: row.name,
      category: row.category || "Luxury Partner",
      note: row.shortDescription || row.longDescription || "",
    }));
  } catch {
    return FALLBACK;
  }
}
