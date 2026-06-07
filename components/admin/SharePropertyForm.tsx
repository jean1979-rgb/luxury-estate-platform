"use client";

import { useState } from "react";

type Props = {
  propertyId: string;
  propertyTitle: string;
  propertyLocation?: string | null;
  propertyPrice?: string | null;
  propertyCurrency?: string | null;
  propertyCoverImage?: string | null;
};

export default function SharePropertyForm({
  propertyId,
  propertyTitle,
  propertyLocation,
  propertyPrice,
  propertyCurrency,
  propertyCoverImage,
}: Props) {
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setError("");

    const res = await fetch("/api/admin/share-property", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        propertyId,
        recipientName,
        recipientEmail,
        message,
      }),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      setStatus("error");
      setError(data?.error || "No se pudo enviar el correo.");
      return;
    }

    setStatus("sent");
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 md:p-6">
        <div className="flex flex-col gap-5 md:flex-row md:items-center">
          {propertyCoverImage ? (
            <img
              src={propertyCoverImage}
              alt={propertyTitle}
              className="h-44 w-full rounded-2xl border border-white/10 object-cover md:h-32 md:w-44"
            />
          ) : null}

          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.34em] text-white/35">
              Propiedad
            </p>
            <h2 className="mt-3 text-2xl font-light leading-tight text-white">
              {propertyTitle}
            </h2>

            <div className="mt-4 space-y-1 text-sm text-white/55">
              {propertyLocation ? <p>{propertyLocation}</p> : null}
              {propertyPrice ? (
                <p>
                  {propertyPrice} {propertyCurrency || ""}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <label className="block">
        <span className="mb-2 block text-sm text-white/65">Nombre del cliente</span>
        <input
          value={recipientName}
          onChange={(e) => setRecipientName(e.target.value)}
          placeholder="Ej. Carlos"
          className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none placeholder:text-white/25 focus:border-white/25"
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm text-white/65">Correo electrónico</span>
        <input
          required
          type="email"
          value={recipientEmail}
          onChange={(e) => setRecipientEmail(e.target.value)}
          placeholder="cliente@correo.com"
          className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none placeholder:text-white/25 focus:border-white/25"
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm text-white/65">Mensaje personalizado</span>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Opcional. Ej. Le comparto esta residencia porque coincide con lo que está buscando."
          className="min-h-24 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none placeholder:text-white/25 focus:border-white/25"
        />
      </label>

      <div className="rounded-2xl border border-[#d6c3a1]/20 bg-[#d6c3a1]/10 px-4 py-3 text-sm text-[#f5e6c8]">
        Esta primera versión envía un correo premium con foto, datos clave y enlace público. La ficha PDF se integra después.
      </div>

      {status === "sent" ? (
        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
          Correo enviado correctamente.
        </div>
      ) : null}

      {status === "error" ? (
        <div className="rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      {recipientEmail ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/60">
          <span className="text-white/35">Se enviará a:</span>{" "}
          <span className="text-white">{recipientName || "Cliente"}</span>{" "}
          <span className="text-white/45">·</span>{" "}
          <span className="text-white">{recipientEmail}</span>
        </div>
      ) : null}

      <button
        type="submit"
        disabled={status === "sending"}
        className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-white px-6 py-3 text-xs uppercase tracking-[0.24em] text-black transition hover:opacity-90 disabled:opacity-50"
      >
        {status === "sending" ? "Enviando..." : "Compartir propiedad"}
      </button>
    </form>
  );
}
