import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function safeJsonArray(input: any): any[] {
  try {
    return JSON.parse(JSON.stringify(Array.isArray(input) ? input : []));
  } catch {
    return [];
  }
}

export async function POST() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }

    const broker = await prisma.brokerProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!broker?.tokkoApiKey || !broker.tokkoEnabled) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const res = await fetch(
      `https://www.tokkobroker.com/api/v1/property/?lang=es_ar&format=json&limit=200&key=${broker.tokkoApiKey}`,
      { cache: "no-store" }
    );

    const json = await res.json();
    const items = Array.isArray(json?.objects) ? json.objects : [];

    let updated = 0;
    let skipped = 0;

    for (const raw of items) {
      const extId = raw?.id != null ? String(raw.id) : "";

      if (!extId) {
        skipped++;
        continue;
      }

      const existing = await prisma.brokerProperty.findFirst({
        where: {
          ownerBrokerId: session.user.id,
          sourceExternalId: extId,
        },
      });

      if (!existing) {
        skipped++;
        continue;
      }

      const gallery =
        raw?.photos?.map((p: any) => p?.image || p?.url).filter(Boolean) ?? [];

      await prisma.brokerProperty.update({
        where: { id: existing.id },
        data: {
          title: raw?.publication_title || raw?.title || existing.title,
          description: raw?.description || existing.description,
          location: raw?.location?.full_location || existing.location,
          propertyType: raw?.type?.name || existing.propertyType,
          price: raw?.operations?.[0]?.prices?.[0]?.price || existing.price,
          gallery: safeJsonArray(gallery),
          coverImage: gallery[0] || existing.coverImage,
        },
      });

      updated++;
    }

    await prisma.brokerProfile.update({
      where: { id: broker.id },
      data: { tokkoLastSyncAt: new Date() },
    });

    return NextResponse.json({ ok: true, updated, skipped });
  } catch (e) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
