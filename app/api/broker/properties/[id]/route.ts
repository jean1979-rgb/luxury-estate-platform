import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getBrokerProperty,
  updateBrokerProperty,
  deleteBrokerProperty,
} from "@/lib/services/properties";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, message: "No autenticado." }, { status: 401 });
  }

  const { id } = await context.params;
  const item = await getBrokerProperty(session.user.id, id);

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

  const { id } = await context.params;
  const body = await req.json();

  try {
    const item = await updateBrokerProperty(session.user.id, id, body);

    if (!item) {
      return NextResponse.json({ ok: false, message: "Propiedad no encontrada." }, { status: 404 });
    }

    return NextResponse.json({ ok: true, item });
  } catch (error) {
    const message = error instanceof Error ? error.message : "PATCH_FAILED";
    return NextResponse.json({ ok: false, message }, { status: 400 });
  }
}

export async function DELETE(_: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, message: "No autenticado." }, { status: 401 });
  }

  const { id } = await context.params;
  const deletedId = await deleteBrokerProperty(session.user.id, id);

  if (!deletedId) {
    return NextResponse.json({ ok: false, message: "Propiedad no encontrada." }, { status: 404 });
  }

  return NextResponse.json({ ok: true, deletedId });
}
