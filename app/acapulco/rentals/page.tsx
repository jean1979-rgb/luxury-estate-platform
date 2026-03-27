import Link from "next/link";
import PropertyCard from "@/components/PropertyCard";
import { getAcapulcoRentalProperties, getPropertyBadge } from "@/utils/catalog/properties";

function getZoneTitle(zone?: string) {
  if (zone === "playa") return "Beachfront stays";
  if (zone === "real-diamante") return "Diamante private stays";
  if (zone === "las-brisas") return "Las Brisas escapes";
  return "Private stays in Acapulco";
}

function getZoneDescription(zone?: string) {
  if (zone === "playa") {
    return "Residencias y estancias con acceso al mar, vistas abiertas y una experiencia de hospitalidad privada.";
  }
  if (zone === "real-diamante") {
    return "Opciones premium para estancias privadas dentro del corredor más exclusivo y contemporáneo de Diamante.";
  }
  if (zone === "las-brisas") {
    return "Villas y residencias para una estancia elevada, con privacidad, vistas y carácter.";
  }
  return "Una selección curada de private rentals de lujo en Acapulco.";
}

export default async function AcapulcoRentalsPage() {
  const properties = await getAcapulcoRentalProperties();

  const grouped = {
    playa: [] as typeof properties,
    "real-diamante": [] as typeof properties,
    "las-brisas": [] as typeof properties,
    otros: [] as typeof properties,
  };

  for (const p of properties) {
    const zone = (p as any).zone || "otros";
    if (zone === "playa" || zone === "real-diamante" || zone === "las-brisas") {
      grouped[zone].push(p);
    } else {
      grouped.otros.push(p);
    }
  }

  const orderedZones = ["playa", "real-diamante", "las-brisas", "otros"] as const;

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
          Estancias privadas y residencias de lujo para temporada, curadas por zona con una narrativa más cercana a hospitality que a un portal tradicional.
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <Link
            href="/acapulco"
            className="group relative overflow-hidden rounded-[30px] border border-white/12 bg-white/[0.04] px-7 py-8 text-white transition hover:scale-[1.01] hover:border-white/20 hover:bg-white/[0.07]"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] via-transparent to-white/[0.02]" />
            <div className="relative">
              <p className="text-[10px] uppercase tracking-[0.34em] text-white/38">
                Secondary Collection
              </p>
              <h2 className="mt-3 text-3xl font-light md:text-4xl">
                Residencias en venta
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-7 text-white/60 md:text-base">
                Patrimonio, inversión y second home en las zonas más exclusivas de Acapulco.
              </p>
              <div className="mt-6 inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.28em] text-white/45">
                <span>Explorar venta</span>
                <span className="transition group-hover:translate-x-1">→</span>
              </div>
            </div>
          </Link>

          <Link
            href="/acapulco/rentals"
            className="group relative overflow-hidden rounded-[30px] border border-white/12 bg-white px-7 py-8 text-black transition hover:scale-[1.01] hover:shadow-[0_20px_80px_rgba(255,255,255,0.08)]"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-[#f3eee6]" />
            <div className="relative">
              <p className="text-[10px] uppercase tracking-[0.34em] text-black/45">
                Active Collection
              </p>
              <h2 className="mt-3 text-3xl font-light md:text-4xl">
                Private rentals
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-7 text-black/65 md:text-base">
                Estancias curadas, temporada y hospitalidad privada con una narrativa más boutique.
              </p>
              <div className="mt-6 inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.28em] text-black/55">
                <span>Explorar rentals</span>
                <span className="transition group-hover:translate-x-1">→</span>
              </div>
            </div>
          </Link>
        </div>

        <div className="mt-14 space-y-16">
          {orderedZones.map((zone) => {
            const items = grouped[zone];
            if (!items.length) return null;

            return (
              <section key={zone} className="space-y-6">
                <div className="max-w-3xl">
                  <p className="text-[10px] uppercase tracking-[0.35em] text-white/35">
                    Stay Collection
                  </p>

                  <h2 className="mt-3 text-2xl font-light md:text-4xl">
                    {getZoneTitle(zone)}
                  </h2>

                  <p className="mt-3 text-sm leading-7 text-white/55 md:text-base">
                    {getZoneDescription(zone)}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {items.slice(0, 6).map((p) => (
                    <PropertyCard
                      key={p.id}
                      id={p.id}
                      title={p.title}
                      location={p.location}
                      image={p.coverImage}
                      badge={getPropertyBadge(p)}
                      eyebrow="Private Stay"
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </main>
  );
}
