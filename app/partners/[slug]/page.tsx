import Link from "next/link";
import { notFound } from "next/navigation";

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

  const partner = dbPartner || fallbackPartner;

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
          {"coverImage" in partner && partner.coverImage ? (
            <div
              className="h-[380px] w-full bg-cover bg-center"
              style={{ backgroundImage: `url("${partner.coverImage}")` }}
            />
          ) : null}

          <div className="grid gap-8 px-8 py-10 md:grid-cols-[1.1fr_0.9fr] md:px-10">
            <div>
              <p className="text-[10px] uppercase tracking-[0.38em] text-white/40">
                {"category" in partner ? partner.category : "Luxury Partner"}
              </p>

              <h1 className="mt-4 text-4xl font-light md:text-6xl">
                {"name" in partner ? partner.name : ""}
              </h1>

              {"shortDescription" in partner && partner.shortDescription ? (
                <p className="mt-5 max-w-3xl text-lg leading-8 text-white/68">
                  {partner.shortDescription}
                </p>
              ) : "note" in partner && partner.note ? (
                <p className="mt-5 max-w-3xl text-lg leading-8 text-white/68">
                  {partner.note}
                </p>
              ) : null}

              {"longDescription" in partner && partner.longDescription ? (
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
                Esta página muestra cómo puede vivir una marca dentro del ecosistema editorial.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
