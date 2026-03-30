import Link from "next/link";
import RegisterBrokerForm from "@/components/auth/RegisterBrokerForm";

export default function BrokerRegisterPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-[#f5f1eb]">
      <section className="relative min-h-screen overflow-hidden">
        <div className="absolute inset-0 bg-[#0a0a0a]" />
        <div className="relative z-10 mx-auto grid min-h-screen max-w-7xl items-center gap-10 px-6 py-10 md:grid-cols-[1.05fr_0.95fr] md:px-10">
          <div className="max-w-2xl">
            <p className="text-[10px] uppercase tracking-[0.4em] text-[#e7d1a1]">
              Private Estates Mexico
            </p>
            <h1 className="mt-5 text-5xl font-light leading-[0.95] text-white md:text-7xl">
              Crea tu cuenta
              <br />
              broker
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-white/78 md:text-xl">
              Da de alta tu acceso privado y prepara tu inventario premium para publicarlo en la plataforma.
            </p>

            <div className="mt-8">
              <Link
                href="/broker/login"
                className="border border-white/20 px-4 py-2 text-xs uppercase tracking-[0.22em] text-white transition hover:bg-white hover:text-black"
              >
                Ya tengo cuenta
              </Link>
            </div>
          </div>

          <div className="border border-white/15 bg-black/40 p-6 md:p-8">
            <p className="text-[10px] uppercase tracking-[0.34em] text-white/45">
              Alta broker
            </p>
            <h2 className="mt-4 text-3xl font-light text-white">
              Registro inicial
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-white/65">
              Más adelante conectaremos Tokko por broker; hoy dejamos lista la cuenta y el panel privado.
            </p>

            <div className="mt-6">
              <RegisterBrokerForm />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
