import Link from "next/link";
import PropertyCard from "@/components/PropertyCard";
import {
  getAcapulcoRentalProperties,
  getPropertyBadge,
  type PropertyZone,
} from "@/utils/catalog/properties";
import { ACAPULCO_RENTALS_PAGE_COPY } from "@/lib/acapulco-editorial";

function getZoneTitle(zone: PropertyZone) {
  if (zone === "playa") return "Beachfront rentals";
  if (zone === "real-diamante") return "Real Diamante rentals";
  return "Las Brisas private stays";
}

function getZoneDescription(zone: PropertyZone) {
  if (zone === "playa") {
    return "Estancias frente al mar con acceso directo a playa y una experiencia más abierta, solar y resort-lifestyle.";
  }
  if (zone === "real-diamante") {
    return "Estancias privadas dentro del corredor más contemporáneo de Acapulco, con energía actual y vocación premium.";
  }
  return "Temporadas en ladera con privacidad, terrazas amplias y una relación más íntima con la bahía.";
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
}> = ACAPULCO_RENTALS_PAGE_COPY.collections.map((item: any) => ({
  zone: item.zone as PropertyZone,
  title: item.title,
  description: item.description,
  href: `/acapulco/rentals?zone=${item.zone}`,
  image: item.image,
}));

export default async function AcapulcoRentalsPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const properties = await getAcapulcoRentalProperties();
  const params = (await searchParams) ?? {};
  const requestedZone = String(params.zone || "").trim();

  const activeZone = COLLECTIONS.some((item: any) => item.zone === requestedZone)
    ? (requestedZone as PropertyZone)
    : null;

  const filtered = activeZone
    ? properties.filter((item: any) => item.zone === activeZone)
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

        <p className="mt-4 max-w-4xl text-white/65 md:text-lg">
          {ACAPULCO_RENTALS_PAGE_COPY.intro}
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
                {ACAPULCO_RENTALS_PAGE_COPY.saleCard}
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
                {ACAPULCO_RENTALS_PAGE_COPY.rentalsCard}
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
                {ACAPULCO_RENTALS_PAGE_COPY.collectionsTitle}
              </h2>

              <p className="mt-3 text-sm leading-7 text-white/55 md:text-base">
                {ACAPULCO_RENTALS_PAGE_COPY.collectionsSubtitle}
              </p>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {COLLECTIONS.map((item: any) => (
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
                {filtered.map((p: any) => (
                  <PropertyCard
                    key={p.id}
                    id={p.id}
                    slug={p.slug}
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
                {ACAPULCO_RENTALS_PAGE_COPY.emptyState}
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
