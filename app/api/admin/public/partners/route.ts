export const dynamic = "force-dynamic";
export const revalidate = 0;

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const items = await prisma.publicPartner.findMany({
    orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
  });

  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const body = await req.json();

  const created = await prisma.publicPartner.create({
    data: {
      name: body.name ?? "",
      slug: body.slug ?? "",
      category: body.category ?? "",
      shortDescription: body.shortDescription ?? "",
      longDescription: body.longDescription ?? "",
      logoUrl: body.logoUrl ?? "",
      coverImage: body.coverImage ?? "",
      heroVideoUrl: body.heroVideoUrl ?? "",
      heroVideoPoster: body.heroVideoPoster ?? "",
      gallery: Array.isArray(body.gallery) ? body.gallery : [],
      scenes360: Array.isArray(body.scenes360) ? body.scenes360 : [],
      editorialEyebrow: body.editorialEyebrow ?? "",
      editorialTitle: body.editorialTitle ?? "",
      sideEyebrow: body.sideEyebrow ?? "",
      sideTitle: body.sideTitle ?? "",
      sideText: body.sideText ?? "",
      sideHighlights: Array.isArray(body.sideHighlights)
        ? body.sideHighlights
        : [],
      websiteUrl: body.websiteUrl ?? "",
      ctaLabel: body.ctaLabel ?? "",
      ctaHref: body.ctaHref ?? "",
      isVisible: Boolean(body.isVisible),
      isFeatured: Boolean(body.isFeatured),
      sortOrder: Number(body.sortOrder ?? 0),
    },
  });

  return NextResponse.json(created);
}
