export const dynamic = "force-dynamic";
export const revalidate = 0;

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type Ctx = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, ctx: Ctx) {
  const { id } = await ctx.params;

  const item = await prisma.publicPartner.findUnique({
    where: { id },
  });

  if (!item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(item);
}

export async function PUT(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const body = await req.json();

  const updated = await prisma.publicPartner.update({
    where: { id },
    data: {
      name: body.name ?? "",
      slug: body.slug ?? "",
      category: body.category ?? "",
      shortDescription: body.shortDescription ?? "",
      longDescription: body.longDescription ?? "",
      logoUrl: body.logoUrl ?? "",
      coverImage: body.coverImage ?? "",
      websiteUrl: body.websiteUrl ?? "",
      ctaLabel: body.ctaLabel ?? "",
      ctaHref: body.ctaHref ?? "",
      isVisible: Boolean(body.isVisible),
      isFeatured: Boolean(body.isFeatured),
      sortOrder: Number(body.sortOrder ?? 0),
    },
  });

  return NextResponse.json(updated);
}
