import { NextRequest, NextResponse } from "next/server";

const ALLOWED_HOST = "pub-97c7fb12e7244f288f056306452e2d7d.r2.dev";

export async function GET(request: NextRequest) {
  const src = request.nextUrl.searchParams.get("src");

  if (!src) {
    return NextResponse.json(
      { error: "Missing src" },
      { status: 400 }
    );
  }

  let url: URL;

  try {
    url = new URL(src);
  } catch {
    return NextResponse.json(
      { error: "Invalid src" },
      { status: 400 }
    );
  }

  if (url.protocol !== "https:" || url.hostname !== ALLOWED_HOST) {
    return NextResponse.json(
      { error: "Source not allowed" },
      { status: 403 }
    );
  }

  const response = await fetch(url, {
    cache: "no-store",
  });

  if (!response.ok) {
    return NextResponse.json(
      { error: `Upstream returned ${response.status}` },
      { status: 502 }
    );
  }

  const contentType =
    response.headers.get("content-type") || "application/octet-stream";

  return new NextResponse(response.body, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=3600",
    },
  });
}
