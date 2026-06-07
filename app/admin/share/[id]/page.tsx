export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import SharePropertyForm from "@/components/admin/SharePropertyForm";
import { prisma } from "@/lib/prisma";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminSharePropertyPage({ params }: PageProps) {
  const { id } = await params;

  const property = await prisma.brokerProperty.findUnique({
    where: { id },
  });

  if (!property) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] px-6 py-10 text-white md:px-10">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/admin/properties"
          className="inline-flex border border-white/20 px-4 py-2 text-xs uppercase tracking-[0.22em] text-white/70 transition hover:bg-white hover:text-black"
        >
          ← Volver al Office
        </Link>

        <div className="mt-10">
          <p className="text-[10px] uppercase tracking-[0.34em] text-white/35">
            Compartir propiedad
          </p>
          <h1 className="mt-3 text-4xl font-light text-white">
            Enviar propiedad por correo
          </h1>
          <p className="mt-4 text-sm leading-7 text-white/60">
            Envía una presentación elegante de la propiedad con imagen principal, datos clave y enlace público.
          </p>
        </div>

        <div className="mt-8">
          <SharePropertyForm
            propertyId={property.id}
            propertyTitle={property.title}
            propertyLocation={property.location}
            propertyPrice={property.price}
            propertyCurrency={property.currency}
            propertyCoverImage={property.coverImage}
          />
        </div>
      </div>
    </main>
  );
}
