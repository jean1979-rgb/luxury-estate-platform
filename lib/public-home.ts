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
  featuredDestinationName: string;
  featuredDestinationHref: string;
  featuredDestinationStatus: string;
  featuredDestinationText: string;
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
    "https://pub-97c7fb12e7244f288f056306452e2d7d.r2.dev/cover/sample-villa-diamante.jpg",
  destinationsTitle: "Explora el lujo por ciudad, no por ruido de inventario",
  destinationsSubtitle:
    "Cada destino debe sentirse como una experiencia de lujo propia, con propiedades, estilo de vida, hospitalidad, gastronomía, marina, golf, wellness y contexto local.",
  partnersTitle: "Marcas y experiencias que elevan la conversación del lujo",
  partnersSubtitle:
    "La plataforma puede integrar hospitalidad, wellness, diseño, marina, gastronomía, golf, automoción, aviación y otras categorías afines al high-end market.",
  experiencesTitle: "El lujo se explica mejor a través de experiencias",
  experiencesSubtitle:
    "Cada destino debe articular gastronomía, hospitalidad, clubes, marina, wellness y lifestyle como parte del valor percibido del mercado.",
  featuredDestinationName: "Acapulco",
  featuredDestinationHref: "/acapulco",
  featuredDestinationStatus: "published",
  featuredDestinationText:
    "Villas, penthouses, branded residences y propiedades frente al mar.",
};

export async function getPublicHomeHero(): Promise<PublicHomeHero> {
  try {
    const home = await prisma.publicHome.findFirst({
      orderBy: { updatedAt: "desc" },
      include: {
        featuredDestination: true,
      },
    });

    if (!home) return FALLBACK_HOME;

    const featured = home.featuredDestination;

    return {
      heroEyebrow: home.heroEyebrow || FALLBACK_HOME.heroEyebrow,
      heroTitle: home.heroTitle || FALLBACK_HOME.heroTitle,
      heroSubtitle: home.heroSubtitle || FALLBACK_HOME.heroSubtitle,
      heroPrimaryCtaLabel:
        home.heroPrimaryCtaLabel || FALLBACK_HOME.heroPrimaryCtaLabel,
      heroPrimaryCtaHref:
        home.heroPrimaryCtaHref || FALLBACK_HOME.heroPrimaryCtaHref,
      heroSecondaryCtaLabel:
        home.heroSecondaryCtaLabel ||
        (featured?.name
          ? `Descubrir ${featured.name}`
          : FALLBACK_HOME.heroSecondaryCtaLabel),
      heroSecondaryCtaHref:
        home.heroSecondaryCtaHref ||
        (featured?.slug
          ? `/${featured.slug}`
          : FALLBACK_HOME.heroSecondaryCtaHref),
      heroBackgroundImage:
        home.heroBackgroundImage ||
        featured?.heroImage ||
        FALLBACK_HOME.heroBackgroundImage,
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
      featuredDestinationName:
        featured?.name || FALLBACK_HOME.featuredDestinationName,
      featuredDestinationHref:
        featured?.slug
          ? `/${featured.slug}`
          : FALLBACK_HOME.featuredDestinationHref,
      featuredDestinationStatus:
        featured?.status || FALLBACK_HOME.featuredDestinationStatus,
      featuredDestinationText:
        featured?.heroSubtitle || FALLBACK_HOME.featuredDestinationText,
    };
  } catch {
    return FALLBACK_HOME;
  }
}
