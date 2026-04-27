export const dynamic = "force-dynamic";
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
      <section className="relative min-h-screen overflow-hidden border-b border-white/10">
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 scale-105 bg-cover bg-center transition duration-[4000ms] ease-out"
            style={{
              backgroundImage: `url("${hero.heroBackgroundImage || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2400&q=90"}")`,
              backgroundPosition: "center center",
              backgroundSize: "cover",
            }}
          />

          <div className="absolute inset-0 bg-black/58" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/88 via-black/58 to-black/72" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/34 via-black/10 to-black/88" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_22%,rgba(214,185,126,0.18),transparent_42%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_45%,rgba(255,255,255,0.08),transparent_35%)]" />
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

          <div className="grid min-h-[calc(100vh-90px)] items-center gap-12 py-20 md:grid-cols-[1.15fr_0.85fr] md:py-28">
            <div className="max-w-3xl">
              <p className="text-[10px] uppercase tracking-[0.4em] text-[#e7d1a1]">
                Luxury Real Estate Platform
              </p>

              <h1 className="mt-5 text-6xl font-light leading-[0.9] tracking-[-0.05em] text-white md:text-8xl xl:text-9xl">
                {hero.heroTitle}
              </h1>

              <p className="mt-8 max-w-3xl text-lg leading-8 text-white/82 md:text-2xl md:leading-9">
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
              <div className="border border-white/15 bg-black/30 p-7 backdrop-blur-xl shadow-[0_20px_80px_rgba(0,0,0,0.6)] md:p-8">
                <p className="text-[10px] uppercase tracking-[0.34em] text-white/45">
                  Qué ofrece la plataforma
                </p>

                <div className="mt-5 grid gap-4">
                  <div className="border-b border-white/10 pb-4">
                    <h3 className="text-xl font-light text-white md:text-2xl">
                      Destinos premium
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/68">
                      Destino destacado: {hero.featuredDestinationName}. Bahía, cultura, gastronomía de costa, naturaleza y residential lifestyle le dan una lectura mucho más rica que la de un simple catálogo.
                    </p>
                  </div>

                  <div className="border-b border-white/10 pb-4">
                    <h3 className="text-xl font-light text-white md:text-2xl">
                      Propiedades de alto valor
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/68">
                      Una capa pública pensada para presentar ciudad, residencia y estilo de vida como una sola narrativa premium, lista para crecer destino por destino.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-light text-white md:text-2xl">
                      Lifestyle & partnerships
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/68">
                      Contenido editorial, partners, experiencias y destino trabajan como un mismo ecosistema aspiracional, no como módulos sueltos.
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

          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {destinations.map((item: any) => (
              <Link
                key={item.name}
                href={item.href}
                className="group relative flex min-h-[390px] overflow-hidden rounded-[34px] border border-white/10 bg-[#050505] shadow-[0_24px_90px_rgba(0,0,0,0.45)] transition hover:-translate-y-1 hover:border-white/25"
              >
                {item.image ? (
                  <div
                    className="absolute inset-0 bg-cover bg-center opacity-80 transition duration-700 group-hover:scale-110 group-hover:opacity-100"
                    style={{ backgroundImage: `url("${item.image}")` }}
                  />
                ) : (
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(214,185,126,0.22),transparent_35%),linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.01))]" />
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/58 to-black/10" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-transparent to-black/25" />

                <div className="relative mt-auto flex min-h-[390px] w-full flex-col justify-end p-7 md:p-8">
                  <p className="text-[10px] uppercase tracking-[0.36em] text-[#e7d1a1]">
                    {item.name === hero.featuredDestinationName ? "featured destination" : item.status}
                  </p>

                  <h3 className="mt-4 text-3xl font-light leading-tight text-white md:text-4xl">
                    {item.name}
                  </h3>

                  <p className="mt-4 max-w-md text-sm leading-7 text-white/74">
                    {item.text}
                  </p>

                  <div className="mt-8 inline-flex w-fit items-center border border-white/25 bg-black/25 px-4 py-2 text-[11px] uppercase tracking-[0.24em] text-white backdrop-blur-md transition group-hover:bg-white group-hover:text-black">
                    Entrar destino
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      
      <section className="relative border-b border-white/10 bg-[#050505] px-6 py-24 md:px-10 md:py-32">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-[10px] uppercase tracking-[0.4em] text-white/40">
              Editorial Perspective
            </p>

            <h2 className="mt-6 text-4xl font-light leading-tight md:text-6xl">
              The destination defines the residence.
              <br />
              The lifestyle defines the value.
            </h2>

            <p className="mt-8 max-w-2xl text-sm leading-8 text-white/60 md:text-base">
              Private Estates Mexico is not a property catalog.
              It is a curated environment where destinations, brands and experiences
              shape the perception of value before a residence is even considered.
            </p>
          </div>

          <div className="mt-16 grid gap-10 md:grid-cols-3">
            <div className="border-t border-white/10 pt-6">
              <p className="text-[10px] uppercase tracking-[0.34em] text-white/40">
                Destination First
              </p>
              <p className="mt-4 text-sm leading-7 text-white/70">
                The emotional decision is made before the property is seen.
              </p>
            </div>

            <div className="border-t border-white/10 pt-6">
              <p className="text-[10px] uppercase tracking-[0.34em] text-white/40">
                Curated Lifestyle
              </p>
              <p className="mt-4 text-sm leading-7 text-white/70">
                Experiences and partners elevate permanence and belonging.
              </p>
            </div>

            <div className="border-t border-white/10 pt-6">
              <p className="text-[10px] uppercase tracking-[0.34em] text-white/40">
                Commercial Ecosystem
              </p>
              <p className="mt-4 text-sm leading-7 text-white/70">
                Every placement is designed to increase perceived value.
              </p>
            </div>
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
              "A curated selection of brands shaping the lifestyle behind each destination."
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {luxuryPartners.map((partner: any) => (
              <Link
                key={partner.name}
                href={`/partners/${partner.slug || partner.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")}`}
                className="group relative block min-h-[320px] overflow-hidden border border-white/10 bg-[#101010] transition hover:border-white/20"
              >
                {partner.coverImage ? (
                  <>
                    <div
                      className="absolute inset-0 bg-cover bg-center transition duration-700 group-hover:scale-110"
                      style={{ backgroundImage: `url("${partner.coverImage}")` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/10" />
                  </>
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-white/[0.06] via-white/[0.02] to-transparent" />
                )}

                <div className="relative flex min-h-[320px] flex-col justify-end p-6">
                  <p className="text-[10px] uppercase tracking-[0.34em] text-white/55">
                    {partner.category}
                  </p>

                  <h4 className="mt-4 text-2xl font-light text-white">
                    {partner.name}
                  </h4>

                  <p className="mt-4 max-w-md text-sm leading-relaxed text-white/72">
                    {partner.note}
                  </p>

                  <div className="mt-6 inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.28em] text-white/55">
                    <span>Enter brand world</span>
                    <span className="transition group-hover:translate-x-1">→</span>
                  </div>
                </div>
              </Link>
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
            {experiences.map((item: any) => (
              <Link
                key={item.slug || item.title}
                href={`/experiences/${item.slug || item.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                className="group relative flex min-h-[360px] flex-col justify-between overflow-hidden border border-white/10 bg-[#0f0f0f] transition hover:border-white/20"
              >
                {item.coverImage ? (
                  <>
                    <div
                      className="absolute inset-0 bg-cover bg-center transition duration-700 group-hover:scale-110"
                      style={{ backgroundImage: `url("${item.coverImage}")` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/92 via-black/58 to-black/24" />
                  </>
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-white/[0.06] via-white/[0.02] to-transparent" />
                )}

                <div className="relative flex min-h-[360px] flex-col justify-between p-7">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.34em] text-white/48">
                      {item.eyebrow}
                    </p>

                    <h4 className="mt-4 text-2xl font-light leading-tight text-white">
                      {item.title}
                    </h4>

                    <p className="mt-5 max-w-md text-sm leading-relaxed text-white/72">
                      {item.text}
                    </p>
                  </div>

                  <div className="mt-8 flex items-center justify-between">
                    <div className="h-px w-16 bg-white/25" />
                    <span className="text-[10px] uppercase tracking-[0.32em] text-white/62 transition group-hover:text-white">
                      Explore experience
                    </span>
                  </div>
                </div>
              </Link>
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
            Private Estates Mexico debe sentirse como una puerta de entrada al lujo residencial por destinos: primero el lugar, luego la residencia y después el estilo de vida completo.
          </p>
        </div>
      </section>
    </main>
  );
}
