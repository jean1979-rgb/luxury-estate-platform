export const dynamic = "force-dynamic";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCasaDePlayaProperties } from "@/utils/catalog/properties";

import { prisma } from "@/lib/prisma";
import { getPublicPartners } from "@/lib/public-partners";
import SeamlessVideoHero from "@/components/SeamlessVideoHero";
import Viewer360Carousel from "@/components/Viewer360Carousel";

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

  const heroVideoUrl =
    "heroVideoUrl" in partner &&
    typeof partner.heroVideoUrl === "string"
      ? partner.heroVideoUrl
      : "";

  const heroVideoPoster =
    "heroVideoPoster" in partner &&
    typeof partner.heroVideoPoster === "string"
      ? partner.heroVideoPoster
      : "";

  const fallbackGallery = getPartnerGallery(slug, heroImage);

  const storedGallery =
    "gallery" in partner && Array.isArray(partner.gallery)
      ? partner.gallery.filter(
          (item): item is string =>
            typeof item === "string" && item.length > 10
        )
      : [];

  const gallery = [
    ...storedGallery,
    ...fallbackGallery.filter((item) => !storedGallery.includes(item)),
  ].slice(0, 4);

  type PartnerScene360 = {
    id: string;
    title?: string;
    image: string;
    thumbnail?: string;
    hotspots?: unknown[];
    initialYaw?: number;
    initialPitch?: number;
  };

  const rawScenes360 =
    "scenes360" in partner && Array.isArray(partner.scenes360)
      ? partner.scenes360
      : [];

  const scenes360: PartnerScene360[] = rawScenes360.flatMap(
    (scene): PartnerScene360[] => {
      if (!scene || typeof scene !== "object" || Array.isArray(scene)) {
        return [];
      }

      const record = scene as Record<string, unknown>;

      if (
        typeof record.id !== "string" ||
        typeof record.image !== "string" ||
        record.image.length <= 10
      ) {
        return [];
      }

      return [
        {
          id: record.id,
          title:
            typeof record.title === "string"
              ? record.title
              : undefined,
          image: record.image,
          thumbnail:
            typeof record.thumbnail === "string"
              ? record.thumbnail
              : undefined,
          hotspots: Array.isArray(record.hotspots)
            ? record.hotspots
            : [],
          initialYaw:
            typeof record.initialYaw === "number"
              ? record.initialYaw
              : undefined,
          initialPitch:
            typeof record.initialPitch === "number"
              ? record.initialPitch
              : undefined,
        },
      ];
    }
  );

  const relatedResidences = getRelatedResidences(slug, properties);

  const isCeleste = slug === "celeste-beach-house";

  const editorialEyebrow = isCeleste
    ? "Entre el Pacífico y Real Diamante"
    : "Perspectiva editorial";

  const editorialTitle = isCeleste
    ? "Un día de playa que encuentra su propio ritmo."
    : "La presencia no es una amenidad.\nEs parte del valor percibido del destino.";

  const sideEyebrow = isCeleste
    ? "Celeste at a glance"
    : "Presencia dentro de Private Estates";

  const sideTitle = isCeleste
    ? "Playa, alberca, jardín y mesa"
    : "Partner estratégico del destino";

  const sideText = isCeleste
    ? "Celeste reúne distintos momentos del día en un mismo lugar: llegar frente al Pacífico, instalarse junto al mar, nadar, comer y permanecer hasta que baja la luz."
    : "Un partner aquí no es un directorio. Es una presencia curada dentro de una narrativa premium diseñada para elevar deseo, pertenencia y valor percibido alrededor de Acapulco.";

  const residenceText = isCeleste
    ? "Una selección de propiedades cercanas a Real Diamante y Acapulco Diamante, conectadas con una forma de vivir donde el mar y los espacios abiertos forman parte de la experiencia cotidiana."
    : "Estas propiedades no solo destacan por ubicación o arquitectura, sino por cómo se integran con una vida social, visual y hospitalaria como la que Aurora activa dentro de Acapulco.";

  const closingEyebrow = isCeleste
    ? "Real Diamante"
    : "Integración premium";

  const closingTitle = isCeleste
    ? "Una forma natural de vivir Acapulco frente al Pacífico."
    : "Una marca debe sentirse inseparable del destino.";

  const closingText = isCeleste
    ? "Celeste Beach House forma parte del paisaje de Real Diamante: un punto de encuentro entre playa, gastronomía y vida al aire libre dentro de uno de los enclaves residenciales más reconocibles de Acapulco."
    : "Private Estates Mexico construye un ecosistema editorial donde propiedades, experiences y partners se refuerzan entre sí para elevar la conversación del lujo en Acapulco.";

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
        {heroVideoUrl ? (
          <SeamlessVideoHero
            src={heroVideoUrl}
            poster={heroVideoPoster || heroImage}
          />
        ) : (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url("${heroImage}")` }}
          />
        )}
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

            <Viewer360Carousel scenes={scenes360} initialTab="360" />
          </div>
        </section>
      ) : null}

      <section className="border-b border-white/8 px-6 py-16 md:px-10 md:py-24">
        <div className="mx-auto max-w-5xl">
          <p className="text-[10px] uppercase tracking-[0.4em] text-white/46">
            {editorialEyebrow}
          </p>

          <h2 className="mt-6 max-w-4xl whitespace-pre-line text-3xl font-light leading-tight text-white md:text-5xl">
            {editorialTitle}
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
                {sideEyebrow}
              </p>

              <h3 className="mt-5 text-2xl font-light leading-tight">
                {sideTitle}
              </h3>

              <p className="mt-5 text-sm leading-8 text-white/74">
                {sideText}
              </p>

              <div className="mt-8 h-px w-16 bg-white/20" />

              {isCeleste ? (
                <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-4 text-sm leading-7 text-white/74">
                  <p>Playa</p>
                  <p>Albercas</p>
                  <p>Gastronomía</p>
                  <p>Jardín</p>
                  <p>Ambiente familiar</p>
                  <p>Pet friendly</p>
                </div>
              ) : (
                <div className="mt-8 space-y-4 text-sm leading-7 text-white/74">
                  <p>— Escena social y hospitalidad</p>
                  <p>— Integración con experiences</p>
                  <p>— Posicionamiento premium del destino</p>
                </div>
              )}
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

          {isCeleste ? (
            <div className="flex flex-col justify-center p-10 md:p-12">
              <div className="max-w-2xl">
                <p className="text-[10px] uppercase tracking-[0.34em] text-white/48">
                  Un día en Celeste
                </p>

                <h3 className="mt-4 text-3xl font-light leading-tight md:text-4xl">
                  Del desayuno frente al mar a la última luz de la tarde.
                </h3>

                <p className="mt-5 text-sm leading-8 text-white/74 md:text-base">
                  La experiencia cambia naturalmente a lo largo del día: playa y
                  alberca por la mañana, una mesa abierta a los sabores del litoral
                  al mediodía y una tarde que transcurre entre jardín, mar y descanso.
                </p>
              </div>
            </div>
          ) : (
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
          )}
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
              {residenceText}
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
              {closingEyebrow}
            </p>

            <h3 className="mt-4 text-3xl font-light leading-tight md:text-4xl">
              {closingTitle}
            </h3>

            <p className="mt-5 text-sm leading-8 text-white/74 md:text-base">
              {closingText}
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
