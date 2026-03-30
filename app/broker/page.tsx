import { auth } from "@/lib/auth";

export default async function BrokerDashboardPage() {
  const session = await auth();

  return (
    <section className="grid gap-6 md:grid-cols-3">
      <div className="border border-white/10 bg-white/[0.03] p-6">
        <p className="text-[10px] uppercase tracking-[0.32em] text-white/40">
          Cuenta
        </p>
        <h2 className="mt-4 text-2xl font-light text-white">
          {session?.user?.businessName || session?.user?.name}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-white/62">
          Ciudad asignada: {session?.user?.brokerCity || "Pendiente"}
        </p>
      </div>

      <div className="border border-white/10 bg-white/[0.03] p-6">
        <p className="text-[10px] uppercase tracking-[0.32em] text-white/40">
          Estado
        </p>
        <h2 className="mt-4 text-2xl font-light text-white">
          {session?.user?.status || "ACTIVE"}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-white/62">
          Base lista para inventario, auth y panel broker.
        </p>
      </div>

      <div className="border border-white/10 bg-white/[0.03] p-6">
        <p className="text-[10px] uppercase tracking-[0.32em] text-white/40">
          Próximo paso
        </p>
        <h2 className="mt-4 text-2xl font-light text-white">
          Inventario propio
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-white/62">
          En la siguiente fase conectamos propiedades del broker y Tokko por cuenta.
        </p>
      </div>
    </section>
  );
}
