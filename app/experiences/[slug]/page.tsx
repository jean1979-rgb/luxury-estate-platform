export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getPublicExperiences } from "@/lib/public-experiences";
import SeamlessVideoHero from "@/components/SeamlessVideoHero";
import Viewer360Carousel from "@/components/Viewer360Carousel";

type Props = {
  params: Promise<{ slug: string }>;
};

type Scene360 = {
  id: string;
  title: string;
  image: string;
  thumbnail?: string;
  initialYaw?: number;
  initialPitch?: number;
  hotspots?: any[];
};

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function asString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function asScenes(value: unknown): Scene360[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter(
      (item): item is Record<string, any> =>
        Boolean(item) &&
        typeof item === "object" &&
        typeof (item as Record<string, any>).image === "string"
    )
    .map((item, index) => ({
      id:
        typeof item.id === "string" && item.id
          ? item.id
          : `scene-${index}`,
      title:
        typeof item.title === "string" && item.title
          ? item.title
          : `Vista ${index + 1}`,
      image: item.image,
      thumbnail:
        typeof item.thumbnail === "string"
          ? item.thumbnail
          : item.image,
      initialYaw:
        typeof item.initialYaw === "number" ? item.initialYaw : 0,
      initialPitch:
        typeof item.initialPitch === "number" ? item.initialPitch : 0,
      hotspots: Array.isArray(item.hotspots) ? item.hotspots : [],
    }));
}

function resolveHeroImage(item: { coverImage?: string | null }) {
  if (
    typeof item.coverImage === "string" &&
    item.coverImage.length > 10
  ) {
    return item.coverImage;
  }

  return "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1800&q=85";
}

function getFallbackGallery(slug: string, heroImage: string) {
  const map: Record<string, string[]> = {
    "aurora-sunset-social": [
      heroImage,
      "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1493558103817-58b2924bce98?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1512100356356-de1b84283e18?auto=format&fit=crop&w=1600&q=80",
    ],
  };

  return (
    map[slug] || [
      heroImage,
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80",
    ]
  ).slice(0, 4);
}

export default async function ExperienceDetailPage({ params }: Props) {
  const { slug } = await params;

  const dbExperience = await prisma.publicExperience.findFirst({
    where: {
      slug,
      isVisible: true,
    },
    include: {
      partner: true,
    },
  });

  if (dbExperience) {
    const heroImage = resolveHeroImage(dbExperience);
    const heroVideoUrl = asString(dbExperience.heroVideoUrl);
    const heroVideoPoster = asString(dbExperience.heroVideoPoster);

    const storedGallery = asStringArray(dbExperience.gallery);
    const gallery =
      storedGallery.length > 0
        ? storedGallery
        : [heroImage];

    const scenes360 = asScenes(dbExperience.scenes360);

    const editorialEyebrow =
      asString(dbExperience.editorialEyebrow) ||
      "Perspectiva editorial";

    const editorialTitle =
      asString(dbExperience.editorialTitle);

    const sideEyebrow =
      asString(dbExperience.sideEyebrow) ||
      "La experiencia";

    const sideTitle =
      asString(dbExperience.sideTitle);

    const sideText =
      asString(dbExperience.sideText);

    const sideHighlights =
      asStringArray(dbExperience.sideHighlights);

    const shortText =
      asString(dbExperience.shortDescription);

    const longText =
      asString(dbExperience.longDescription);

    const category =
      asString(dbExperience.category) || "Experience";

    const partner = dbExperience.partner;

    const ctaLabel =
      asString(dbExperience.ctaLabel);

    const ctaHref =
      asString(dbExperience.ctaHref);

    return (
      <main className="min-h-screen bg-[#070707] text-white">
        <section className="relative h-[92vh] min-h-[720px] w-full overflow-hidden">
          {heroVideoUrl ? (
            <SeamlessVideoHero
              src={heroVideoUrl}
              poster={heroVideoPoster || heroImage}
            />
          ) : (
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url("${heroImage}")`,
              }}
            />
          )}

          <div className="absolute inset-0 bg-black/32" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/18 via-black/22 to-[#070707]" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#070707] to-transparent" />

          <div className="relative mx-auto flex h-full max-w-6xl flex-col justify-end px-6 pb-16 md:px-10 md:pb-24">
            <Link
              href="/#experiences"
              className="mb-8 text-[10px] uppercase tracking-[0.34em] text-white/65 transition hover:text-white"
            >
              Volver a experiencias
            </Link>

            <p className="text-[10px] uppercase tracking-[0.4em] text-white/55">
              {category}
            </p>

            <h1 className="mt-4 max-w-4xl text-5xl font-light leading-[0.95] md:text-7xl">
              {dbExperience.name}
            </h1>

            {shortText ? (
              <p className="mt-7 max-w-2xl text-base leading-relaxed text-white/82 md:text-lg">
                {shortText}
              </p>
            ) : null}
          </div>
        </section>

        {gallery.length > 0 ? (
          <section className="border-b border-white/8 px-6 py-16 md:px-10 md:py-20">
            <div className="mx-auto max-w-6xl">
              <p className="text-[10px] uppercase tracking-[0.4em] text-white/46">
                Galería editorial
              </p>

              <div className="mt-8 grid gap-4 md:grid-cols-2">
                {gallery.map((image, index) => (
                  <div
                    key={`${image}-${index}`}
                    className={`overflow-hidden ${
                      index === 0 && gallery.length > 2
                        ? "md:col-span-2"
                        : ""
                    }`}
                  >
                    <img
                      src={image}
                      alt=""
                      className={`w-full object-cover ${
                        index === 0 && gallery.length > 2
                          ? "h-[420px] md:h-[620px]"
                          : "h-[320px] md:h-[420px]"
                      }`}
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {scenes360.length > 0 ? (
          <section className="border-b border-white/8 px-6 py-16 md:px-10 md:py-20">
            <div className="mx-auto max-w-6xl">
              <div className="mb-8">
                <p className="text-[10px] uppercase tracking-[0.4em] text-white/46">
                  Experiencia 360
                </p>

                <h2 className="mt-4 text-3xl font-light md:text-4xl">
                  Explorar el espacio
                </h2>
              </div>

              <Viewer360Carousel
                scenes={scenes360}
                initialTab="360"
              />
            </div>
          </section>
        ) : null}

        {editorialTitle ? (
          <section className="border-b border-white/8 px-6 py-16 md:px-10 md:py-24">
            <div className="mx-auto max-w-5xl">
              <p className="text-[10px] uppercase tracking-[0.4em] text-white/46">
                {editorialEyebrow}
              </p>

              <h2 className="mt-6 max-w-4xl whitespace-pre-line text-3xl font-light leading-tight md:text-5xl">
                {editorialTitle}
              </h2>
            </div>
          </section>
        ) : null}

        {(longText ||
          sideTitle ||
          sideText ||
          sideHighlights.length > 0) ? (
          <section className="border-b border-white/8 px-6 py-16 md:px-10 md:py-24">
            <div className="mx-auto grid max-w-6xl gap-16 md:grid-cols-[1.1fr_0.9fr]">
              <div>
                {longText ? (
                  <>
                    <p className="text-[10px] uppercase tracking-[0.34em] text-white/48">
                      La experiencia
                    </p>

                    <div className="mt-6 max-w-3xl whitespace-pre-line text-sm leading-8 text-white/78 md:text-base">
                      {longText}
                    </div>
                  </>
                ) : null}
              </div>

              {(sideTitle ||
                sideText ||
                sideHighlights.length > 0) ? (
                <div className="rounded-[30px] border border-white/12 bg-[#111111] p-10 md:p-12">
                  <p className="text-[10px] uppercase tracking-[0.34em] text-white/45">
                    {sideEyebrow}
                  </p>

                  {sideTitle ? (
                    <h3 className="mt-5 text-3xl font-light leading-tight">
                      {sideTitle}
                    </h3>
                  ) : null}

                  {sideText ? (
                    <p className="mt-6 text-sm leading-8 text-white/72">
                      {sideText}
                    </p>
                  ) : null}

                  {sideHighlights.length > 0 ? (
                    <ul className="mt-8 space-y-3 text-sm text-white/72">
                      {sideHighlights.map((item) => (
                        <li
                          key={item}
                          className="border-t border-white/8 pt-3"
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              ) : null}
            </div>
          </section>
        ) : null}

        {partner ? (
          <section className="border-b border-white/8 px-6 py-16 md:px-10 md:py-20">
            <div className="mx-auto flex max-w-6xl flex-col justify-between gap-8 rounded-[30px] border border-white/10 bg-white/[0.02] p-8 md:flex-row md:items-end md:p-10">
              <div className="max-w-2xl">
                <p className="text-[10px] uppercase tracking-[0.34em] text-white/42">
                  Dónde vivir esta experiencia
                </p>

                <h3 className="mt-4 text-3xl font-light leading-tight md:text-4xl">
                  {partner.name}
                </h3>

                {partner.shortDescription ? (
                  <p className="mt-5 text-sm leading-8 text-white/70 md:text-base">
                    {partner.shortDescription}
                  </p>
                ) : null}
              </div>

              <Link
                href={`/partners/${partner.slug}`}
                className="inline-flex border border-white/15 px-6 py-3 text-[10px] uppercase tracking-[0.32em] transition hover:border-white/30 hover:bg-white hover:text-black"
              >
                Conocer el lugar
              </Link>
            </div>
          </section>
        ) : null}

      </main>
    );
  }

  /*
   * Compatibilidad temporal:
   * mientras las Experiences antiguas sigan viviendo en FALLBACK,
   * conservamos sus URLs públicas sin mezclarlas con las nuevas
   * Experiences administrables.
   */
  const fallbackExperiences = await getPublicExperiences();

  const item = fallbackExperiences.find(
    (entry) =>
      entry.slug === slug ||
      normalize(entry.title) === slug
  );

  if (!item) {
    notFound();
  }

  const heroImage = resolveHeroImage({
    coverImage: item.coverImage,
  });

  const gallery = getFallbackGallery(slug, heroImage);

  return (
    <main className="min-h-screen bg-[#070707] text-white">
      <section className="relative h-[92vh] min-h-[720px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url("${heroImage}")`,
          }}
        />

        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/18 via-black/25 to-[#070707]" />

        <div className="relative mx-auto flex h-full max-w-6xl flex-col justify-end px-6 pb-16 md:px-10 md:pb-24">
          <Link
            href="/#experiences"
            className="mb-8 text-[10px] uppercase tracking-[0.34em] text-white/65"
          >
            Volver a experiencias
          </Link>

          <p className="text-[10px] uppercase tracking-[0.4em] text-white/55">
            {item.eyebrow}
          </p>

          <h1 className="mt-4 max-w-4xl text-5xl font-light leading-[0.95] md:text-7xl">
            {item.title}
          </h1>

          {item.text ? (
            <p className="mt-7 max-w-2xl text-base leading-relaxed text-white/82 md:text-lg">
              {item.text}
            </p>
          ) : null}
        </div>
      </section>

      <section className="px-6 py-16 md:px-10 md:py-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-[10px] uppercase tracking-[0.4em] text-white/46">
            Galería editorial
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {gallery.map((image, index) => (
              <img
                key={`${image}-${index}`}
                src={image}
                alt=""
                className="h-[320px] w-full object-cover md:h-[420px]"
              />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
