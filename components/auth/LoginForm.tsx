"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (!res || res.error) {
      setMessage("Credenciales inválidas.");
      return;
    }

    window.location.href = "/broker";
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="mb-2 block text-xs uppercase tracking-[0.24em] text-white/55">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-white/15 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-white/35"
          required
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
        {loading ? "Entrando..." : "Iniciar sesión"}
      </button>
    </form>
  );
}
