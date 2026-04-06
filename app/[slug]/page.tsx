import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

type Params = Promise<{
  slug: string;
}>;

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
    },
  });

  if (!destination) {
    notFound();
  }

  const title =
    destination.heroTitle?.trim() || destination.name;

  const subtitle =
    destination.heroSubtitle?.trim() ||
    destination.overviewBody?.trim() ||
    "Luxury destination experience.";

  const overviewTitle =
    destination.overviewTitle?.trim() || "Overview";

  const overviewBody =
    destination.overviewBody?.trim() ||
    "Curated destination page powered from the public CMS.";

  const thesisTitle =
    destination.thesisTitle?.trim() || "Editorial Thesis";

  const thesisBody =
    destination.thesisBody?.trim() ||
    "This destination is now connected to the public CMS and ready for richer editorial sections.";

  const primaryCtaLabel =
    destination.primaryCtaLabel?.trim() || "Volver al inicio";

  const primaryCtaHref =
    destination.primaryCtaHref?.trim() || "/";

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

        <section className="mt-10 max-w-5xl">
          <p className="text-[10px] uppercase tracking-[0.38em] text-white/45">
            {destination.heroEyebrow?.trim() || "Destination"}
          </p>

          <h1 className="mt-4 text-4xl font-light md:text-6xl">
            {title}
          </h1>

          <p className="mt-5 max-w-3xl text-sm leading-7 text-white/65 md:text-lg">
            {subtitle}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={primaryCtaHref}
              className="inline-flex border border-white bg-white px-5 py-3 text-[11px] uppercase tracking-[0.24em] text-black transition hover:opacity-90"
            >
              {primaryCtaLabel}
            </Link>

            {destination.secondaryCtaLabel?.trim() && destination.secondaryCtaHref?.trim() ? (
              <Link
                href={destination.secondaryCtaHref}
                className="inline-flex border border-white/20 px-5 py-3 text-[11px] uppercase tracking-[0.24em] text-white transition hover:bg-white hover:text-black"
              >
                {destination.secondaryCtaLabel}
              </Link>
            ) : null}
          </div>
        </section>

        <section className="mt-14 grid gap-6 lg:grid-cols-2">
          <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-7">
            <p className="text-[10px] uppercase tracking-[0.34em] text-white/35">
              {overviewTitle}
            </p>

            <p className="mt-4 text-sm leading-7 text-white/70 md:text-base">
              {overviewBody}
            </p>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-7">
            <p className="text-[10px] uppercase tracking-[0.34em] text-white/35">
              {thesisTitle}
            </p>

            <p className="mt-4 text-sm leading-7 text-white/70 md:text-base">
              {thesisBody}
            </p>
          </div>
        </section>

        <section className="mt-14">
          <div className="max-w-3xl">
            <p className="text-[10px] uppercase tracking-[0.35em] text-white/35">
              Lifestyle pillars
            </p>

            <h2 className="mt-3 text-2xl font-light md:text-4xl">
              Narrative blocks for this destination
            </h2>
          </div>

          {destination.lifestylePillars.length > 0 ? (
            <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {destination.lifestylePillars.map((pillar) => (
                <article
                  key={pillar.id}
                  className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6"
                >
                  <h3 className="text-xl font-light text-white">
                    {pillar.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-white/65">
                    {pillar.body || "Lifestyle pillar ready for editorial copy."}
                  </p>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-[28px] border border-white/10 bg-white/[0.03] p-6 text-white/60">
              Aún no hay lifestyle pillars cargados para este destino.
            </div>
          )}
        </section>

        <section className="mt-14 grid gap-6 lg:grid-cols-2">
          <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-7">
            <p className="text-[10px] uppercase tracking-[0.34em] text-white/35">
              Partners
            </p>

            {destination.partners.length > 0 ? (
              <div className="mt-5 space-y-4">
                {destination.partners.map(({ id, partner }) => (
                  <div key={id} className="border-b border-white/10 pb-4 last:border-b-0 last:pb-0">
                    <p className="text-lg font-light text-white">{partner.name}</p>
                    <p className="mt-1 text-sm text-white/55">
                      {partner.category || "Luxury Partner"}
                    </p>
                    <p className="mt-2 text-sm leading-7 text-white/65">
                      {partner.shortDescription || partner.longDescription || "Partner ready for editorial enrichment."}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-5 text-sm leading-7 text-white/60">
                Aún no hay partners relacionados a este destino.
              </p>
            )}
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-7">
            <p className="text-[10px] uppercase tracking-[0.34em] text-white/35">
              Experiences
            </p>

            {destination.experiences.length > 0 ? (
              <div className="mt-5 space-y-4">
                {destination.experiences.map(({ id, experience }) => (
                  <div key={id} className="border-b border-white/10 pb-4 last:border-b-0 last:pb-0">
                    <p className="text-lg font-light text-white">{experience.name}</p>
                    <p className="mt-1 text-sm text-white/55">
                      {experience.category || "Experience"}
                    </p>
                    <p className="mt-2 text-sm leading-7 text-white/65">
                      {experience.shortDescription || experience.longDescription || "Experience ready for editorial enrichment."}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-5 text-sm leading-7 text-white/60">
                Aún no hay experiences relacionadas a este destino.
              </p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
