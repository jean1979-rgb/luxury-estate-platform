export const dynamic = "force-dynamic";
import { notFound } from "next/navigation";
import Link from "next/link";
import { redirect } from "next/navigation";
import Gallery from "@/components/Gallery";
import LuxuryScore from "@/components/LuxuryScore";
import PropertyFacts from "@/components/PropertyFacts";
import PropertyStory from "@/components/PropertyStory";
import Viewer360Carousel from "@/components/Viewer360Carousel";
import PropertyVideoTeaser from "@/components/PropertyVideoTeaser";
import ContactCTA from "@/components/ContactCTA";
import { prisma } from "@/lib/prisma";
import { getPublicPartners } from "@/lib/public-partners";
import { getPublicExperiences } from "@/lib/public-experiences";

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

function formatPropertyPrice(value: unknown) {
  const raw = String(value ?? "").trim();

  if (!raw) return "Precio disponible bajo solicitud";
  if (/bajo solicitud/i.test(raw)) return raw;

  const clean = raw.replace(/[$,\s]/g, "");
  const numericPrice = Number(clean);

  if (!Number.isFinite(numericPrice)) return raw;
  return `$${new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(numericPrice)}`;
}

function formatPropertyArea(value: unknown) {
  const raw = String(value ?? "").trim();

  if (!raw || raw === "N/D") return "N/D";
  if (/m2|m²/i.test(raw)) return raw.replace(/m2/gi, "m²");

  return `${raw} m²`;
}

function formatPublicLocation(value: unknown) {
  const raw = String(value ?? "").trim();
  if (!raw) return "Ubicación premium";

  const parts = raw
    .split("|")
    .map((part) => part.trim())
    .filter(Boolean);

  const last = parts[parts.length - 1] || raw;

  return last
    .replace(/^Fraccionamiento\s+/i, "")
    .replace(/^Condominio\s+/i, "")
    .trim();
}



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
      ? parsed.filter((image: any): image is string => typeof image === "string" && image.trim().length > 0)
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

  const luxuryPartners = await getPublicPartners();
  const experiences = await getPublicExperiences();


  if (prismaScenes.length > 0) {
    scenes360 = prismaScenes.map((scene: any) => ({
      id: scene.id,
      title: scene.title,
      image: scene.image,
      thumbnail: scene.thumbnail ?? undefined,
      initialYaw: scene.initialYaw ?? 0,
      initialPitch: scene.initialPitch ?? 0,
      hotspots: scene.hotspots.map((h: any) => ({
        id: h.id,
        pitch: h.pitch,
        yaw: h.yaw,
        label: h.label ?? undefined,
        targetSceneId: h.targetSceneId ?? undefined,
        type: h.type ?? undefined,
      })),
    }));
  }
  if (property.slug && property.slug !== id) {
    redirect(`/properties/${property.slug}`);
  }

  const safeLocation = formatPublicLocation(property.location);
  const safePrice = formatPropertyPrice(property.price);
  const safeBedrooms = property.bedrooms ?? 0;
  const safeBathrooms = property.bathrooms ?? 0;

  const areaLabel = formatPropertyArea(
    property.areaTotal != null
      ? property.areaTotal
      : property.areaInterior != null
        ? property.areaInterior
        : ""
  );

  return (
    <>
      <PropertyVideoTeaser
        propertyId={property.id}
        title={property.title}
        videoUrl={property.videoUrl ?? ""}
        videoPoster={property.videoPoster ?? safeCoverImage}
      />
    <main className="min-h-screen w-full overflow-x-hidden bg-[#0a0a0a] text-[#f5f1eb]">
      <section className="relative h-[78svh] min-h-[560px] w-full overflow-hidden md:h-[85vh] md:min-h-0">
        <img
          src={safeCoverImage}
          alt={property.title}
          className="absolute inset-0 h-full w-full scale-105 object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/10" />

        <div className="absolute left-4 top-5 z-20 md:left-10">
          <Link
            href="/acapulco"
            className="text-sm text-white/70 transition hover:text-white"
          >
            ← Volver
          </Link>
        </div>

        <div className="absolute bottom-0 left-0 right-0 z-20 px-4 pb-8 md:px-10 md:pb-16">
          <div className="max-w-[1680px]">
            <p className="text-[9px] uppercase tracking-[0.28em] text-white/40 md:text-[10px] md:tracking-[0.4em]">
              Private Listing
            </p>

            <h1 className="mt-3 max-w-4xl text-[2.1rem] font-light leading-[1.02] md:mt-4 md:text-7xl">
              {property.title}
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-6 text-white/70 md:mt-6 md:text-lg md:leading-normal">
              {property.tagline || "Una colección residencial de lujo presentada con curaduría visual, escala arquitectónica y vista privilegiada."}
            </p>

            <div className="mt-5 md:hidden">
              <p className="text-[1.55rem] font-light leading-none text-white">
                {safePrice} MXN
              </p>

              <p className="mt-3 text-[13px] leading-6 text-white/80">
                {safeBedrooms} Recámaras · {safeBathrooms} Baños · {areaLabel}
              </p>

              <p className="mt-2 max-w-[92%] text-[12px] leading-5 text-white/55">
                {safeLocation}
              </p>
            </div>

            <div className="mt-8 hidden flex-wrap gap-3 text-sm md:flex">
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

      <section className="mx-auto w-full max-w-[1680px] px-4 pb-12 pt-10 md:px-10 md:pb-20 md:pt-0">
        <div className="max-w-3xl">
          <p className="text-[10px] uppercase tracking-[0.35em] text-white/35">
            Lifestyle Nearby
          </p>

          <h2 className="mt-3 text-2xl font-light md:text-4xl">
            Lo que define esta propiedad
          </h2>

          <p className="mt-3 text-sm leading-7 text-white/55 md:text-base">
            El valor real no está solo en la arquitectura, sino en lo que ocurre alrededor: experiencias, hospitalidad y lugares que construyen una vida difícil de replicar.
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:mt-8 md:grid-cols-3 md:gap-6">
          {experiences.slice(0,3).map((item: any) => (
            <Link
              key={item.slug || item.title}
              href={`/experiences/${item.slug}`}
              className="group relative flex min-h-[220px] overflow-hidden rounded-[24px] border border-white/10 md:min-h-[320px] md:rounded-[28px]"
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition group-hover:scale-105"
                style={{ backgroundImage: `url("${item.coverImage}")` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
              <div className="relative mt-auto p-6">
                <p className="text-[10px] uppercase tracking-[0.34em] text-white/45">
                  {item.eyebrow}
                </p>
                <h3 className="mt-2 text-xl font-light">{item.title}</h3>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:mt-12 md:grid-cols-3 md:gap-6">
          {luxuryPartners.slice(0,3).map((partner: any) => (
            <Link
              key={partner.slug}
              href={`/partners/${partner.slug}`}
              className="group relative flex min-h-[220px] overflow-hidden rounded-[24px] border border-white/10 md:min-h-[320px] md:rounded-[28px]"
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition group-hover:scale-105"
                style={{ backgroundImage: `url("${partner.coverImage}")` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
              <div className="relative mt-auto p-6">
                <p className="text-[10px] uppercase tracking-[0.34em] text-white/45">
                  {partner.category}
                </p>
                <h3 className="mt-2 text-xl font-light">{partner.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </section>


      <section className="mx-auto grid w-full max-w-[1680px] gap-10 px-4 py-10 md:grid-cols-2 md:px-10 md:py-14 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="min-w-0 space-y-10 md:space-y-12">
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

            <h2 className="mt-3 text-2xl font-light md:text-3xl">
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

        <aside className="min-w-0 h-fit space-y-5 md:sticky md:top-24 md:space-y-8">
          <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6">
            <LuxuryScore
              value={property.luxuryScore ?? 0}
              title={property.title}
              coverImage={safeCoverImage}
              location={safeLocation}
              area={areaLabel}
            />
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
            <ContactCTA
              title={property.title}
              location={safeLocation}
              price={safePrice}
              propertyUrl={`https://privateestatesmexico.com/properties/${property.slug || property.id}`}
            />
          </div>
        </aside>
      </section>
    </main>
    </>
  );
}
