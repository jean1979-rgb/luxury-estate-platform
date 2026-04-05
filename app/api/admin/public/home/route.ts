import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const item = await prisma.publicHome.findFirst({
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(
    item ?? {
      heroEyebrow: "",
      heroTitle: "",
      heroSubtitle: "",
      heroPrimaryCtaLabel: "",
      heroPrimaryCtaHref: "",
      heroSecondaryCtaLabel: "",
      heroSecondaryCtaHref: "",
      heroBackgroundImage: "",
      destinationsTitle: "",
      destinationsSubtitle: "",
      partnersTitle: "",
      partnersSubtitle: "",
      experiencesTitle: "",
      experiencesSubtitle: "",
    }
  );
}

export async function POST(req: Request) {
  const body = await req.json();

  const existing = await prisma.publicHome.findFirst({
    orderBy: { updatedAt: "desc" },
  });

  const data = {
    heroEyebrow: body.heroEyebrow ?? "",
    heroTitle: body.heroTitle ?? "",
    heroSubtitle: body.heroSubtitle ?? "",
    heroPrimaryCtaLabel: body.heroPrimaryCtaLabel ?? "",
    heroPrimaryCtaHref: body.heroPrimaryCtaHref ?? "",
    heroSecondaryCtaLabel: body.heroSecondaryCtaLabel ?? "",
    heroSecondaryCtaHref: body.heroSecondaryCtaHref ?? "",
    heroBackgroundImage: body.heroBackgroundImage ?? "",
    destinationsTitle: body.destinationsTitle ?? "",
    destinationsSubtitle: body.destinationsSubtitle ?? "",
    partnersTitle: body.partnersTitle ?? "",
    partnersSubtitle: body.partnersSubtitle ?? "",
    experiencesTitle: body.experiencesTitle ?? "",
    experiencesSubtitle: body.experiencesSubtitle ?? "",
  };

  const saved = existing
    ? await prisma.publicHome.update({
        where: { id: existing.id },
        data,
      })
    : await prisma.publicHome.create({
        data,
      });

  return NextResponse.json(saved);
}
