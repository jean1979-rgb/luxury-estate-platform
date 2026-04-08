import Link from "next/link";
import { notFound } from "next/navigation";

import { getPublicExperiences } from "@/lib/public-experiences";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function ExperienceDetailPage({ params }: Props) {
  const { slug } = await params;
  const experiences = await getPublicExperiences();
  const item = experiences.find((entry) => 
  entry.slug === slug ||
  entry.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") === slug
);

  if (!item) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <section className="relative isolate overflow-hidden border-b border-white/10">
        {item.coverImage ? (
          <>
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url("${item.coverImage}")` }}
            />
            <div className="absolute inset-0 bg-black/55" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/45 to-[#050505]" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] via-transparent to-transparent" />
        )}

        <div className="relative mx-auto flex min-h-[72vh] max-w-6xl flex-col justify-end px-6 py-16 md:px-10 md:py-24">
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
