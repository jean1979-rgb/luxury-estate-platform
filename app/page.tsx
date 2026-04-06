import Link from "next/link";
import { getPublicHomeHero } from "@/lib/public-home";
import { getPublicDestinations } from "@/lib/public-destinations";
import { getPublicPartners } from "@/lib/public-partners";
import { getPublicExperiences } from "@/lib/public-experiences";

// destinations now from DB

export default async function HomePage() {
  const hero = await getPublicHomeHero();
  const destinations = await getPublicDestinations();
  const luxuryPartners = await getPublicPartners();
  const experiences = await getPublicExperiences();

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-[#f5f1eb]">
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0">
          <img
            src={hero.heroBackgroundImage}
            alt={hero.heroEyebrow}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/55" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/55" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/70" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-6 py-8 md:px-10 md:py-10">
          <div className="flex items-center justify-between border-b border-white/10 pb-5">
            <div>
              <p className="text-[11px] uppercase tracking-[0.38em] text-white/55">
                Private Estates Mexico
              </p>
            </div>

            <nav className="hidden items-center gap-6 md:flex">
              <a href={hero.heroPrimaryCtaHref} className="text-sm text-white/78 transition hover:text-white">
                Destinos
              </a>
              <a href="#partners" className="text-sm text-white/78 transition hover:text-white">
                Partners
              </a>
              <a href="#experiences" className="text-sm text-white/78 transition hover:text-white">
                Experiencias
              </a>
              <Link
                href="/broker/login"
                className="text-sm text-white/78 transition hover:text-white"
              >
                Acceso brokers
              </Link>
              <Link
                href="/broker/register"
                className="text-sm text-white/78 transition hover:text-white"
              >
                Crear cuenta
              </Link>
              <Link
                href={hero.heroSecondaryCtaHref}
                className="border border-white/20 px-4 py-2 text-xs uppercase tracking-[0.22em] text-white transition hover:bg-white hover:text-black"
              >
                Entrar a {hero.featuredDestinationName}
              </Link>
            </nav>
          </div>

          <div className="grid gap-10 py-16 md:grid-cols-[1.15fr_0.85fr] md:py-24">
            <div className="max-w-3xl">
              <p className="text-[10px] uppercase tracking-[0.4em] text-[#e7d1a1]">
                Luxury Real Estate Platform
              </p>

              <h1 className="mt-5 text-5xl font-light leading-[0.95] text-white md:text-7xl">
                {hero.heroTitle}
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/82 md:text-xl">
                {hero.heroSubtitle}
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="#destinations"
                  className="border border-white/30 bg-white/10 px-5 py-3 text-xs uppercase tracking-[0.24em] text-white backdrop-blur-md transition hover:bg-white hover:text-black"
                >
                  {hero.heroPrimaryCtaLabel}
                </a>

                <Link
                  href={hero.featuredDestinationHref}
                  className="border border-white/25 bg-black/25 px-5 py-3 text-xs uppercase tracking-[0.24em] text-white backdrop-blur-md transition hover:bg-white hover:text-black"
                >
                  {hero.heroSecondaryCtaLabel}
                </Link>
              </div>
            </div>

            <div className="md:justify-self-end">
              <div className="border border-white/15 bg-black/35 p-6 backdrop-blur-md md:p-7">
                <p className="text-[10px] uppercase tracking-[0.34em] text-white/45">
                  Qué ofrece la plataforma
                </p>

                <div className="mt-5 grid gap-4">
                  <div className="border-b border-white/10 pb-4">
                    <h3 className="text-xl font-light text-white md:text-2xl">
                      Destinos premium
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/68">
                      Destino destacado: {hero.featuredDestinationName}. {hero.featuredDestinationText}
                    </p>
                  </div>

                  <div className="border-b border-white/10 pb-4">
                    <h3 className="text-xl font-light text-white md:text-2xl">
                      Propiedades de alto valor
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/68">
                      Navegación editorial por destinos publicados, con capa pública conectada a DB y páginas escalables.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-light text-white md:text-2xl">
                      Lifestyle & partnerships
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/68">
                      Publishing, partners, experiences y destino destacado trabajando como un ecosistema aspiracional.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="destinations" className="border-b border-white/10 bg-[#0d0d0d] px-6 py-16 md:px-10 md:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-[10px] uppercase tracking-[0.4em] text-white/40">
              Destinations
            </p>

            <h2 className="mt-4 text-3xl font-light leading-tight md:text-5xl">
              {hero.destinationsTitle}
            </h2>

            <p className="mt-5 max-w-2xl text-white/60 md:text-lg">
              {hero.destinationsSubtitle}
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {destinations.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-black"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition duration-700 group-hover:scale-105"
                  style={{ backgroundImage: `url(${item.image})` }}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />

                <div className="relative p-6">
                  <p className="text-[10px] uppercase tracking-[0.34em] text-[#d8c7a6]">
                    {item.name === hero.featuredDestinationName ? "featured destination" : item.status}
                  </p>

                  <h3 className="mt-4 text-3xl font-light text-white">
                    {item.name}
                  </h3>

                  <p className="mt-4 text-sm leading-relaxed text-white/70">
                    {item.text}
                  </p>

                  <div className="mt-8 inline-flex items-center border border-white/20 px-4 py-2 text-[11px] uppercase tracking-[0.24em] text-white transition group-hover:bg-white group-hover:text-black">
                    Entrar destino
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="partners" className="border-b border-white/10 bg-[#0c0c0c] px-6 py-16 md:px-10 md:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-[10px] uppercase tracking-[0.4em] text-white/40">
              Luxury Partners
            </p>

            <h3 className="mt-4 text-3xl font-light leading-tight md:text-5xl">
              {hero.partnersTitle}
            </h3>

            <p className="mt-5 max-w-2xl text-white/60 md:text-lg">
              {hero.partnersSubtitle}
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {luxuryPartners.map((partner) => (
              <article
                key={partner.name}
                className="border border-white/10 bg-[#101010] p-6 transition hover:bg-[#141414]"
              >
                <p className="text-[10px] uppercase tracking-[0.34em] text-white/45">
                  {partner.category}
                </p>

                <h4 className="mt-4 text-2xl font-light text-white">
                  {partner.name}
                </h4>

                <p className="mt-4 text-sm leading-relaxed text-white/65">
                  {partner.note}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="experiences" className="border-b border-white/10 bg-[#090909] px-6 py-16 md:px-10 md:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 max-w-3xl">
            <p className="text-[10px] uppercase tracking-[0.4em] text-white/40">
              Experiences
            </p>

            <h3 className="mt-4 text-3xl font-light leading-tight md:text-5xl">
              {hero.experiencesTitle}
            </h3>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {experiences.map((item) => (
              <article
                key={item.title}
                className="flex min-h-[320px] flex-col justify-between border border-white/10 bg-[#0f0f0f] p-7"
              >
                <div>
                  <p className="text-[10px] uppercase tracking-[0.34em] text-white/40">
                    {item.eyebrow}
                  </p>

                  <h4 className="mt-4 text-2xl font-light leading-tight">
                    {item.title}
                  </h4>

                  <p className="mt-5 text-sm leading-relaxed text-white/62">
                    {item.text}
                  </p>
                </div>

                <div className="mt-8 h-px w-16 bg-white/20" />
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20 md:px-10">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-[11px] uppercase tracking-[0.4em] text-white/40">
            Filosofía
          </p>

          <h3 className="mt-6 text-3xl font-light leading-relaxed md:text-5xl">
            Primero el destino.
            <br />
            Después la residencia.
            <br />
            Después el estilo de vida.
          </h3>

          <p className="mx-auto mt-6 max-w-3xl text-white/60 md:text-lg">
            Private Estates Mexico debe sentirse como la puerta de entrada al lujo residencial del país, no como un listado mezclado ni como el home de una sola inmobiliaria.
          </p>
        </div>
      </section>
    </main>
  );
}
