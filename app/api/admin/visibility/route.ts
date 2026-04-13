export const dynamic = "force-dynamic";
export const revalidate = 0;

import { promises as fs } from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "data/platform/visibility.json");

export async function GET() {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    const json = JSON.parse(raw);
    return Response.json(json);
  } catch {
    return Response.json({ hiddenIds: [] });
  }
}

export async function POST(req: Request) {
  try {
    const { id } = await req.json();

    let data = { hiddenIds: [] as string[] };

    try {
      const raw = await fs.readFile(filePath, "utf8");
      data = JSON.parse(raw);
    } catch {}

    const set = new Set(data.hiddenIds);

    if (set.has(id)) {
      set.delete(id);
    } else {
      set.add(id);
    }

    const updated = { hiddenIds: Array.from(set) };

    await fs.writeFile(filePath, JSON.stringify(updated, null, 2));

    return Response.json(updated);
  } catch {
    return Response.json({ hiddenIds: [] });
  }
}
