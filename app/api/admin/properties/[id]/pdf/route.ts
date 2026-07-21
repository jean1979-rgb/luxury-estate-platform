import { NextResponse } from "next/server";
import { renderEditorialPdf } from "@/lib/pdf/engine/renderer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function GET(
  request: Request,
  context: PageProps,
) {
  return renderEditorialPdf(request, context);
}
