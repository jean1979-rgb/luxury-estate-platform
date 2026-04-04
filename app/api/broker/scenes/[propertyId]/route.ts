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

  const count = await replaceScenes(propertyId, Array.isArray(body?.scenes) ? body.scenes : []);
  return NextResponse.json({ ok: true, count });
}
