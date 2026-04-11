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


function resolveHeroImage(partner: any) {
  if (partner?.coverImage && partner.coverImage.length > 10) {
    return partner.coverImage;
  }
  return "https://image-tc.galaxy.tf/wijpeg-1h8a7vg10icm5swuzifnpcgnh/spa-40.jpg";
}

function getPartnerGallery(slug: string, heroImage: string) {
  const map: Record<string, string[]> = {
    "aurora-bay-house": [
      heroImage,
      "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1613553507747-5f8d62ad5904?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1600&q=80",
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

  const heroImage = resolveHeroImage(partner);
  const gallery = getPartnerGallery(slug, heroImage);

  const category =
    "category" in partner && typeof partner.category === "string"
      ? partner.category
      : "Luxury Partner";

  const name =
    "name" in partner && typeof partner.name === "string" ? partner.name : "";

  const shortText =
    "shortDescription" in partner && typeof partner.shortDescription === "string" && partner.shortDescription
      ? partner.shortDescription
      : "note" in partner && typeof partner.note === "string"
        ? partner.note
        : "";

  const longText =
    "longDescription" in partner && typeof partner.longDescription === "string" && partner.longDescription
      ? partner.longDescription
      : "";

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="relative h-[92vh] min-h-[720px] w-full overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url("${heroImage}")` }}
        />
        <div className="absolute inset-0 bg-black/45" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/35 to-black" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black to-transparent" />

        <div className="relative mx-auto flex h-full max-w-6xl flex-col justify-end px-6 pb-16 md:px-10 md:pb-24">
          <Link
            href="/#partners"
            className="mb-8 text-[10px] uppercase tracking-[0.34em] text-white/65 transition hover:text-white"
          >
            Back
          </Link>

          <p className="text-[10px] uppercase tracking-[0.4em] text-white/55">
            {category}
          </p>

          <h1 className="mt-4 max-w-4xl text-5xl font-light leading-[0.95] md:text-7xl">
            {name}
          </h1>

          {shortText ? (
            <p className="mt-7 max-w-2xl text-base leading-relaxed text-white/78 md:text-lg">
              {shortText}
            </p>
          ) : null}
        </div>
      </section>

      {/* EDITORIAL GALLERY */}
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
        <div className="mx-auto max-w-5xl">
          <p className="text-[10px] uppercase tracking-[0.4em] text-white/40">
            Signature Perspective
          </p>

          <h2 className="mt-6 max-w-4xl text-3xl font-light leading-tight text-white md:text-5xl">
            Presence is not an amenity.
            <br />
            It is part of the destination’s perceived value.
          </h2>
        </div>
      </section>

      <section className="border-b border-white/10 px-6 py-16 md:px-10 md:py-24">
        <div className="mx-auto grid max-w-6xl gap-14 md:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-[10px] uppercase tracking-[0.34em] text-white/42">
              Editorial Overview
            </p>

            {longText ? (
              <div className="mt-6 max-w-3xl whitespace-pre-line text-sm leading-8 text-white/72 md:text-base">
                {longText}
              </div>
            ) : (
              <div className="mt-6 max-w-3xl space-y-6 text-sm leading-8 text-white/72 md:text-base">
                <p>
                  This partner exists within a curated ecosystem where destination,
                  lifestyle and brand presence shape perceived value before a property
                  is even considered.
                </p>
                <p>
                  The objective is not visibility alone. It is to create emotional
                  context, strengthen aspiration and position the brand as part of a
                  larger luxury narrative.
                </p>
              </div>
            )}
          </div>

          <div className="border border-white/10 bg-white/[0.03] p-8 md:p-10">
            <p className="text-[10px] uppercase tracking-[0.34em] text-white/42">
              Presence within Private Estates
            </p>

            <h3 className="mt-5 text-2xl font-light leading-tight">
              Featured destination placement
            </h3>

            <p className="mt-5 text-sm leading-8 text-white/68">
              A partner here is not a listing. It is a strategic placement inside a
              luxury narrative designed to elevate perception, desirability and demand.
            </p>

            <div className="mt-8 h-px w-16 bg-white/20" />

            <div className="mt-8 space-y-4 text-sm leading-7 text-white/68">
              <p>— Destination storytelling</p>
              <p>— Lifestyle integration</p>
              <p>— Premium brand positioning</p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 px-6 py-16 md:px-10 md:py-24">
        <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-[10px] uppercase tracking-[0.34em] text-white/42">
              Commercial Value
            </p>
          </div>

          <div>
            <h3 className="text-3xl font-light leading-tight md:text-5xl">
              Designed to feel editorial.
              <br />
              Built to be commercially premium.
            </h3>

            <p className="mt-6 max-w-2xl text-sm leading-8 text-white/70 md:text-base">
              Every partner page should function as a luxury landing: part brand world,
              part destination narrative, part commercial placement.
            </p>
          </div>
        </div>
      </section>

      <section className="px-6 py-16 md:px-10 md:py-24">
        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-8 border border-white/10 bg-white/[0.03] p-8 md:flex-row md:items-end md:p-12">
          <div className="max-w-2xl">
            <p className="text-[10px] uppercase tracking-[0.34em] text-white/42">
              Premium Placement
            </p>

            <h3 className="mt-4 text-3xl font-light leading-tight md:text-4xl">
              A brand should feel like it belongs here.
            </h3>

            <p className="mt-5 text-sm leading-8 text-white/70 md:text-base">
              Private Estates Mexico is building a destination-first ecosystem where
              residences, experiences and strategic partners reinforce one another.
            </p>
          </div>

          <Link
            href="/#partners"
            className="inline-flex border border-white/15 px-6 py-3 text-[10px] uppercase tracking-[0.32em] text-white transition hover:border-white/30 hover:bg-white hover:text-black"
          >
            Back to partners
          </Link>
        </div>
      </section>
    
      {/* PREMIUM CTA */}
      <section className="px-6 pb-24 md:px-10">
        <div className="mx-auto max-w-6xl border border-white/10 bg-white/[0.03] p-10 md:p-14 flex flex-col md:flex-row justify-between gap-10 items-start md:items-end">

          <div className="max-w-xl">
            <p className="text-[10px] uppercase tracking-[0.34em] text-white/40">
              Private Estates Mexico
            </p>

            <h3 className="mt-4 text-3xl md:text-4xl font-light leading-tight">
              A limited number of brands will be invited to participate.
            </h3>

            <p className="mt-6 text-sm leading-8 text-white/70">
              Each partner is positioned within a curated ecosystem designed to increase perceived value across destinations, experiences and properties.
            </p>
          </div>

          <div>
            <a
              href="mailto:partners@privateestates.mx"
              className="inline-flex border border-white/20 px-6 py-3 text-[10px] uppercase tracking-[0.32em] text-white transition hover:bg-white hover:text-black"
            >
              Request placement
            </a>
          </div>

        </div>
      </section>

</main>
  );
}
