export const dynamic = "force-dynamic";
import Link from "next/link";
import NewBrokerPropertyButton from "@/components/broker/NewBrokerPropertyButton";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import TokkoResyncButton from "@/components/broker/TokkoResyncButton";

export default async function BrokerPropertiesPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const items = await prisma.brokerProperty.findMany({
    where: { ownerBrokerId: session.user.id },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.34em] text-white/40">
            Propiedades
          </p>
          <h2 className="mt-3 text-3xl font-light text-white">
            Inventario del broker
          </h2>
          <p className="mt-2 text-white/60">
            Aquí ves únicamente tus propiedades.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/broker/profile"
            className="inline-flex min-h-10 items-center justify-center border border-white/20 px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-white transition hover:bg-white hover:text-black"
          >
            Mi perfil
          </Link>

          <TokkoResyncButton />

          <NewBrokerPropertyButton />
        </div>
      </div>

      {items.length === 0 ? (
        <div className="border border-dashed border-white/15 bg-white/[0.02] px-6 py-10 text-white/55">
          Aún no tienes propiedades. Crea la primera desde “Nueva propiedad”.
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {items.map((item: any) => (
            <article key={item.id} className="border border-white/10 bg-white/[0.03] p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[10px] uppercase tracking-[0.28em] text-white/35">
                      {item.city}
                    </p>

                    <span className="inline-flex min-h-6 items-center rounded-full border border-white/12 px-2 text-[10px] uppercase tracking-[0.18em] text-white/55">
                      {item.sourceProvider === "TOKKO" ? "Tokko" : "Manual"}
                    </span>
                  </div>

                  <h3 className="mt-2 text-2xl font-light text-white">{item.title}</h3>

                  <p className="mt-2 text-sm text-white/55">
                    {item.propertyType || "Tipo pendiente"} · {item.location || "Ubicación pendiente"}
                  </p>

                  <div className="mt-4 grid gap-2 text-sm text-white/70 md:grid-cols-3">
                    <div>Precio: {item.price || "N/D"} {item.currency || ""}</div>
                    <div>Recámaras: {item.bedrooms ?? "N/D"}</div>
                    <div>Baños: {item.bathrooms ?? "N/D"}</div>
                  </div>

                  {item.tagline ? (
                    <p className="mt-4 text-sm leading-relaxed text-white/68">{item.tagline}</p>
                  ) : null}

                  <div className="mt-5 flex items-center gap-3">
                    <Link
                      href={`/broker/properties/${item.id}/studio`}
                      className="inline-flex min-h-10 items-center justify-center border border-white/20 px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-white transition hover:bg-white hover:text-black"
                    >
                      Editar
                    </Link>
                  </div>
                </div>

                <div className="flex w-[170px] shrink-0 flex-col items-end gap-3">
                  <div className="text-right text-xs uppercase tracking-[0.22em] text-white/45">
                    {item.published ? "Publicado" : "Borrador"}
                  </div>

                  {item.coverImage ? (
                    <img
                      src={item.coverImage}
                      alt={item.title}
                      className="h-[110px] w-full rounded-[16px] border border-white/10 object-cover"
                    />
                  ) : (
                    <div className="flex h-[110px] w-full items-center justify-center rounded-[16px] border border-dashed border-white/10 bg-white/[0.02] text-[11px] uppercase tracking-[0.18em] text-white/30">
                      Sin imagen
                    </div>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
