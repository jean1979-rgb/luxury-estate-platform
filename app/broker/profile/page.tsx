"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type ProfileForm = {
  name: string;
  email: string;
  businessName: string;
  city: string;
  phone: string;
};

export default function BrokerProfilePage() {
  const [form, setForm] = useState<ProfileForm>({
    name: "",
    email: "",
    businessName: "",
    city: "",
    phone: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadProfile() {
    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/broker/profile", { cache: "no-store" });
      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.message || "No se pudo cargar el perfil.");
      }

      setForm({
        name: data.user.name || "",
        email: data.user.email || "",
        businessName: data.user.brokerProfile?.businessName || "",
        city: data.user.brokerProfile?.city || "",
        phone: data.user.brokerProfile?.phone || "",
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error cargando perfil.");
    } finally {
      setLoading(false);
    }
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();

    try {
      setSaving(true);
      setMessage("");
      setError("");

      const res = await fetch("/api/broker/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.message || "No se pudo guardar el perfil.");
      }

      setMessage("Perfil actualizado correctamente.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error guardando perfil.");
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    loadProfile();
  }, []);

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-3xl px-6 py-10">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.32em] text-white/40">
              Broker
            </p>
            <h1 className="mt-2 text-3xl font-light tracking-[0.06em]">
              Mi perfil
            </h1>
            <p className="mt-3 text-sm text-white/55">
              Edita tus datos de contacto y la información de tu firma.
            </p>
          </div>

          <Link
            href="/broker/properties"
            className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white transition hover:bg-white/[0.08]"
          >
            Propiedades
          </Link>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-sm text-white/60">
            Cargando perfil...
          </div>
        ) : (
          <form
            onSubmit={saveProfile}
            className="rounded-3xl border border-white/10 bg-white/[0.03] p-6"
          >
            <div className="grid gap-5">
              <label className="grid gap-2">
                <span className="text-xs uppercase tracking-[0.22em] text-white/45">
                  Nombre
                </span>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="rounded-2xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none focus:border-white/25"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-xs uppercase tracking-[0.22em] text-white/45">
                  Correo
                </span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="rounded-2xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none focus:border-white/25"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-xs uppercase tracking-[0.22em] text-white/45">
                  Firma / empresa
                </span>
                <input
                  value={form.businessName}
                  onChange={(e) =>
                    setForm({ ...form, businessName: e.target.value })
                  }
                  className="rounded-2xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none focus:border-white/25"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-xs uppercase tracking-[0.22em] text-white/45">
                  Ciudad
                </span>
                <input
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="rounded-2xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none focus:border-white/25"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-xs uppercase tracking-[0.22em] text-white/45">
                  Teléfono
                </span>
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="rounded-2xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none focus:border-white/25"
                />
              </label>
            </div>

            {error ? (
              <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
                {error}
              </div>
            ) : null}

            {message ? (
              <div className="mt-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-200">
                {message}
              </div>
            ) : null}

            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="rounded-2xl bg-white px-5 py-3 text-sm font-medium text-black transition hover:bg-white/85 disabled:opacity-50"
              >
                {saving ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
