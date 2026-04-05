import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const items = await prisma.publicDestination.findMany({
    orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
  });

  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const body = await req.json();

  const created = await prisma.publicDestination.create({
    data: {
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

  return NextResponse.json(created);
}
