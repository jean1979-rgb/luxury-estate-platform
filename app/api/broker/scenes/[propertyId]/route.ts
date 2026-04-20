export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextRequest, NextResponse } from "next/server";
import { getScenes, replaceScenes } from "@/lib/services/scenes";

type RouteContext = {
  params: Promise<{ propertyId: string }>;
};

export async function GET(_: NextRequest, context: RouteContext) {
  const { propertyId } = await context.params;
  const scenes = await getScenes(propertyId);
  return NextResponse.json({ ok: true, scenes });
}

export async function POST(req: NextRequest, context: RouteContext) {
  const { propertyId } = await context.params;
  const body = await req.json();
  console.log("DEBUG_SCENES_ROUTE_BODY", JSON.stringify(body, null, 2));

  const count = await replaceScenes(propertyId, Array.isArray(body?.scenes) ? body.scenes : []);
  return NextResponse.json({ ok: true, count });
}
