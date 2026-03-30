import Link from "next/link";
import luxuryPartners from "@/data/luxury/luxuryPartners.json";
import experiences from "@/data/luxury/experiences.json";

const destinations = [
  {
    name: "Acapulco",
    href: "/acapulco",
    status: "Live Destination",
    text: "Villas, penthouses, branded residences y propiedades frente al mar en el primer mercado premium activo de la plataforma.",
  },
  {
    name: "Los Cabos",
    href: "#",
    status: "Coming Soon",
    text: "Hospitality real estate, branded living y residencias de ultra lujo en Baja California Sur.",
  },
  {
    name: "Punta Mita",
    href: "#",
    status: "Coming Soon",
    text: "Beachfront estates, golf lifestyle y comunidades privadas orientadas al high-end market.",
  },
  {
    name: "Riviera Maya",
    href: "#",
    status: "Coming Soon",
    text: "Beach clubs, selva, arquitectura sensorial y propiedades curadas para inversión y estilo de vida.",
  },
  {
    name: "CDMX",
    href: "#",
    status: "Coming Soon",
    text: "Luxury urban living, branded towers, serviced residences y zonas prime de la ciudad.",
  },
  {
    name: "Valle de Bravo",
    href: "#",
    status: "Coming Soon",
    text: "Casas de descanso, lago, bosque y lifestyle residencial de alto valor patrimonial.",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-[#f5f1eb]">
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0">
          <img
            src="/uploads/properties/sample-villa-diamante/cover/img-20260206-140512380-hdr-1774378789479.jpg"
            alt="Private Estates Mexico"
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
              <a href="#destinations" className="text-sm text-white/78 transition hover:text-white">
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
                href="/acapulco"
                className="border border-white/20 px-4 py-2 text-xs uppercase tracking-[0.22em] text-white transition hover:bg-white hover:text-black"
              >
                Entrar a Acapulco
              </Link>
            </nav>
          </div>

          <div className="grid gap-10 py-16 md:grid-cols-[1.15fr_0.85fr] md:py-24">
            <div className="max-w-3xl">
              <p className="text-[10px] uppercase tracking-[0.4em] text-[#e7d1a1]">
                Luxury Real Estate Platform
              </p>

              <h1 className="mt-5 text-5xl font-light leading-[0.95] text-white md:text-7xl">
                La entrada al
                <br />
                estilo de vida de lujo
                <br />
                en México
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/82 md:text-xl">
                Un portal inmobiliario premium por destinos, donde la residencia, la ciudad y el lifestyle se presentan como una sola experiencia de alto valor.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="#destinations"
                  className="border border-white/30 bg-white/10 px-5 py-3 text-xs uppercase tracking-[0.24em] text-white backdrop-blur-md transition hover:bg-white hover:text-black"
                >
                  Explorar destinos
                </a>

                <Link
                  href="/acapulco"
                  className="border border-white/25 bg-black/25 px-5 py-3 text-xs uppercase tracking-[0.24em] text-white backdrop-blur-md transition hover:bg-white hover:text-black"
                >
                  Descubrir Acapulco
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
                      Mercados curados como Acapulco, Los Cabos, Punta Mita, Riviera Maya y más.
                    </p>
                  </div>

                  <div className="border-b border-white/10 pb-4">
                    <h3 className="text-xl font-light text-white md:text-2xl">
                      Propiedades de alto valor
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/68">
                      Venta y renta de lujo con media premium, narrativa editorial y experiencia visual superior.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-light text-white md:text-2xl">
                      Lifestyle & partnerships
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/68">
                      La ciudad, las marcas y la residencia como un ecosistema aspiracional, no como un simple listado.
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
              Explora el lujo por ciudad, no por ruido de inventario
            </h2>

            <p className="mt-5 max-w-2xl text-white/60 md:text-lg">
              Cada destino debe sentirse como una experiencia de lujo propia, con propiedades, estilo de vida, hospitalidad, gastronomía, marina, golf, wellness y contexto local.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {destinations.map((item) =>
              item.href === "/acapulco" ? (
                <Link
                  key={item.name}
                  href={item.href}
                  className="group border border-white/10 bg-[#111111] p-6 transition hover:border-white/30 hover:bg-[#151515]"
                >
                  <p className="text-[10px] uppercase tracking-[0.34em] text-[#d8c7a6]">
                    {item.status}
                  </p>

                  <h3 className="mt-4 text-3xl font-light text-white">
                    {item.name}
                  </h3>

                  <p className="mt-4 text-sm leading-relaxed text-white/62">
                    {item.text}
                  </p>

                  <div className="mt-8 inline-flex items-center border border-white/15 px-4 py-2 text-[11px] uppercase tracking-[0.24em] text-white/72 transition group-hover:bg-white group-hover:text-black">
                    Entrar destino
                  </div>
                </Link>
              ) : (
                <div
                  key={item.name}
                  className="border border-white/10 bg-[#101010] p-6"
                >
                  <p className="text-[10px] uppercase tracking-[0.34em] text-white/35">
                    {item.status}
                  </p>

                  <h3 className="mt-4 text-3xl font-light text-white/92">
                    {item.name}
                  </h3>

                  <p className="mt-4 text-sm leading-relaxed text-white/58">
                    {item.text}
                  </p>
                </div>
              )
            )}
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
              Marcas y experiencias que elevan la conversación del lujo
            </h3>

            <p className="mt-5 max-w-2xl text-white/60 md:text-lg">
              La plataforma puede integrar hospitalidad, wellness, diseño, marina, gastronomía, golf, automoción, aviación y otras categorías afines al high-end market.
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
              Contenido editorial para vender el estilo de vida completo
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
