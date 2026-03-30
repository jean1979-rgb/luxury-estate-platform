import Link from "next/link";
import LoginForm from "@/components/auth/LoginForm";

export default function BrokerLoginPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-[#f5f1eb]">
      <section className="relative min-h-screen overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/uploads/properties/sample-villa-diamante/cover/img-20260206-140512380-hdr-1774378789479.jpg"
            alt="Acceso brokers"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/70" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/70" />
        </div>

        <div className="relative z-10 mx-auto grid min-h-screen max-w-7xl items-center gap-10 px-6 py-10 md:grid-cols-[1.1fr_0.9fr] md:px-10">
          <div className="max-w-2xl">
            <p className="text-[10px] uppercase tracking-[0.4em] text-[#e7d1a1]">
              Broker Access
            </p>
            <h1 className="mt-5 text-5xl font-light leading-[0.95] text-white md:text-7xl">
              Acceso privado
              <br />
              para brokers
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-white/78 md:text-xl">
              Gestiona tu inventario premium, importa propiedades y publica dentro de tu destino asignado.
            </p>

            <div className="mt-8">
              <Link
                href="/"
                className="border border-white/20 px-4 py-2 text-xs uppercase tracking-[0.22em] text-white transition hover:bg-white hover:text-black"
              >
                Volver al portal
              </Link>
            </div>
          </div>

          <div className="border border-white/15 bg-black/40 p-6 backdrop-blur-md md:p-8">
            <p className="text-[10px] uppercase tracking-[0.34em] text-white/45">
              Iniciar sesión
            </p>
            <h2 className="mt-4 text-3xl font-light text-white">
              Entrar al backoffice
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-white/65">
              Usa tu email y contraseña de broker.
            </p>

            <div className="mt-6">
              <LoginForm />
            </div>

            <p className="mt-6 text-sm text-white/60">
              ¿No tienes cuenta?{" "}
              <Link href="/broker/register" className="text-white underline underline-offset-4">
                Crear cuenta broker
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
