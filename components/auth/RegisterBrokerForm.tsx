"use client";

import { useState } from "react";

export default function RegisterBrokerForm() {
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

  function update(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const res = await fetch("/api/broker/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok || !data.ok) {
      setMessage(data.message || "No se pudo crear la cuenta.");
      return;
    }

    const login = await fetch("/api/auth/callback/credentials", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        email: form.email,
        password: form.password,
      }),
    });

    if (!login.ok) {
      window.location.href = "/broker/login";
      return;
    }

    window.location.href = "/broker";
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <div>
        <label className="mb-2 block text-xs uppercase tracking-[0.24em] text-white/55">
          Nombre
        </label>
        <input
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
          className="w-full border border-white/15 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-white/35"
          required
        />
      </div>

      <div>
        <label className="mb-2 block text-xs uppercase tracking-[0.24em] text-white/55">
          Email
        </label>
        <input
          type="email"
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
          className="w-full border border-white/15 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-white/35"
          required
        />
      </div>

      <div>
        <label className="mb-2 block text-xs uppercase tracking-[0.24em] text-white/55">
          Contraseña
        </label>
        <input
          type="password"
          value={form.password}
          onChange={(e) => update("password", e.target.value)}
          className="w-full border border-white/15 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-white/35"
          required
        />
      </div>

      <div>
        <label className="mb-2 block text-xs uppercase tracking-[0.24em] text-white/55">
          Nombre comercial
        </label>
        <input
          value={form.businessName}
          onChange={(e) => update("businessName", e.target.value)}
          className="w-full border border-white/15 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-white/35"
          required
        />
      </div>

      <div>
        <label className="mb-2 block text-xs uppercase tracking-[0.24em] text-white/55">
          Ciudad
        </label>
        <input
          value={form.city}
          onChange={(e) => update("city", e.target.value)}
          className="w-full border border-white/15 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-white/35"
          required
        />
      </div>

      <div>
        <label className="mb-2 block text-xs uppercase tracking-[0.24em] text-white/55">
          Teléfono
        </label>
        <input
          value={form.phone}
          onChange={(e) => update("phone", e.target.value)}
          className="w-full border border-white/15 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-white/35"
        />
      </div>

      {message ? (
        <div className="border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {message}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="w-full border border-white/20 bg-white px-4 py-3 text-xs uppercase tracking-[0.24em] text-black transition hover:opacity-90 disabled:opacity-60"
      >
        {loading ? "Creando cuenta..." : "Crear cuenta broker"}
      </button>
    </form>
  );
}
