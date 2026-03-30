import { auth } from "@/lib/auth";

export default async function BrokerSettingsPage() {
  const session = await auth();

  return (
    <section className="border border-white/10 bg-white/[0.03] p-6">
      <p className="text-[10px] uppercase tracking-[0.34em] text-white/40">
        Configuración
      </p>
      <h2 className="mt-4 text-3xl font-light text-white">
        Perfil broker
      </h2>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="border border-white/10 p-4">
          <div className="text-xs uppercase tracking-[0.24em] text-white/35">
            Nombre
          </div>
          <div className="mt-2 text-white">{session?.user?.name}</div>
        </div>

        <div className="border border-white/10 p-4">
          <div className="text-xs uppercase tracking-[0.24em] text-white/35">
            Email
          </div>
          <div className="mt-2 text-white">{session?.user?.email}</div>
        </div>

        <div className="border border-white/10 p-4">
          <div className="text-xs uppercase tracking-[0.24em] text-white/35">
            Empresa
          </div>
          <div className="mt-2 text-white">
            {session?.user?.businessName || "N/D"}
          </div>
        </div>

        <div className="border border-white/10 p-4">
          <div className="text-xs uppercase tracking-[0.24em] text-white/35">
            Ciudad
          </div>
          <div className="mt-2 text-white">
            {session?.user?.brokerCity || "N/D"}
          </div>
        </div>
      </div>
    </section>
  );
}
