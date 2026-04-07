import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function PartnerDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const partner = await prisma.publicPartner.findFirst({
    where: { slug, isVisible: true },
  });

  if (!partner) notFound();

  return (
    <main className="min-h-screen bg-black px-6 py-12 text-white md:px-10">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/#partners"
          className="inline-flex border border-white/20 px-4 py-2 text-xs uppercase tracking-[0.22em] text-white transition hover:bg-white hover:text-black"
        >
          Volver
        </Link>

        <section className="mt-10 overflow-hidden rounded-[32px] border border-white/10 bg-[#0f0f0f]">
          {partner.coverImage ? (
            <div
              className="h-[380px] w-full bg-cover bg-center"
              style={{ backgroundImage: `url("${partner.coverImage}")` }}
            />
          ) : null}

          <div className="grid gap-8 px-8 py-10 md:grid-cols-[1.1fr_0.9fr] md:px-10">
            <div>
              <p className="text-[10px] uppercase tracking-[0.38em] text-white/40">
                {partner.category || "Luxury Partner"}
              </p>

              <h1 className="mt-4 text-4xl font-light md:text-6xl">
                {partner.name}
              </h1>

              {partner.shortDescription ? (
                <p className="mt-5 max-w-3xl text-lg leading-8 text-white/68">
                  {partner.shortDescription}
                </p>
              ) : null}

              {partner.longDescription ? (
                <div className="mt-8 max-w-3xl whitespace-pre-line text-sm leading-8 text-white/62 md:text-base">
                  {partner.longDescription}
                </div>
              ) : null}
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-7">
              <p className="text-[10px] uppercase tracking-[0.34em] text-white/38">
                Presence within Private Estates
              </p>

              <h2 className="mt-4 text-2xl font-light">
                Featured destination placement
              </h2>

              <p className="mt-4 text-sm leading-7 text-white/62">
                Esta página muestra cómo puede vivir una marca dentro del ecosistema editorial de Private Estates Mexico:
                narrativa, imagen, contexto de destino y posicionamiento frente a compradores de alto perfil.
              </p>

              {(partner.ctaHref || partner.websiteUrl) ? (
                <a
                  href={partner.ctaHref || partner.websiteUrl || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-8 inline-flex border border-white/20 px-4 py-3 text-[11px] uppercase tracking-[0.24em] text-white transition hover:bg-white hover:text-black"
                >
                  {partner.ctaLabel || "Explorar partner"}
                </a>
              ) : null}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
