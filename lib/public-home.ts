import { prisma } from "@/lib/prisma";

export type PublicHomeHero = {
  heroEyebrow: string;
  heroTitle: string;
  heroSubtitle: string;
  heroPrimaryCtaLabel: string;
  heroPrimaryCtaHref: string;
  heroSecondaryCtaLabel: string;
  heroSecondaryCtaHref: string;
  heroBackgroundImage: string;
  destinationsTitle: string;
  destinationsSubtitle: string;
  partnersTitle: string;
  partnersSubtitle: string;
  experiencesTitle: string;
  experiencesSubtitle: string;
};

const FALLBACK_HOME: PublicHomeHero = {
  heroEyebrow: "Private Estates Mexico",
  heroTitle: "La entrada al estilo de vida de lujo en México",
  heroSubtitle:
    "Un portal inmobiliario premium por destinos, donde la residencia, la ciudad y el lifestyle se presentan como una sola experiencia de alto valor.",
  heroPrimaryCtaLabel: "Explorar destinos",
  heroPrimaryCtaHref: "#destinations",
  heroSecondaryCtaLabel: "Descubrir Acapulco",
  heroSecondaryCtaHref: "/acapulco",
  heroBackgroundImage:
    "/uploads/properties/sample-villa-diamante/cover/img-20260206-140512380-hdr-1774378789479.jpg",
  destinationsTitle: "Explora el lujo por ciudad, no por ruido de inventario",
  destinationsSubtitle:
    "Cada destino debe sentirse como una experiencia de lujo propia, con propiedades, estilo de vida, hospitalidad, gastronomía, marina, golf, wellness y contexto local.",
  partnersTitle: "Marcas y experiencias que elevan la conversación del lujo",
  partnersSubtitle:
    "La plataforma puede integrar hospitalidad, wellness, diseño, marina, gastronomía, golf, automoción, aviación y otras categorías afines al high-end market.",
  experiencesTitle: "El lujo se explica mejor a través de experiencias",
  experiencesSubtitle:
    "Cada destino debe articular gastronomía, hospitalidad, clubes, marina, wellness y lifestyle como parte del valor percibido del mercado.",
};

export async function getPublicHomeHero(): Promise<PublicHomeHero> {
  try {
    const home = await prisma.publicHome.findFirst({
      orderBy: { updatedAt: "desc" },
    });

    if (!home) return FALLBACK_HOME;

    return {
      heroEyebrow: home.heroEyebrow || FALLBACK_HOME.heroEyebrow,
      heroTitle: home.heroTitle || FALLBACK_HOME.heroTitle,
      heroSubtitle: home.heroSubtitle || FALLBACK_HOME.heroSubtitle,
      heroPrimaryCtaLabel:
        home.heroPrimaryCtaLabel || FALLBACK_HOME.heroPrimaryCtaLabel,
      heroPrimaryCtaHref:
        home.heroPrimaryCtaHref || FALLBACK_HOME.heroPrimaryCtaHref,
      heroSecondaryCtaLabel:
        home.heroSecondaryCtaLabel || FALLBACK_HOME.heroSecondaryCtaLabel,
      heroSecondaryCtaHref:
        home.heroSecondaryCtaHref || FALLBACK_HOME.heroSecondaryCtaHref,
      heroBackgroundImage:
        home.heroBackgroundImage || FALLBACK_HOME.heroBackgroundImage,
      destinationsTitle:
        home.destinationsTitle || FALLBACK_HOME.destinationsTitle,
      destinationsSubtitle:
        home.destinationsSubtitle || FALLBACK_HOME.destinationsSubtitle,
      partnersTitle: home.partnersTitle || FALLBACK_HOME.partnersTitle,
      partnersSubtitle:
        home.partnersSubtitle || FALLBACK_HOME.partnersSubtitle,
      experiencesTitle:
        home.experiencesTitle || FALLBACK_HOME.experiencesTitle,
      experiencesSubtitle:
        home.experiencesSubtitle || FALLBACK_HOME.experiencesSubtitle,
    };
  } catch {
    return FALLBACK_HOME;
  }
}
