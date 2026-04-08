"use client";

import { useState } from "react";

export default function BrokerRegisterPage() {
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

      setMessage("Cuenta creada correctamente");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center">
      <form onSubmit={submit} className="w-full max-w-md space-y-4">
        <h1 className="text-2xl font-light">Crear cuenta broker</h1>

        {error && <div className="text-red-400 text-sm">{error}</div>}
        {message && <div className="text-green-400 text-sm">{message}</div>}

        {["name","email","password","businessName","city","phone"].map((field) => (
          <input
            key={field}
            type={field === "password" ? "password" : "text"}
            placeholder={field}
            value={(form as any)[field]}
            onChange={(e) =>
              setForm({ ...form, [field]: e.target.value })
            }
            className="w-full p-3 bg-white/10 border border-white/10 rounded"
          />
        ))}

        <button
          type="submit"
          disabled={loading}
          className="w-full p-3 bg-white text-black rounded"
        >
          {loading ? "Creando..." : "Crear cuenta"}
        </button>
      </form>
    </main>
  );
}
