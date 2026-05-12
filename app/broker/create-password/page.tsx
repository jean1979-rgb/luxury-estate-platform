"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";

function CreatePasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("El enlace no es válido.");
      return;
    }

    if (password.length < 8) {
      setError("La contraseña debe tener mínimo 8 caracteres.");
      return;
    }

    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/broker/create-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.message || "No se pudo crear la contraseña.");
      }

      window.location.href = "/broker/login?password_created=1";
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error creando contraseña.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-6 py-12 text-white">
      <form onSubmit={submit} className="w-full max-w-lg rounded-3xl border border-white/10 bg-white/[0.04] p-8 shadow-2xl">
        <p className="mb-4 text-xs uppercase tracking-[0.28em] text-white/45">
          Private Estates México
        </p>

        <h1 className="text-3xl font-light leading-tight">
          Crear contraseña broker
        </h1>

        <p className="mt-5 text-base leading-7 text-white/65">
          Tu solicitud fue aprobada. Crea tu contraseña para activar tu cuenta e iniciar sesión.
        </p>

        <div className="mt-8 space-y-4">
          <input
            type="password"
            placeholder="Contraseña nueva"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-4 text-white outline-none placeholder:text-white/35"
          />

          <input
            type="password"
            placeholder="Confirmar contraseña"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-4 text-white outline-none placeholder:text-white/35"
          />

          {error ? <div className="text-sm text-red-300">{error}</div> : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-white px-5 py-4 text-sm font-medium text-black disabled:opacity-60"
          >
            {loading ? "Creando contraseña..." : "Crear contraseña"}
          </button>
        </div>
      </form>
    </main>
  );
}

export default function CreatePasswordPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-black px-6 py-12 text-white">
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-white/70">
            Cargando...
          </div>
        </main>
      }
    >
      <CreatePasswordForm />
    </Suspense>
  );
}
