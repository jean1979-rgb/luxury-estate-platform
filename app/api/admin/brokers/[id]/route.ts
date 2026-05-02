export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export async function GET(_req: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  const item = await prisma.user.findUnique({
    where: { id },
    include: {
      brokerProfile: true,
    },
  });

  if (!item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { passwordHash, ...safe } = item as any;
  return NextResponse.json(safe);
}

export async function PUT(req: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const body = await req.json();

  const existingUser = await prisma.user.findUnique({
    where: { id },
    include: {
      brokerProfile: true,
    },
  });

  if (!existingUser) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const status = typeof body.status === "string" ? body.status : undefined;
  const approved = typeof body.approved === "boolean" ? body.approved : undefined;
  const canPublish = typeof body.canPublish === "boolean" ? body.canPublish : undefined;
  const tokkoEnabled = typeof body.tokkoEnabled === "boolean" ? body.tokkoEnabled : undefined;

  const tokkoApiKey =
    typeof body.tokkoApiKey === "string"
      ? body.tokkoApiKey
      : body.tokkoApiKey === null
        ? null
        : undefined;

  const city =
    typeof body.city === "string" && body.city.trim()
      ? body.city.trim()
      : undefined;

  const businessName =
    typeof body.businessName === "string" && body.businessName.trim()
      ? body.businessName.trim()
      : undefined;

  const baseName =
    businessName ||
    existingUser.brokerProfile?.businessName ||
    existingUser.name ||
    existingUser.email.split("@")[0] ||
    `broker-${id.slice(0, 8)}`;

  const slug =
    typeof body.slug === "string" && body.slug.trim()
      ? slugify(body.slug.trim())
      : undefined;

  const createSlug =
    slug ||
    existingUser.brokerProfile?.slug ||
    `${slugify(baseName) || "broker"}-${id.slice(0, 8).toLowerCase()}`;

  const createCity = city || existingUser.brokerProfile?.city || "CDMX";
  const createBusinessName = baseName;

  await prisma.user.update({
    where: { id },
    data: {
      status,
    },
  });

  await prisma.brokerProfile.upsert({
    where: {
      userId: id,
    },
    create: {
      userId: id,
      businessName: createBusinessName,
      slug: createSlug,
      city: createCity,
      approved: approved ?? false,
      canPublish: canPublish ?? false,
      tokkoEnabled: tokkoEnabled ?? false,
      tokkoApiKey: tokkoApiKey ?? null,
    },
    update: {
      approved,
      canPublish,
      tokkoEnabled,
      tokkoApiKey,
      businessName,
      slug,
      city,
    },
  });

  const updated = await prisma.user.findUnique({
    where: { id },
    include: {
      brokerProfile: true,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  try {
    const properties = await prisma.brokerProperty.findMany({
      where: { ownerBrokerId: id },
      select: { id: true },
    });

    const propertyIds = properties.map((item) => item.id);

    if (propertyIds.length > 0) {
      const scenes = await prisma.propertyScene360.findMany({
        where: { propertyId: { in: propertyIds } },
        select: { id: true },
      });

      const sceneIds = scenes.map((item) => item.id);

      if (sceneIds.length > 0) {
        await prisma.sceneHotspot.deleteMany({
          where: { sceneId: { in: sceneIds } },
        });
      }

      await prisma.propertyScene360.deleteMany({
        where: { propertyId: { in: propertyIds } },
      });
    }

    await prisma.emailVerificationToken.deleteMany({
      where: { userId: id },
    });

    await prisma.brokerProperty.deleteMany({
      where: { ownerBrokerId: id },
    });

    await prisma.brokerProfile.deleteMany({
      where: { userId: id },
    });

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/admin/brokers/[id]", error);
    return NextResponse.json(
      { ok: false, message: "No se pudo eliminar broker" },
      { status: 500 }
    );
  }
}
