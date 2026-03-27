import { promises as fs } from "fs";
import path from "path";

function parsePrice(value: any): number | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;

  const cleaned = String(value).replace(/[^\d]/g, "");
  return cleaned ? Number(cleaned) : null;
}

function includeInAdminFeed(item: any) {
  const price = parsePrice(item?.base?.price);

  if (item?.operationMode === "rent") return false;
  if (typeof price === "number") return price >= 15000000;
  return item?.status?.luxuryEligible === true;
}

export async function GET() {
  try {
    const file = path.join(process.cwd(), "data/platform/properties.json");
    const raw = await fs.readFile(file, "utf8");
    const json = JSON.parse(raw);

    const items = Array.isArray(json)
      ? json
          .filter((item: any) => includeInAdminFeed(item))
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
          }))
      : [];

    return Response.json({ ok: true, items });
  } catch (error) {
    return Response.json({ ok: false, items: [] }, { status: 500 });
  }
}
