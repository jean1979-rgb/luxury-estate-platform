"use client";

import { useState } from "react";

const FIELDS = ["name", "email", "password", "businessName", "city", "phone"] as const;

export default function BrokerRegisterPage() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    businessName: "",
    city: "",
    phone: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/broker/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Error");

      setMessage("Cuenta creada correctamente. Revisa tu correo para verificar tu cuenta.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  if (!showForm) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
        <section className="w-full max-w-xl rounded-3xl border border-white/10 bg-white/[0.04] p-8 shadow-2xl">
          <p className="mb-4 text-xs uppercase tracking-[0.28em] text-white/45">
            Private Estates México
          </p>

          <h1 className="text-3xl font-light leading-tight">
            Acceso exclusivo para brokers autorizados
          </h1>

          <p className="mt-5 text-base leading-7 text-white/65">
            Para crear una cuenta broker y publicar propiedades en la plataforma,
            primero necesitas ponerte en contacto con nosotros para validar tu acceso.
          </p>

          <div className="mt-8 space-y-3">
            <a
              href="mailto:contacto@privateestatesmexico.com?subject=Solicitud%20de%20acceso%20broker%20Private%20Estates%20M%C3%A9xico"
              className="block w-full rounded-full bg-white px-5 py-4 text-center text-sm font-medium text-black transition hover:bg-white/90"
            >
              Contactar a Private Estates México
            </a>

            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="w-full rounded-full border border-white/15 px-5 py-4 text-sm text-white/70 transition hover:border-white/35 hover:text-white"
            >
              Ya tengo autorización
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6 py-12">
      <form onSubmit={submit} className="w-full max-w-md space-y-4">
        <button
          type="button"
          onClick={() => setShowForm(false)}
          className="mb-2 text-sm text-white/50 transition hover:text-white"
        >
          ← Volver
        </button>

        <h1 className="text-2xl font-light">Crear cuenta broker</h1>

        {error && <div className="text-red-400 text-sm">{error}</div>}
        {message && <div className="text-green-400 text-sm">{message}</div>}

        {FIELDS.map((field) => (
          <input
            key={field}
            type={field === "password" ? "password" : "text"}
            placeholder={field}
            value={form[field]}
            onChange={(e) => setForm({ ...form, [field]: e.target.value })}
            className="w-full rounded border border-white/10 bg-white/10 p-3"
          />
        ))}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-white p-3 text-black disabled:opacity-60"
        >
          {loading ? "Creando..." : "Crear cuenta"}
        </button>
      </form>
    </main>
  );
}
