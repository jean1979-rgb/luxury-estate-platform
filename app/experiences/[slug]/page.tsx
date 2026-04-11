import Link from "next/link";
import { notFound } from "next/navigation";

import { getPublicExperiences } from "@/lib/public-experiences";

type Props = {
  params: Promise<{ slug: string }>;
};

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function resolveExperienceHero(item: {
  coverImage?: string;
}) {
  if (item.coverImage && item.coverImage.length > 10) {
    return item.coverImage;
  }

  return "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80";
}

function getExperienceGallery(slug: string, heroImage: string) {
  const map: Record<string, string[]> = {
    "sunset-yacht-escape": [
      heroImage,
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1493558103817-58b2924bce98?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1512100356356-de1b84283e18?auto=format&fit=crop&w=1600&q=80",
    ],
    "hospitalidad-privada-como-extension-del-lujo": [
      heroImage,
      "https://image-tc.galaxy.tf/wijpeg-b96yoft5pgi30004mtfr8wz3t/beach-club-by-la-fisherii-a-3_wide.jpg?crop=0%2C0%2C1920%2C1080",
      "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80",
    ],
    "restaurantes-que-elevan-el-valor-del-destino": [
      heroImage,
      "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1600&q=80",
    ],
    "golf-marina-y-concierge-como-parte-del-cierre": [
      heroImage,
      "https://image-tc.galaxy.tf/wijpeg-5xemuxwzz927gb8vz2u47871j/dsc07371.jpg",
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=1600&q=80",
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

export default async function ExperienceDetailPage({ params }: Props) {
  const { slug } = await params;
  const experiences = await getPublicExperiences();

  const item = experiences.find(
    (entry) => entry.slug === slug || normalize(entry.title) === slug
  );

  if (!item) {
    notFound();
  }

  const heroImage = resolveExperienceHero(item);
  const gallery = getExperienceGallery(slug, heroImage);

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <section className="relative isolate min-h-[88vh] overflow-hidden border-b border-white/10">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url("${heroImage}")` }}
        />
        <div className="absolute inset-0 bg-black/55" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/35 to-[#050505]" />

        <div className="relative mx-auto flex min-h-[88vh] max-w-6xl flex-col justify-end px-6 py-16 md:px-10 md:py-24">
          <Link
            href="/#experiences"
            className="mb-8 text-[10px] uppercase tracking-[0.34em] text-white/60 transition hover:text-white"
          >
            Back to experiences
          </Link>

          <p className="text-[10px] uppercase tracking-[0.4em] text-white/55">
            {item.eyebrow}
          </p>

          <h1 className="mt-5 max-w-4xl text-4xl font-light leading-tight md:text-6xl">
            {item.title}
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/78 md:text-lg">
            {item.text}
          </p>
        </div>
      </section>

      <section className="border-b border-white/10 px-6 py-12 md:px-10 md:py-16">
        <div className="mx-auto max-w-6xl">
          <p className="text-[10px] uppercase tracking-[0.4em] text-white/40">
            Editorial Gallery
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-[1.35fr_0.65fr]">
            <div
              className="min-h-[520px] bg-cover bg-center"
              style={{ backgroundImage: `url("${gallery[0]}")` }}
            />

            <div className="grid gap-4">
              <div
                className="min-h-[252px] bg-cover bg-center"
                style={{ backgroundImage: `url("${gallery[1]}")` }}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <div
                  className="min-h-[252px] bg-cover bg-center"
                  style={{ backgroundImage: `url("${gallery[2]}")` }}
                />

                <div
                  className="min-h-[252px] bg-cover bg-center"
                  style={{ backgroundImage: `url("${gallery[3]}")` }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 px-6 py-16 md:px-10 md:py-24">
        <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="text-[10px] uppercase tracking-[0.34em] text-white/45">
              Overview
            </p>
            <p className="mt-5 max-w-2xl text-sm leading-8 text-white/72 md:text-base">
              Cada experiencia dentro de PRIVATE ESTATES MEXICO debe operar como
              una extensión natural del valor residencial. No solo comunica una
              amenidad; construye una razón emocional y comercial para elegir el
              destino, prolongar la estancia y elevar la percepción de pertenencia.
            </p>
          </div>

          <div className="border border-white/10 bg-white/[0.03] p-8">
            <p className="text-[10px] uppercase tracking-[0.34em] text-white/45">
              Positioning
            </p>
            <ul className="mt-5 space-y-4 text-sm leading-relaxed text-white/72">
              <li>• Lifestyle asset con valor editorial y comercial.</li>
              <li>• Refuerza permanencia, deseo y diferenciación del destino.</li>
              <li>• Puede convertirse en placement premium dentro del ecosistema.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 px-6 py-16 md:px-10 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-[10px] uppercase tracking-[0.34em] text-white/45">
              Lifestyle integration
            </p>
            <h2 className="mt-4 text-3xl font-light leading-tight md:text-5xl">
              El destino se vende mejor cuando la experiencia ya está curada.
            </h2>
            <p className="mt-6 text-sm leading-8 text-white/72 md:text-base">
              Esta pieza debe convivir con propiedades, partners y narrativa de
              destino. El objetivo no es informar: es aumentar deseo, justificar
              precio y fortalecer la sensación de acceso a una vida difícil de replicar.
            </p>
          </div>
        </div>
      </section>

      <section className="px-6 py-16 md:px-10 md:py-24">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 border border-white/10 bg-white/[0.03] p-8 md:flex-row md:items-end md:p-12">
          <div className="max-w-2xl">
            <p className="text-[10px] uppercase tracking-[0.34em] text-white/45">
              Commercial CTA
            </p>
            <h2 className="mt-4 text-3xl font-light leading-tight md:text-4xl">
              Diseñado para vender presencia, no solo tráfico.
            </h2>
            <p className="mt-5 text-sm leading-8 text-white/72 md:text-base">
              El siguiente paso es conectar esta experiencia con destinos,
              propiedades y partners para convertir cada página en una landing
              premium vendible.
            </p>
          </div>

          <Link
            href="/#partners"
            className="border border-white/15 px-6 py-3 text-[10px] uppercase tracking-[0.32em] text-white transition hover:border-white/30 hover:bg-white hover:text-black"
          >
            Explore partners
          </Link>
        </div>
      </section>
    </main>
  );
}
