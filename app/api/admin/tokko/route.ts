export const dynamic = "force-dynamic";
export const revalidate = 0;

import { prisma } from "@/lib/prisma";

type TokkoRawItem = {
  id?: number | string;
  publication_title?: string;
  address?: string;
  location?: {
    name?: string;
    full_location?: string;
  };
  operations?: Array<{
    operation_type?: string;
    prices?: Array<{
      price?: number;
      currency?: string;
    }>;
  }>;
  photos?: Array<{
    image?: string;
    original?: string;
    thumb?: string;
  }>;
};

function getSaleOperation(item: TokkoRawItem) {
  return (
    item.operations?.find((operation) =>
      String(operation.operation_type || "")
        .toLowerCase()
        .includes("sale")
    ) ||
    item.operations?.[0] ||
    null
  );
}

function getPrice(item: TokkoRawItem) {
  return getSaleOperation(item)?.prices?.[0]?.price ?? "";
}

function getCurrency(item: TokkoRawItem) {
  return getSaleOperation(item)?.prices?.[0]?.currency || "MXN";
}

function getImages(item: TokkoRawItem) {
  if (!Array.isArray(item.photos)) return [];

  return item.photos
    .map((photo) => photo.image || photo.original || photo.thumb || "")
    .filter(Boolean);
}

function getLocation(item: TokkoRawItem) {
  return (
    item.location?.full_location ||
    item.location?.name ||
    item.address ||
    ""
  );
}

export async function GET() {
  try {
    const profile = await prisma.brokerProfile.findUnique({
      where: {
        userId: "491119aa-ea2d-4593-bb14-5ed404c14848",
      },
      select: {
        tokkoEnabled: true,
        tokkoApiKey: true,
      },
    });

    if (!profile?.tokkoEnabled) {
      return Response.json(
        {
          ok: false,
          items: [],
          error: "Tokko no está habilitado.",
        },
        { status: 400 }
      );
    }

    if (!profile.tokkoApiKey) {
      return Response.json(
        {
          ok: false,
          items: [],
          error: "Tokko API key no configurada.",
        },
        { status: 400 }
      );
    }

    const url =
      "https://www.tokkobroker.com/api/v1/property/" +
      "?lang=es_ar&format=json&limit=200&key=" +
      encodeURIComponent(profile.tokkoApiKey);

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return Response.json(
        {
          ok: false,
          items: [],
          error: `Tokko respondió HTTP ${response.status}.`,
        },
        { status: 502 }
      );
    }

    const payload = await response.json();

    const objects: TokkoRawItem[] = Array.isArray(payload?.objects)
      ? payload.objects
      : [];

    const items = objects.map((item) => {
      const id = String(item.id ?? "");
      const title = item.publication_title || "Propiedad";
      const price = getPrice(item);
      const currency = getCurrency(item);
      const location = getLocation(item);
      const images = getImages(item);

      return {
        id,
        title,
        price,
        location,
        coverImage: images[0] || "",
        operationMode: "sale",
        base: {
          title,
          price,
          currency,
          locationLabel: location,
          images,
        },
        editorial: {
          title,
        },
        media: {},
        rental: {},
        status: {},
      };
    });

    return Response.json({
      ok: true,
      items,
      total: payload?.meta?.total_count ?? items.length,
    });
  } catch (error) {
    console.error("[ADMIN TOKKO GET]", error);

    return Response.json(
      {
        ok: false,
        items: [],
        error:
          error instanceof Error
            ? error.message
            : "Error consultando Tokko.",
      },
      { status: 500 }
    );
  }
}
