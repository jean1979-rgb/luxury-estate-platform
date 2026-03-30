import Link from "next/link";
import { auth } from "@/lib/auth";
import LogoutButton from "@/components/auth/LogoutButton";

export default async function BrokerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] px-6 py-12 text-[#f5f1eb] md:px-10">
        <div className="mx-auto max-w-3xl border border-white/10 bg-white/[0.03] p-8">
          <p className="text-[10px] uppercase tracking-[0.34em] text-white/40">
            Broker Access
          </p>
          <h1 className="mt-4 text-3xl font-light text-white">
            Necesitas iniciar sesión
          </h1>
          <p className="mt-4 text-white/65">
            El acceso broker sigue en configuración. Usa login o vuelve al portal.
          </p>
          <div className="mt-6 flex gap-3">
            <Link href="/broker/login" className="border border-white/20 px-4 py-2 text-xs uppercase tracking-[0.22em] text-white transition hover:bg-white hover:text-black">
              Ir a login
            </Link>
            <Link href="/" className="border border-white/20 px-4 py-2 text-xs uppercase tracking-[0.22em] text-white transition hover:bg-white hover:text-black">
              Volver al portal
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-[#f5f1eb]">
      <div className="mx-auto max-w-7xl px-6 py-6 md:px-10">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <p className="text-[10px] uppercase tracking-[0.38em] text-white/45">
              Broker Backoffice
            </p>
            <h1 className="mt-2 text-2xl font-light text-white">
              {(session.user as any).businessName || session.user.name || "Broker"}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link href="/broker" className="text-sm text-white/78 transition hover:text-white">
              Dashboard
            </Link>
            <Link href="/broker/properties" className="text-sm text-white/78 transition hover:text-white">
              Propiedades
            </Link>
            <Link href="/broker/properties/new" className="text-sm text-white/78 transition hover:text-white">
              Nueva
            </Link>
            <Link href="/broker/settings" className="text-sm text-white/78 transition hover:text-white">
              Configuración
            </Link>
            <LogoutButton />
          </div>
        </div>

        {children}
      </div>
    </main>
  );
}
