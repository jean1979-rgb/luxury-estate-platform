import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slugify";

async function getBrokerContext(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { brokerProfile: true },
  });

  if (!user || !user.brokerProfile) return null;

  return {
    user,
    profile: user.brokerProfile,
  };
}

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_req: Request, context: RouteContext) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, message: "No autenticado." }, { status: 401 });
  }

  const { id } = await context.params;

  const item = await prisma.brokerProperty.findFirst({
    where: {
      id,
      ownerBrokerId: session.user.id,
    },
  });

  if (!item) {
    return NextResponse.json({ ok: false, message: "Propiedad no encontrada." }, { status: 404 });
  }

  return NextResponse.json({ ok: true, item });
}

export async function PATCH(req: Request, context: RouteContext) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, message: "No autenticado." }, { status: 401 });
  }

  const ctx = await getBrokerContext(session.user.id);

  if (!ctx) {
    return NextResponse.json({ ok: false, message: "Broker no encontrado." }, { status: 404 });
  }

  const { id } = await context.params;

  const existing = await prisma.brokerProperty.findFirst({
    where: {
      id,
      ownerBrokerId: session.user.id,
    },
  });

  if (!existing) {
    return NextResponse.json({ ok: false, message: "Propiedad no encontrada." }, { status: 404 });
  }

  const body = await req.json();
  const isTokko = existing.sourceProvider === "TOKKO";

  const title = String(body?.title || "").trim();
  const description = String(body?.description || "").trim();
  const tagline = String(body?.tagline || "").trim();
  const location = isTokko
    ? existing.location ?? ""
    : String(body?.location || "").trim();
  const propertyType = isTokko
    ? existing.propertyType ?? ""
    : String(body?.propertyType || "").trim();
  const price = isTokko
    ? existing.price ?? ""
    : String(body?.price || "").trim();
  const currency = String(body?.currency || existing.currency || "MXN").trim() || "MXN";
  const coverImage = String(body?.coverImage || "").trim();

  const bedrooms = isTokko
    ? existing.bedrooms
    : body?.bedrooms === "" || body?.bedrooms === undefined || body?.bedrooms === null
      ? null
      : Number.parseInt(String(body.bedrooms), 10);

  const bathrooms = isTokko
    ? existing.bathrooms
    : body?.bathrooms === "" || body?.bathrooms === undefined || body?.bathrooms === null
      ? null
      : Number.parseInt(String(body.bathrooms), 10);

  const areaInterior =
    body?.areaInterior === "" || body?.areaInterior === undefined || body?.areaInterior === null
      ? null
      : Number.parseFloat(String(body.areaInterior));

  const areaTotal =
    body?.areaTotal === "" || body?.areaTotal === undefined || body?.areaTotal === null
      ? null
      : Number.parseFloat(String(body.areaTotal));

  const featured = body?.featured === true;
  const published = body?.published === true;
  const status = published ? "published" : "draft";
  const publicationStatus = published ? "PUBLISHED" : "DRAFT";

  if (!title) {
    return NextResponse.json({ ok: false, message: "El título es obligatorio." }, { status: 400 });
  }

  let slug = existing.slug;

  if (title !== existing.title) {
    let baseSlug = slugify(title);
    if (!baseSlug) baseSlug = `property-${Date.now()}`;

    let candidate = baseSlug;
    let counter = 1;

    while (
      await prisma.brokerProperty.findFirst({
        where: {
          ownerBrokerId: session.user.id,
          slug: candidate,
          NOT: { id: existing.id },
        },
        select: { id: true },
      })
    ) {
      counter += 1;
      candidate = `${baseSlug}-${counter}`;
    }

    slug = candidate;
  }

  const updated = await prisma.brokerProperty.update({
    where: { id: existing.id },
    data: {
      title,
      slug,
      status,
      publicationStatus,
      propertyType: propertyType || null,
      city: ctx.profile.city,
      location: location || null,
      price: price || null,
      currency,
      bedrooms: typeof bedrooms === "number" && Number.isNaN(bedrooms) ? null : bedrooms,
      bathrooms: typeof bathrooms === "number" && Number.isNaN(bathrooms) ? null : bathrooms,
      areaInterior: Number.isNaN(areaInterior as number) ? null : areaInterior,
      areaTotal: Number.isNaN(areaTotal as number) ? null : areaTotal,
      coverImage: coverImage || null,
      tagline: tagline || null,
      description: description || null,
      featured,
      published,
    },
  });

  return NextResponse.json({ ok: true, item: updated });
}
