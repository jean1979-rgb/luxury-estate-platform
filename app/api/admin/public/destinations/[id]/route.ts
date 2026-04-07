import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type Ctx = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, ctx: Ctx) {
  const { id } = await ctx.params;

  const item = await prisma.publicDestination.findUnique({
    where: { id },
    include: {
      featuredProperties: {
        where: { isVisible: true },
      },
    },
  });

  if (!item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(item);
}

export async function PUT(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const body = await req.json();

  const updated = await prisma.publicDestination.update({
    where: { id },
    data: {
      featuredProperties: {
        deleteMany: {},
        create: (body.featuredProperties || []).map((fp: any, i: number) => ({
          propertyId: fp.propertyId,
          sortOrder: i,
          isVisible: true,
        })),
      },
      name: body.name ?? "",
      slug: body.slug ?? "",
      status: body.status ?? "coming_soon",
      isFeatured: Boolean(body.isFeatured),
      sortOrder: Number(body.sortOrder ?? 0),

      heroEyebrow: body.heroEyebrow ?? "",
      heroTitle: body.heroTitle ?? "",
      heroSubtitle: body.heroSubtitle ?? "",
      heroImage: body.heroImage ?? "",

      overviewTitle: body.overviewTitle ?? "",
      overviewBody: body.overviewBody ?? "",

      thesisTitle: body.thesisTitle ?? "",
      thesisBody: body.thesisBody ?? "",

      primaryCtaLabel: body.primaryCtaLabel ?? "",
      primaryCtaHref: body.primaryCtaHref ?? "",
      secondaryCtaLabel: body.secondaryCtaLabel ?? "",
      secondaryCtaHref: body.secondaryCtaHref ?? "",

      seoTitle: body.seoTitle ?? "",
      seoDescription: body.seoDescription ?? "",
      ogImage: body.ogImage ?? "",
    },
  });

  return NextResponse.json(updated);
}
