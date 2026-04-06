import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.publicHome.upsert({
    where: { id: "public-home-main" },
    update: {
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
    },
    create: {
      id: "public-home-main",
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
    },
  });

  console.log("OK: PublicHome seeded");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
