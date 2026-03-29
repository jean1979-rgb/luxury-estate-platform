import Link from "next/link";
import PropertyCard from "@/components/PropertyCard";
import {
  getAcapulcoRentalProperties,
  getPropertyBadge,
  type PropertyZone,
} from "@/utils/catalog/properties";

function getZoneTitle(zone: PropertyZone) {
  if (zone === "playa") return "Beachfront rentals";
  if (zone === "real-diamante") return "Real Diamante rentals";
  return "Las Brisas private stays";
}

function getZoneDescription(zone: PropertyZone) {
  if (zone === "playa") {
    return "Private stays frente al mar, acceso directo a playa y hospitalidad de alto nivel.";
  }
  if (zone === "real-diamante") {
    return "Estancias privadas dentro de uno de los corredores más aspiracionales de Acapulco.";
  }
  return "Residencias para temporada con privacidad, vistas elevadas y carácter icónico.";
}

type SearchParams = Promise<{
  zone?: string;
}>;

const COLLECTIONS: Array<{
  zone: PropertyZone;
  title: string;
  description: string;
  href: string;
  image: string;
}> = [
  {
    zone: "playa",
    title: "Beachfront rentals",
    description:
      "Oceanfront stays with direct beach access and a strong resort-lifestyle feel.",
    href: "/acapulco/rentals?zone=playa",
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80",
  },
  {
    zone: "real-diamante",
    title: "Real Diamante rentals",
    description:
      "Private homes and short stays in Acapulco’s most exclusive gated enclaves.",
    href: "/acapulco/rentals?zone=real-diamante",
    image:
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=80",
  },
  {
    zone: "las-brisas",
    title: "Las Brisas private stays",
    description:
      "Elevated villas, iconic terraces and private seasonal stays overlooking the bay.",
    href: "/acapulco/rentals?zone=las-brisas",
    image:
      "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1600&q=80",
  },
];

export default async function AcapulcoRentalsPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const properties = await getAcapulcoRentalProperties();
  const params = (await searchParams) ?? {};
  const requestedZone = String(params.zone || "").trim();

  const activeZone = COLLECTIONS.some((item) => item.zone === requestedZone)
    ? (requestedZone as PropertyZone)
    : null;

  const filtered = activeZone
    ? properties.filter((item) => item.zone === activeZone)
    : [];

  return (
    <main className="min-h-screen bg-black px-6 py-12 text-white md:px-10">
      <div className="mx-auto max-w-7xl">
        <p className="text-[10px] uppercase tracking-[0.38em] text-white/45">
          Destination
        </p>

        <h1 className="mt-4 text-4xl font-light md:text-6xl">
          Acapulco Private Rentals
        </h1>

        <p className="mt-4 max-w-3xl text-white/65 md:text-lg">
          Estancias privadas de lujo curadas por zona para una experiencia más boutique y hospitalidad de alto nivel.
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <Link
            href="/acapulco"
            className="group relative overflow-hidden rounded-[30px] border border-white/12 bg-white px-7 py-8 text-black transition hover:scale-[1.01] hover:shadow-[0_20px_80px_rgba(255,255,255,0.08)]"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-[#f3eee6]" />
            <div className="relative">
              <p className="text-[10px] uppercase tracking-[0.34em] text-black/45">
                Primary Collection
              </p>
              <h2 className="mt-3 text-3xl font-light md:text-4xl">
                Residencias en venta
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-7 text-black/65 md:text-base">
                Patrimonio, inversión y second home en las zonas más exclusivas de Acapulco.
              </p>
              <div className="mt-6 inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.28em] text-black/55">
                <span>Explorar venta</span>
                <span className="transition group-hover:translate-x-1">→</span>
              </div>
            </div>
          </Link>

          <Link
            href="/acapulco/rentals"
            className="group relative overflow-hidden rounded-[30px] border border-white/12 bg-white/[0.04] px-7 py-8 text-white transition hover:scale-[1.01] hover:border-white/20 hover:bg-white/[0.07]"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] via-transparent to-white/[0.02]" />
            <div className="relative">
              <p className="text-[10px] uppercase tracking-[0.34em] text-white/38">
                Active Collection
              </p>
              <h2 className="mt-3 text-3xl font-light md:text-4xl">
                Private rentals
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-7 text-white/60 md:text-base">
                Estancias curadas, temporada y hospitalidad privada con una narrativa más boutique.
              </p>
              <div className="mt-6 inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.28em] text-white/45">
                <span>Explorar rentals</span>
                <span className="transition group-hover:translate-x-1">→</span>
              </div>
            </div>
          </Link>
        </div>

        {!activeZone && (
          <div className="mt-14">
            <div className="max-w-3xl">
              <p className="text-[10px] uppercase tracking-[0.35em] text-white/35">
                Collections
              </p>

              <h2 className="mt-3 text-2xl font-light md:text-4xl">
                Explore rentals by collection
              </h2>

              <p className="mt-3 text-sm leading-7 text-white/55 md:text-base">
                Curated private stays across the most exclusive zones of Acapulco.
              </p>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {COLLECTIONS.map((item) => (
                <Link
                  key={item.zone}
                  href={item.href}
                  className="group relative flex min-h-[340px] overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.03]"
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center transition duration-700 group-hover:scale-105"
                    style={{ backgroundImage: `url("${item.image}")` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/10" />
                  <div className="relative mt-auto p-7 md:p-8">
                    <p className="text-[10px] uppercase tracking-[0.34em] text-white/45">
                      Signature collection
                    </p>

                    <h3 className="mt-3 text-2xl font-light md:text-3xl">
                      {item.title}
                    </h3>

                    <p className="mt-3 max-w-xl text-sm leading-7 text-white/65 md:text-base">
                      {item.description}
                    </p>

                    <div className="mt-6 inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.28em] text-white/55">
                      <span>Explorar colección</span>
                      <span className="transition group-hover:translate-x-1">→</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {activeZone && (
          <section className="mt-16">
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="max-w-3xl">
                <p className="text-[10px] uppercase tracking-[0.35em] text-white/35">
                  Results
                </p>

                <h2 className="mt-3 text-2xl font-light md:text-4xl">
                  {getZoneTitle(activeZone)}
                </h2>

                <p className="mt-3 text-sm leading-7 text-white/55 md:text-base">
                  {getZoneDescription(activeZone)}
                </p>
              </div>

              <Link
                href="/acapulco/rentals"
                className="inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.28em] text-white/55 transition hover:text-white"
              >
                <span>Volver a colecciones</span>
                <span>←</span>
              </Link>
            </div>

            {filtered.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {filtered.map((p) => (
                  <PropertyCard
                    key={p.id}
                    id={p.id}
                    title={p.title}
                    location={p.location}
                    image={p.coverImage}
                    badge={getPropertyBadge(p)}
                    eyebrow="Private Rental"
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-[28px] border border-white/10 bg-white/[0.03] px-6 py-10 text-white/60">
                No hay rentals publicadas todavía en esta colección.
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
