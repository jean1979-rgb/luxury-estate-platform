import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCasaDePlayaProperties, getPropertyBadge } from "@/utils/catalog/properties";
import { ACAPULCO_DESTINATION_COPY } from "@/lib/acapulco-editorial";

type Params = Promise<{
  slug: string;
}>;

type EditorialCard = {
  category: string;
  name: string;
  text: string;
};

export default async function PublicDestinationPage({
  params,
}: {
  params: Params;
}) {
  const { slug } = await params;

  const destination = await prisma.publicDestination.findUnique({
    where: { slug },
    include: {
      partners: {
        include: { partner: true },
        orderBy: [{ sortOrder: "asc" }],
      },
      experiences: {
        include: { experience: true },
        orderBy: [{ sortOrder: "asc" }],
      },
      lifestylePillars: {
        where: { isVisible: true },
        orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
      },
      featuredProperties: {
        where: { isVisible: true },
        orderBy: [{ sortOrder: "asc" }],
      },
    },
  });

  if (!destination) {
    notFound();
  }

  const isAcapulco = destination.slug === "acapulco";

  const title =
    destination.heroTitle?.trim() ||
    (isAcapulco ? ACAPULCO_DESTINATION_COPY.heroTitle : destination.name);

  const subtitle =
    destination.heroSubtitle?.trim() ||
    destination.overviewBody?.trim() ||
    (isAcapulco
      ? ACAPULCO_DESTINATION_COPY.heroSubtitle
      : "Luxury destination experience.");

  const overviewTitle =
    destination.overviewTitle?.trim() ||
    (isAcapulco ? ACAPULCO_DESTINATION_COPY.overviewTitle : "Overview");

  const overviewBody =
    destination.overviewBody?.trim() ||
    (isAcapulco
      ? ACAPULCO_DESTINATION_COPY.overviewBody
      : "Curated destination page powered from the public CMS.");

  const thesisTitle =
    destination.thesisTitle?.trim() ||
    (isAcapulco ? ACAPULCO_DESTINATION_COPY.thesisTitle : "Editorial Thesis");

  const thesisBody =
    destination.thesisBody?.trim() ||
    (isAcapulco
      ? ACAPULCO_DESTINATION_COPY.thesisBody
      : "This destination is now connected to the public CMS and ready for richer editorial sections.");

  const primaryCtaLabel =
    destination.primaryCtaLabel?.trim() || "Volver al inicio";

  const primaryCtaHref =
    destination.primaryCtaHref?.trim() || "/";

  const allProperties = await getCasaDePlayaProperties();

  const properties = destination.featuredProperties
    .map((fp: any) => allProperties.find((p) => p.id === fp.propertyId))
    .filter((item: any): item is NonNullable<typeof item> => Boolean(item))
    .slice(0, 6);

  const fallbackPillars = isAcapulco ? ACAPULCO_DESTINATION_COPY.pillars : [];

  const fallbackExperiences: EditorialCard[] = isAcapulco
    ? ACAPULCO_DESTINATION_COPY.experiences
    : [];

  return (
    <main className="min-h-screen bg-black px-6 py-12 text-white md:px-10">
      <div className="mx-auto max-w-[1680px]">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/"
            className="inline-flex border border-white/20 px-4 py-2 text-xs uppercase tracking-[0.22em] text-white transition hover:bg-white hover:text-black"
          >
            Volver al inicio
          </Link>

          <span className="text-[10px] uppercase tracking-[0.34em] text-white/35">
            /{destination.slug}
          </span>
        </div>

        <section
          className="relative mt-10 overflow-hidden rounded-[36px] border border-white/10"
          style={
            destination.heroImage?.trim()
              ? {
                  backgroundImage: `url("${destination.heroImage}")`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }
              : undefined
          }
        >
          <div className="absolute inset-0 bg-black/55" />
          <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/35 to-black/75" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/20" />

          <div className="relative px-7 py-16 md:px-10 md:py-24 xl:px-14 xl:py-28">
            <div className="max-w-5xl">
              <p className="text-[10px] uppercase tracking-[0.38em] text-white/55">
                {destination.heroEyebrow?.trim() ||
                  (isAcapulco ? ACAPULCO_DESTINATION_COPY.heroEyebrow : "Destination")}
              </p>

              <h1 className="mt-4 max-w-4xl text-4xl font-light leading-tight md:text-6xl xl:text-7xl">
                {title}
              </h1>

              <p className="mt-6 max-w-3xl text-sm leading-7 text-white/72 md:text-lg md:leading-8">
                {subtitle}
              </p>

              <div className="mt-10 flex flex-wrap gap-3">
                <Link
                  href={primaryCtaHref}
                  className="inline-flex border border-white bg-white px-5 py-3 text-[11px] uppercase tracking-[0.24em] text-black transition hover:opacity-90"
                >
                  {primaryCtaLabel}
                </Link>

                {destination.secondaryCtaLabel?.trim() && destination.secondaryCtaHref?.trim() ? (
                  <Link
                    href={destination.secondaryCtaHref}
                    className="inline-flex border border-white/20 bg-white/5 px-5 py-3 text-[11px] uppercase tracking-[0.24em] text-white transition hover:bg-white hover:text-black"
                  >
                    {destination.secondaryCtaLabel}
                  </Link>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-20 grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="text-[10px] uppercase tracking-[0.4em] text-white/35">
              {overviewTitle}
            </p>

            <h2 className="mt-4 text-2xl font-light md:text-4xl">
              {title}
            </h2>

            <p className="mt-6 text-sm leading-7 text-white/70 md:text-base">
              {overviewBody}
            </p>
          </div>

          <div className="lg:col-span-7">
            <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-8 md:p-10">
              <p className="text-[10px] uppercase tracking-[0.4em] text-white/35">
                {thesisTitle}
              </p>

              <p className="mt-6 text-lg leading-8 text-white/80 md:text-xl md:leading-9">
                {thesisBody}
              </p>
            </div>
          </div>
        </section>

        <section className="mt-14">
          <div className="max-w-3xl">
            <p className="text-[10px] uppercase tracking-[0.35em] text-white/35">
              Lifestyle pillars
            </p>

            <h2 className="mt-3 text-2xl font-light md:text-4xl">
              {isAcapulco ? "Claves editoriales del destino" : "Narrative blocks for this destination"}
            </h2>
          </div>

          {destination.lifestylePillars.length > 0 || fallbackPillars.length > 0 ? (
            <div className="mt-10 grid gap-10 md:grid-cols-2 xl:grid-cols-3">
              {(destination.lifestylePillars.length > 0
                ? destination.lifestylePillars.map((pillar: any) => ({
                    id: pillar.id,
                    title: pillar.title,
                    body: pillar.body || "Lifestyle pillar ready for editorial copy.",
                  }))
                : fallbackPillars.map((pillar, index) => ({
                    id: `fallback-pillar-${index}`,
                    title: pillar.title,
                    body: pillar.body,
                  }))).map((pillar: any) => (
                <article
                  key={pillar.id}
                  className="group relative overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.04] p-8 transition hover:bg-white/[0.06]"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] via-transparent to-white/[0.02] opacity-0 transition group-hover:opacity-100" />

                  <div className="relative">
                    <p className="text-[10px] uppercase tracking-[0.35em] text-white/35">
                      Editorial block
                    </p>

                    <h3 className="mt-4 text-2xl font-light text-white md:text-3xl">
                      {pillar.title}
                    </h3>

                    <p className="mt-4 text-sm leading-7 text-white/70 md:text-base">
                      {pillar.body}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-[28px] border border-white/10 bg-white/[0.03] p-6 text-white/60">
              Aún no hay lifestyle pillars cargados para este destino.
            </div>
          )}
        </section>

        <section className="mt-18 grid gap-8 lg:grid-cols-2">
          <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-8 md:p-10">
            <p className="text-[10px] uppercase tracking-[0.38em] text-white/35">
              Curated Partners
            </p>

            <h2 className="mt-4 text-2xl font-light md:text-4xl">
              Alianzas que elevan la experiencia del destino
            </h2>

            {destination.partners.length > 0 ? (
              <div className="mt-8 space-y-6">
                {destination.partners.map(({ id, partner }: any) => (
                  <article key={id} className="border-b border-white/10 pb-6 last:border-b-0 last:pb-0">
                    <p className="text-[10px] uppercase tracking-[0.32em] text-white/35">
                      {partner.category || "Luxury Partner"}
                    </p>

                    <h3 className="mt-3 text-2xl font-light text-white">
                      {partner.name}
                    </h3>

                    <p className="mt-3 text-sm leading-7 text-white/68 md:text-base">
                      {partner.shortDescription || partner.longDescription || "Partner ready for editorial enrichment."}
                    </p>
                  </article>
                ))}
              </div>
            ) : (
              <p className="mt-8 text-sm leading-7 text-white/60">
                {isAcapulco
                  ? "Aquí conviene conectar después hospitalidad, wellness, marina, gastronomía, golf y categorías afines al lifestyle premium del destino."
                  : "Aún no hay partners relacionados a este destino."}
              </p>
            )}
          </div>

          <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-8 md:p-10">
            <p className="text-[10px] uppercase tracking-[0.38em] text-white/35">
              Signature Experiences
            </p>

            <h2 className="mt-4 text-2xl font-light md:text-4xl">
              Experiencias pensadas para un estilo de vida excepcional
            </h2>

            {destination.experiences.length > 0 || fallbackExperiences.length > 0 ? (
              <div className="mt-8 space-y-6">
                {(destination.experiences.length > 0
                  ? destination.experiences.map(({ id, experience }: any) => ({
                      id,
                      category: experience.category || "Experience",
                      name: experience.name,
                      text:
                        experience.shortDescription ||
                        experience.longDescription ||
                        "Experience ready for editorial enrichment.",
                    }))
                  : fallbackExperiences.map((experience, index) => ({
                      id: `fallback-experience-${index}`,
                      category: experience.category,
                      name: experience.name,
                      text: experience.text,
                    }))).map((experience: any) => (
                  <article key={experience.id} className="border-b border-white/10 pb-6 last:border-b-0 last:pb-0">
                    <p className="text-[10px] uppercase tracking-[0.32em] text-white/35">
                      {experience.category}
                    </p>

                    <h3 className="mt-3 text-2xl font-light text-white">
                      {experience.name}
                    </h3>

                    <p className="mt-3 text-sm leading-7 text-white/68 md:text-base">
                      {experience.text}
                    </p>
                  </article>
                ))}
              </div>
            ) : (
              <p className="mt-8 text-sm leading-7 text-white/60">
                Aún no hay experiences relacionadas a este destino.
              </p>
            )}
          </div>
        </section>

        <section className="mt-24">
          <div className="max-w-3xl">
            <p className="text-[10px] uppercase tracking-[0.35em] text-white/35">
              Featured Residences
            </p>

            <h2 className="mt-3 text-2xl font-light md:text-4xl">
              Propiedades destacadas en este destino
            </h2>
          </div>

          {properties.length > 0 ? (
            <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {properties.map((p) => (
                <Link
                  key={p.id}
                  href={`/properties/${p.id}`}
                  className="group relative overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.03]"
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center transition duration-700 group-hover:scale-105"
                    style={{ backgroundImage: `url("${p.coverImage}")` }}
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />

                  <div className="relative mt-auto p-6">
                    <p className="text-[10px] uppercase tracking-[0.32em] text-white/45">
                      {getPropertyBadge(p)}
                    </p>

                    <h3 className="mt-3 text-xl font-light text-white">
                      {p.title}
                    </h3>

                    <p className="mt-2 text-sm text-white/60">
                      {p.location}
                    </p>

                    <div className="mt-6 inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.28em] text-white/55">
                      <span>Ver propiedad</span>
                      <span className="transition group-hover:translate-x-1">→</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-[28px] border border-white/10 bg-white/[0.03] p-6 text-white/60">
              El destino ya quedó armado editorialmente; sólo falta publicar las propiedades reales.
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
