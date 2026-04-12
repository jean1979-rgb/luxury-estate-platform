import { promises as fs } from "fs";
import path from "path";

type TokkoAdminFeedItem = {
  id?: string;
  operationMode?: string;
  base?: {
    price?: string | number | null;
    title?: string;
    locationLabel?: string;
    images?: string[];
  };
  editorial?: {
    title?: string;
  };
  media?: Record<string, unknown>;
  rental?: Record<string, unknown>;
  status?: {
    luxuryEligible?: boolean;
    [key: string]: unknown;
  };
};

function parsePrice(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;

  const cleaned = String(value).replace(/[^\d]/g, "");
  return cleaned ? Number(cleaned) : null;
}

function includeInAdminFeed(item: TokkoAdminFeedItem) {
  const price = parsePrice(item.base?.price);

  if (item.operationMode === "rent") return false;
  if (typeof price === "number") return price >= 15000000;
  return item.status?.luxuryEligible === true;
}

export async function GET() {
  try {
    const file = path.join(process.cwd(), "data/platform/properties.json");
    const raw = await fs.readFile(file, "utf8");
    const parsed: unknown = JSON.parse(raw);
    const json = Array.isArray(parsed) ? (parsed as TokkoAdminFeedItem[]) : [];

    const items = json
      .filter(includeInAdminFeed)
      .map((item: any) => ({
        id: item.id,
        title: item.editorial?.title || item.base?.title || "Propiedad",
        price: item.base?.price ?? "",
        location: item.base?.locationLabel || "",
        coverImage: item.base?.images?.[0] || "",
        operationMode: item.operationMode || "sale",
        base: item.base || {},
        editorial: item.editorial || {},
        media: item.media || {},
        rental: item.rental || {},
        status: item.status || {},
      }));

    return Response.json({ ok: true, items });
  } catch {
    return Response.json({ ok: false, items: [] }, { status: 500 });
  }
}
