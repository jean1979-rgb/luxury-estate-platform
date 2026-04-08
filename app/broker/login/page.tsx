import Link from "next/link";
import LoginForm from "@/components/auth/LoginForm";

export default function BrokerLoginPage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <div className="mx-auto max-w-2xl px-6 py-12">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-white/40">
              Broker
            </p>
            <h1 className="mt-2 text-3xl font-light tracking-[0.08em]">
              Acceso brokers
            </h1>
          </div>

          <Link
            href="/"
            className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white transition hover:bg-white/[0.08]"
          >
            Volver
          </Link>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
