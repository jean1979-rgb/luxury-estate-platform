"use client";

import { useState } from "react";

export default function BrokerRegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    businessName: "",
    city: "",
    message: "",
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
      const res = await fetch("/api/broker/request-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error");

      setMessage("Solicitud enviada correctamente. Nuestro equipo revisará tu acceso.");
      setForm({ name: "", email: "", phone: "", businessName: "", city: "", message: "" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6 py-12">
      <form onSubmit={submit} className="w-full max-w-xl rounded-3xl border border-white/10 bg-white/[0.04] p-8 shadow-2xl">
        <p className="mb-4 text-xs uppercase tracking-[0.28em] text-white/45">Private Estates México</p>
        <h1 className="text-3xl font-light leading-tight">Solicitar acceso broker</h1>
        <p className="mt-5 text-base leading-7 text-white/65">
          Para crear una cuenta broker necesitas autorización previa. Envíanos tus datos y revisaremos tu solicitud.
        </p>

        <div className="mt-8 space-y-4">
          {[
            ["name", "Nombre"],
            ["email", "Email"],
            ["phone", "Teléfono"],
            ["businessName", "Firma inmobiliaria"],
            ["city", "Ciudad"],
          ].map(([field, label]) => (
            <input
              key={field}
              type={field === "email" ? "email" : "text"}
              placeholder={label}
              value={(form as any)[field]}
              onChange={(e) => setForm({ ...form, [field]: e.target.value })}
              className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-4 text-white outline-none placeholder:text-white/35"
            />
          ))}

          <textarea
            placeholder="Mensaje opcional"
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            rows={4}
            className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-4 text-white outline-none placeholder:text-white/35"
          />

          {error && <div className="text-sm text-red-300">{error}</div>}
          {message && <div className="text-sm text-emerald-300">{message}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-white px-5 py-4 text-sm font-medium text-black disabled:opacity-60"
          >
            {loading ? "Enviando..." : "Solicitar acceso"}
          </button>
        </div>
      </form>
    </main>
  );
}
