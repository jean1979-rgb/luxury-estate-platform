import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const items = await prisma.publicExperience.findMany({
    orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
  });

  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const body = await req.json();

  const created = await prisma.publicExperience.create({
    data: {
      name: body.name ?? "",
      slug: body.slug ?? "",
      category: body.category ?? "",
      shortDescription: body.shortDescription ?? "",
      longDescription: body.longDescription ?? "",
      coverImage: body.coverImage ?? "",
      ctaLabel: body.ctaLabel ?? "",
      ctaHref: body.ctaHref ?? "",
      isVisible: Boolean(body.isVisible),
      isFeatured: Boolean(body.isFeatured),
      sortOrder: Number(body.sortOrder ?? 0),
    },
  });

  return NextResponse.json(created);
}
