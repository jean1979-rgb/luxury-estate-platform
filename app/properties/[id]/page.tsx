import { notFound } from "next/navigation";
import Link from "next/link";
import Gallery from "@/components/Gallery";
import LuxuryScore from "@/components/LuxuryScore";
import PropertyFacts from "@/components/PropertyFacts";
import PropertyStory from "@/components/PropertyStory";
import Viewer360Carousel from "@/components/Viewer360Carousel";
import PropertyVideoTeaser from "@/components/PropertyVideoTeaser";
import ContactCTA from "@/components/ContactCTA";
import { prisma } from "@/lib/prisma";

type PageProps = {
  params: Promise<{ id: string }>;
};

type AdminScene = {
  id: string;
  title?: string;
  image: string;
  thumbnail?: string;
  hotspots?: unknown[];
};

type AdminProperty = {
  id: string;
  title: string;
  location: string;
  price: string;
  bedrooms: number;
  bathrooms: number;
  coverImage: string;
  gallery?: string[];
  videoUrl?: string;
  videoPoster?: string;
  videoType?: string;
  tagline?: string;
  description?: string;
  luxuryScore?: number;
  area?: string;
  areaInterior?: string;
  areaTotal?: string;
  scenes360?: AdminScene[];
  featured?: boolean;
  published?: boolean;
};



async function getPrismaScenes(propertyId: string) {
  return prisma.propertyScene360.findMany({
    where: { propertyId },
    orderBy: { sortOrder: "asc" },
    include: {
      hotspots: {
        orderBy: { createdAt: "asc" },
      },
    },
  });
}

export default async function PropertyDetailPage({ params }: PageProps) {
  const { id } = await params;
  const property = await prisma.brokerProperty.findFirst({
    where: {
      published: true,
      OR: [
        { id },
        { slug: id },
      ],
    },
  });

  
  console.log("PROPERTY VIDEO DEBUG:", {
    id: property?.id,
    videoUrl: property?.videoUrl,
    videoPoster: property?.videoPoster,
  });


  if (!property) {
    notFound();
  }

  const safeCoverImage = property.coverImage ?? "";

  let gallery: string[] = [];

  try {
    const parsed = typeof property.gallery === "string"
      ? JSON.parse(property.gallery)
      : property.gallery;

    gallery = Array.isArray(parsed) && parsed.length > 0
      ? parsed.filter((image): image is string => typeof image === "string" && image.trim().length > 0)
      : safeCoverImage
        ? [safeCoverImage]
        : [];
  } catch {
    gallery = safeCoverImage ? [safeCoverImage] : [];
  }

  let scenes360: {
    id: string;
    title?: string;
    image: string;
    thumbnail?: string;
    initialYaw?: number;
    initialPitch?: number;
    hotspots?: {
      id: string;
      pitch: number;
      yaw: number;
      label?: string;
      targetSceneId?: string;
    }[];
  }[] = [];

  const prismaScenes = await getPrismaScenes(property.id);

  if (prismaScenes.length > 0) {
    scenes360 = prismaScenes.map((scene) => ({
      id: scene.id,
      title: scene.title,
      image: scene.image,
      thumbnail: scene.thumbnail ?? undefined,
      initialYaw: scene.initialYaw ?? 0,
      initialPitch: scene.initialPitch ?? 0,
      hotspots: scene.hotspots.map((h) => ({
        id: h.id,
        pitch: h.pitch,
        yaw: h.yaw,
        label: h.label ?? undefined,
        targetSceneId: h.targetSceneId ?? undefined,
      })),
    }));
  }
  const safeLocation = property.location ?? "Ubicación premium";
  const safePrice = property.price ?? "Precio disponible bajo solicitud";
  const safeBedrooms = property.bedrooms ?? 0;
  const safeBathrooms = property.bathrooms ?? 0;

  const areaLabel =
    property.areaTotal != null
      ? String(property.areaTotal)
      : property.areaInterior != null
        ? String(property.areaInterior)
        : "N/D";

  return (
    <>
      <PropertyVideoTeaser
        propertyId={property.id}
        title={property.title}
        videoUrl={property.videoUrl ?? ""}
        videoPoster={property.videoPoster ?? safeCoverImage}
      />
    <main className="min-h-screen bg-[#0a0a0a] text-[#f5f1eb]">
      <section className="relative h-[85vh] w-full overflow-hidden">
        <img
          src={safeCoverImage}
          alt={property.title}
          className="absolute inset-0 h-full w-full scale-105 object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/10" />

        <div className="absolute left-6 top-6 z-20 md:left-10">
          <Link
            href="/acapulco"
            className="text-sm text-white/70 transition hover:text-white"
          >
            ← Volver
          </Link>
        </div>

        <div className="absolute bottom-0 left-0 right-0 z-20 px-6 pb-12 md:px-10 md:pb-16">
          <div className="max-w-[1680px]">
            <p className="text-[10px] uppercase tracking-[0.4em] text-white/40">
              Private Listing
            </p>

            <h1 className="mt-4 max-w-4xl text-5xl font-light leading-[1.05] md:text-7xl">
              {property.title}
            </h1>

            <p className="mt-6 max-w-2xl text-lg text-white/70">
              {property.tagline || "Una colección residencial de lujo presentada con curaduría visual, escala arquitectónica y vista privilegiada."}
            </p>

            <div className="mt-8 flex flex-wrap gap-3 text-sm">
              <span className="rounded-full border border-white/15 px-4 py-2">
                {safeLocation}
              </span>
              <span className="rounded-full border border-white/15 px-4 py-2">
                {safePrice}
              </span>
              <span className="rounded-full border border-white/15 px-4 py-2">
                {safeBedrooms} recámaras
              </span>
              <span className="rounded-full border border-white/15 px-4 py-2">
                {safeBathrooms} baños
              </span>
              <span className="rounded-full border border-white/15 px-4 py-2">
                {areaLabel}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1680px] gap-12 px-6 py-14 md:grid-cols-2 xl:grid-cols-[1.2fr_0.8fr] md:px-10">
        <div className="space-y-12">
          <div>
            <p className="text-[10px] uppercase tracking-[0.4em] text-white/30">
              Galería
            </p>

            <div className="mt-6">
              <Gallery images={gallery} title={property.title} />
            </div>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-[0.4em] text-white/30">
              Concepto
            </p>

            <h2 className="mt-3 text-3xl font-light">
              Arquitectura & Experiencia
            </h2>

            <div className="mt-6 text-white/70 leading-relaxed">
              <PropertyStory
                tagline={property.tagline ?? ""}
                description={property.description ?? ""}
              />
            </div>
          </div>

          {scenes360.length > 0 || property.videoUrl ? (
            <Viewer360Carousel
              scenes={scenes360}
              videoUrl={property.videoUrl ?? ""}
              videoPoster={property.videoPoster ?? safeCoverImage}
            />
          ) : null}
        </div>

        <aside className="h-fit space-y-8 md:sticky md:top-24">
          <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6">
            <div className="rounded-[24px] border border-white/10 bg-[#121212] p-6">
              <p className="text-[10px] uppercase tracking-[0.35em] text-white/45">
                Luxury Score
              </p>
              <div className="mt-3 text-4xl font-light text-white">
                {property.luxuryScore ?? 0}
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6">
            <PropertyFacts
              location={safeLocation}
              price={safePrice}
              bedrooms={safeBedrooms}
              bathrooms={safeBathrooms}
              area={areaLabel}
            />
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6">
            <ContactCTA title={property.title} />
          </div>
        </aside>
      </section>
    </main>
    </>
  );
}
