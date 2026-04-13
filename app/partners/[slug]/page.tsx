export const dynamic = "force-dynamic";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCasaDePlayaProperties } from "@/utils/catalog/properties";

import { prisma } from "@/lib/prisma";
import { getPublicPartners } from "@/lib/public-partners";

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function resolveHeroImage(partner: unknown) {
  if (
    partner &&
    typeof partner === "object" &&
    "coverImage" in partner &&
    typeof partner.coverImage === "string" &&
    partner.coverImage.length > 10
  ) {
    return partner.coverImage;
  }

  return "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=2000&q=80";
}

function getPartnerGallery(slug: string, heroImage: string) {
  const map: Record<string, string[]> = {
    "aurora-bay-house": [
      heroImage,
      "https://images.unsplash.com/photo-1613553507747-5f8d62ad5904?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1621275471769-e6aa344546d5?auto=format&fit=crop&w=1600&q=80",
    ],
    "aman-essentials": [
      heroImage,
      "https://image-tc.galaxy.tf/wijpeg-1h8a7vg10icm5swuzifnpcgnh/spa-40.jpg",
      "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=1600&q=80",
    ],
    "marina-signature": [
      heroImage,
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1600&q=80",
    ],
    zibu: [
      heroImage,
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1600&q=80",
    ],
  };

  const fallback = [
    heroImage,
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80",
  ];

  return (map[slug] || fallback).slice(0, 4);
}

type RelatedProperty = {
  id: string;
  title?: string;
  location?: string;
  coverImage?: string;
};

function getRelatedResidences(slug: string, properties: RelatedProperty[]) {
  const acapulco = properties.filter((item: any) => typeof item.location === "string");

  if (slug === "aurora-bay-house") {
    const ranked = [
      ...acapulco.filter((item: any) =>
        (item.location || "").toLowerCase().includes("diamante")
      ),
      ...acapulco.filter((item: any) =>
        (item.location || "").toLowerCase().includes("brisas")
      ),
      ...acapulco.filter((item: any) =>
        (item.location || "").toLowerCase().includes("playa")
      ),
      ...acapulco,
    ];

    const seen = new Set<string>();
    return ranked
      .filter((item: any) => {
        if (!item.id || seen.has(item.id)) return false;
        seen.add(item.id);
        return true;
      })
      .slice(0, 3);
  }

  return acapulco.slice(0, 3);
}

export default async function PartnerDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const dbPartner = await prisma.publicPartner.findFirst({
    where: { slug, isVisible: true },
  });

  const fallbackPartner = (await getPublicPartners()).find(
    (entry) => entry.slug === slug || normalize(entry.name) === slug
  );

  const properties = await getCasaDePlayaProperties();
  const partner = dbPartner || fallbackPartner;

  if (!partner) notFound();

  const heroImage = resolveHeroImage(partner);
  const gallery = getPartnerGallery(slug, heroImage);
  const relatedResidences = getRelatedResidences(slug, properties);

  const category =
    "category" in partner && typeof partner.category === "string"
      ? partner.category
      : "Luxury Partner";

  const name =
    "name" in partner && typeof partner.name === "string" ? partner.name : "";

  const shortText =
    "shortDescription" in partner &&
    typeof partner.shortDescription === "string" &&
    partner.shortDescription
      ? partner.shortDescription
      : "note" in partner && typeof partner.note === "string"
        ? partner.note
        : "";

  const longText =
    "longDescription" in partner &&
    typeof partner.longDescription === "string" &&
    partner.longDescription
      ? partner.longDescription
      : "";

  return (
    <main className="min-h-screen bg-[#070707] text-white">
      <section className="relative h-[92vh] min-h-[720px] w-full overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url("${heroImage}")` }}
        />
        <div className="absolute inset-0 bg-black/32" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/18 via-black/22 to-[#070707]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#070707] to-transparent" />

        <div className="relative mx-auto flex h-full max-w-6xl flex-col justify-end px-6 pb-16 md:px-10 md:pb-24">
          <Link
            href="/#partners"
            className="mb-8 text-[10px] uppercase tracking-[0.34em] text-white/65 transition hover:text-white"
          >
            Volver a partners
          </Link>

          <p className="text-[10px] uppercase tracking-[0.4em] text-white/55">
            {category}
          </p>

          <h1 className="mt-4 max-w-4xl text-5xl font-light leading-[0.95] md:text-7xl">
            {name}
          </h1>

          {shortText ? (
            <p className="mt-7 max-w-2xl text-base leading-relaxed text-white/82 md:text-lg">
              {shortText}
            </p>
          ) : null}
        </div>
      </section>

      <section className="border-b border-white/8 px-6 py-12 md:px-10 md:py-16">
        <div className="mx-auto max-w-6xl">
          <p className="text-[10px] uppercase tracking-[0.4em] text-white/46">
            Galería editorial
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-[1.35fr_0.65fr]">
            <div
              className="min-h-[520px] bg-cover bg-center rounded-[30px]"
              style={{ backgroundImage: `url("${gallery[0]}")` }}
            />
            <div className="grid gap-4">
              <div
                className="min-h-[252px] bg-cover bg-center rounded-[30px]"
                style={{ backgroundImage: `url("${gallery[1]}")` }}
              />
              <div className="grid gap-4 md:grid-cols-2">
                <div
                  className="min-h-[252px] bg-cover bg-center rounded-[30px]"
                  style={{ backgroundImage: `url("${gallery[2]}")` }}
                />
                <div
                  className="min-h-[252px] bg-cover bg-center rounded-[30px]"
                  style={{ backgroundImage: `url("${gallery[3]}")` }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-white/8 px-6 py-16 md:px-10 md:py-24">
        <div className="mx-auto max-w-5xl">
          <p className="text-[10px] uppercase tracking-[0.4em] text-white/46">
            Perspectiva editorial
          </p>

          <h2 className="mt-6 max-w-4xl text-3xl font-light leading-tight text-white md:text-5xl">
            La presencia no es una amenidad.
            <br />
            Es parte del valor percibido del destino.
          </h2>
        </div>
      </section>

      <section className="border-b border-white/8 px-6 py-16 md:px-10 md:py-24">
        <div className="mx-auto grid max-w-6xl gap-16 md:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-[10px] uppercase tracking-[0.34em] text-white/48">
              Lectura editorial
            </p>

            {longText ? (
              <div className="mt-6 max-w-3xl whitespace-pre-line text-sm leading-8 text-white/78 md:text-base">
                {longText}
              </div>
            ) : (
              <div className="mt-6 max-w-3xl space-y-6 text-sm leading-8 text-white/78 md:text-base">
                <p>
                  Aurora Bay House funciona como una capa de lifestyle dentro de
                  Acapulco: una dirección donde la vista, la hospitalidad, el deporte
                  y la escena social elevan la percepción del destino.
                </p>
                <p>
                  Aquí, la alberca infinity, las canchas de pádel, el restaurante y el
                  bar no operan como amenidades aisladas, sino como parte de una
                  narrativa aspiracional que extiende el valor residencial.
                </p>
              </div>
            )}
          </div>

          <div className="relative overflow-hidden border border-white/12 bg-[#111111] rounded-[30px] p-10 md:p-12">
            <div
              className="absolute inset-0 bg-cover bg-center opacity-20"
              style={{ backgroundImage: `url("${gallery[1]}")` }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/50 to-black/70" />
            <div className="relative">
              <p className="text-[10px] uppercase tracking-[0.34em] text-white/48">
                Presencia dentro de Private Estates
              </p>

              <h3 className="mt-5 text-2xl font-light leading-tight">
                Partner estratégico del destino
              </h3>

              <p className="mt-5 text-sm leading-8 text-white/74">
                Un partner aquí no es un directorio. Es una presencia curada dentro de
                una narrativa premium diseñada para elevar deseo, pertenencia y valor
                percibido alrededor de Acapulco.
              </p>

              <div className="mt-8 h-px w-16 bg-white/20" />

              <div className="mt-8 space-y-4 text-sm leading-7 text-white/74">
                <p>— Escena social y hospitalidad</p>
                <p>— Integración con experiences</p>
                <p>— Posicionamiento premium del destino</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-white/8 px-6 py-16 md:px-10 md:py-20">
        <div className="mx-auto grid max-w-6xl overflow-hidden border border-white/12 bg-[#101010] rounded-[30px] md:grid-cols-[1.1fr_0.9fr]">
          <div
            className="min-h-[320px] bg-cover bg-center"
            style={{ backgroundImage: `url("${gallery[2]}")` }}
          />
          <div className="flex flex-col justify-between p-10 md:p-12">
            <div className="max-w-2xl">
              <p className="text-[10px] uppercase tracking-[0.34em] text-white/48">
                Experience relacionada
              </p>

              <h3 className="mt-4 text-3xl font-light leading-tight md:text-4xl">
                Aurora Sunset Social
              </h3>

              <p className="mt-5 text-sm leading-8 text-white/74 md:text-base">
                Una narrativa de atardecer, ritmo social y vida frente a la bahía que
                convierte a Aurora en una experiencia, no solo en un lugar.
              </p>
            </div>

            <div className="mt-8">
              <Link
                href="/experiences/aurora-sunset-social"
                className="inline-flex border border-white/15 px-6 py-3 text-[10px] uppercase tracking-[0.32em] text-white transition hover:border-white/30 hover:bg-white hover:text-black"
              >
                Explorar experience
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-white/8 px-6 py-16 md:px-10 md:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <p className="text-[10px] uppercase tracking-[0.34em] text-white/46">
              Residencias
            </p>

            <h2 className="mt-4 text-3xl font-light md:text-4xl">
              Residencias alineadas con este lifestyle
            </h2>

            <p className="mt-5 text-sm leading-8 text-white/74 md:text-base">
              Estas propiedades no solo destacan por ubicación o arquitectura, sino
              por cómo se integran con una vida social, visual y hospitalaria como la
              que Aurora activa dentro de Acapulco.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
            {relatedResidences.map((item: any) => (
              <Link
                key={item.id}
                href={`/properties/${item.id}`}
                className="group relative flex min-h-[360px] overflow-hidden rounded-[28px] border border-white/12"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition duration-700 group-hover:scale-105"
                  style={{
                    backgroundImage: `url("${
                      item.coverImage && item.coverImage.length > 10
                        ? item.coverImage
                        : gallery[3]
                    }")`,
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/72 via-black/28 to-transparent" />

                <div className="relative mt-auto p-6">
                  <p className="text-[10px] uppercase tracking-[0.34em] text-white/48">
                    Residencia relacionada
                  </p>

                  <h3 className="mt-3 text-xl font-light leading-snug">
                    {item.title || "Private Residence"}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-white/70">
                    {item.location || "Acapulco"}
                  </p>

                  <div className="mt-6 inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.28em] text-white/62">
                    <span>Explorar propiedad</span>
                    <span className="transition group-hover:translate-x-1">→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-16 md:px-10 md:py-24">
        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-8 border border-white/12 bg-[#111111] rounded-[30px] p-10 md:flex-row md:items-end md:p-12">
          <div className="max-w-2xl">
            <p className="text-[10px] uppercase tracking-[0.34em] text-white/48">
              Integración premium
            </p>

            <h3 className="mt-4 text-3xl font-light leading-tight md:text-4xl">
              Una marca debe sentirse inseparable del destino.
            </h3>

            <p className="mt-5 text-sm leading-8 text-white/74 md:text-base">
              Private Estates Mexico construye un ecosistema editorial donde
              propiedades, experiences y partners se refuerzan entre sí para elevar
              la conversación del lujo en Acapulco.
            </p>
          </div>

          <Link
            href="/#partners"
            className="inline-flex border border-white/15 px-6 py-3 text-[10px] uppercase tracking-[0.32em] text-white transition hover:border-white/30 hover:bg-white hover:text-black"
          >
            Volver a partners
          </Link>
        </div>
      </section>
    </main>
  );
}
