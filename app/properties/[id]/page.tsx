import { notFound } from "next/navigation";
import Link from "next/link";
import { promises as fs } from "fs";
import path from "path";
import { properties as fallbackProperties } from "@/data/properties";
import Gallery from "@/components/Gallery";
import LuxuryScore from "@/components/LuxuryScore";
import PropertyFacts from "@/components/PropertyFacts";
import PropertyStory from "@/components/PropertyStory";
import Viewer360Carousel from "@/components/Viewer360Carousel";
import ContactCTA from "@/components/ContactCTA";

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

async function getProperties(): Promise<AdminProperty[]> {
  try {
    const adminPath = path.join(process.cwd(), "data/admin/properties.json");
    const tokkoPath = path.join(process.cwd(), "data/platform/properties.json");

    let admin: AdminProperty[] = [];
    let tokko: AdminProperty[] = [];

    try {
      const rawAdmin = await fs.readFile(adminPath, "utf8");
      const parsedAdmin = JSON.parse(rawAdmin);
      admin = Array.isArray(parsedAdmin) ? parsedAdmin : [];
    } catch {}

    try {
      const rawTokko = await fs.readFile(tokkoPath, "utf8");
      const parsedTokko = JSON.parse(rawTokko);

      tokko = (Array.isArray(parsedTokko) ? parsedTokko : []).map((item: any) => ({
        id: item.id,
        title: item.editorial?.title || item.base?.title || "Propiedad",
        location: item.base?.locationLabel || "Ubicación premium",
        price: item.base?.priceLabel || "Precio disponible bajo solicitud",
        bedrooms: Number(item.base?.bedrooms ?? 0),
        bathrooms: Number(item.base?.bathrooms ?? 0),
        coverImage: item.base?.images?.[0] || "",
        gallery: Array.isArray(item.base?.images) ? item.base.images : [],
        tagline: item.editorial?.tagline || "",
        description: item.editorial?.descriptionLuxury || item.base?.description || "",
        luxuryScore: Number(item.editorial?.luxuryScore ?? 85),
        area: item.base?.areaLabel || item.base?.totalAreaLabel || item.base?.coveredAreaLabel || "N/D",
        areaInterior: item.base?.coveredAreaLabel || "",
        areaTotal: item.base?.totalAreaLabel || "",
        scenes360: Array.isArray(item.media?.scenes360)
        ? item.media.scenes360.filter((scene: any) => typeof scene?.image === "string" && scene.image.trim().length > 0)
        : [],
        featured: Boolean(item.editorial?.featuredPlatform),
        published: item.status?.published ?? true,
      }));
    } catch {}

    const all = [...admin, ...tokko];

    if (all.length === 0) {
      return fallbackProperties;
    }

    const published = all.filter((item) => item?.published);
    return published.length > 0 ? published : all;
  } catch {
    return fallbackProperties;
  }
}

export default async function PropertyDetailPage({ params }: PageProps) {
  const { id } = await params;
  const properties = await getProperties();
  const property = properties.find((item) => item.id === id);

  if (!property) {
    notFound();
  }

  const gallery =
    Array.isArray(property.gallery) && property.gallery.length > 0
      ? property.gallery
      : [property.coverImage];

  const scenes360 = Array.isArray(property.scenes360) ? property.scenes360 : [];
  const areaLabel = property.area ?? property.areaInterior ?? property.areaTotal ?? "N/D";

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-[#f5f1eb]">
      <section className="relative h-[85vh] w-full overflow-hidden">
        <img
          src={property.coverImage}
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
                {property.location}
              </span>
              <span className="rounded-full border border-white/15 px-4 py-2">
                {property.price}
              </span>
              <span className="rounded-full border border-white/15 px-4 py-2">
                {property.bedrooms} recámaras
              </span>
              <span className="rounded-full border border-white/15 px-4 py-2">
                {property.bathrooms} baños
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

          {scenes360.length > 0 ? (
            <Viewer360Carousel scenes={scenes360} />
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
              location={property.location}
              price={property.price}
              bedrooms={property.bedrooms}
              bathrooms={property.bathrooms}
              area={areaLabel}
            />
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6">
            <ContactCTA title={property.title} />
          </div>
        </aside>
      </section>
    </main>
  );
}
