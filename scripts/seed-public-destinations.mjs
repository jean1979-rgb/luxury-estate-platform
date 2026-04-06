import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.publicDestination.upsert({
    where: { slug: "acapulco" },
    update: {
      name: "Acapulco",
      status: "live",
      isFeatured: true,
      sortOrder: 1,
      heroEyebrow: "Private Estates Mexico",
      heroTitle: "Acapulco",
      heroSubtitle:
        "Un destino donde residencia, costa, hospitalidad y estilo de vida conviven como una sola experiencia premium.",
      heroImage:
        "/uploads/properties/sample-villa-diamante/cover/img-20260206-140512380-hdr-1774378789479.jpg",
      overviewTitle: "Destino activo",
      overviewBody:
        "Acapulco funciona como la primera capa viva del sistema público y como punta de lanza de la plataforma por destino.",
      thesisTitle: "Por qué Acapulco",
      thesisBody:
        "La propuesta pública no presenta inventario aislado. Presenta contexto, zonas, hospitalidad, lifestyle y selección residencial en un mismo marco premium.",
      primaryCtaLabel: "Entrar a Acapulco",
      primaryCtaHref: "/acapulco",
      secondaryCtaLabel: "Ver rentals",
      secondaryCtaHref: "/acapulco/rentals",
      seoTitle: "Acapulco | Private Estates Mexico",
      seoDescription:
        "Explora Acapulco como destino activo dentro de Private Estates Mexico.",
      ogImage:
        "/uploads/properties/sample-villa-diamante/cover/img-20260206-140512380-hdr-1774378789479.jpg",
    },
    create: {
      name: "Acapulco",
      slug: "acapulco",
      status: "live",
      isFeatured: true,
      sortOrder: 1,
      heroEyebrow: "Private Estates Mexico",
      heroTitle: "Acapulco",
      heroSubtitle:
        "Un destino donde residencia, costa, hospitalidad y estilo de vida conviven como una sola experiencia premium.",
      heroImage:
        "/uploads/properties/sample-villa-diamante/cover/img-20260206-140512380-hdr-1774378789479.jpg",
      overviewTitle: "Destino activo",
      overviewBody:
        "Acapulco funciona como la primera capa viva del sistema público y como punta de lanza de la plataforma por destino.",
      thesisTitle: "Por qué Acapulco",
      thesisBody:
        "La propuesta pública no presenta inventario aislado. Presenta contexto, zonas, hospitalidad, lifestyle y selección residencial en un mismo marco premium.",
      primaryCtaLabel: "Entrar a Acapulco",
      primaryCtaHref: "/acapulco",
      secondaryCtaLabel: "Ver rentals",
      secondaryCtaHref: "/acapulco/rentals",
      seoTitle: "Acapulco | Private Estates Mexico",
      seoDescription:
        "Explora Acapulco como destino activo dentro de Private Estates Mexico.",
      ogImage:
        "/uploads/properties/sample-villa-diamante/cover/img-20260206-140512380-hdr-1774378789479.jpg",
    },
  });

  console.log("OK: public destinations seeded");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
