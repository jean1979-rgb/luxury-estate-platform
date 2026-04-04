"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type SyncState =
  | { type: "idle"; message: string }
  | { type: "loading"; message: string }
  | { type: "success"; message: string }
  | { type: "error"; message: string };

type TokkoResponse = {
  ok: boolean;
  updated?: number;
  skipped?: number;
  error?: string;
};

export default function TokkoResyncButton() {
  const router = useRouter();
  const [state, setState] = useState<SyncState>({
    type: "idle",
    message: "",
  });

  async function handleClick() {
    try {
      setState({ type: "loading", message: "Sincronizando Tokko..." });

      const res = await fetch("/api/broker/tokko/resync", {
        method: "POST",
      });

      const text = await res.text();

      let json: TokkoResponse;
      try {
        json = JSON.parse(text) as TokkoResponse;
      } catch {
        throw new Error(`invalid_json_response: ${text.slice(0, 160)}`);
      }

      if (!res.ok || !json.ok) {
        throw new Error(json.error || "sync_failed");
      }

      setState({
        type: "success",
        message: `Sync OK · actualizadas: ${json.updated ?? 0} · omitidas: ${json.skipped ?? 0}`,
      });

      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "unknown_error";
      setState({
        type: "error",
        message: `No se pudo sincronizar Tokko. ${message}`.trim(),
      });
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={state.type === "loading"}
        className="inline-flex min-h-11 items-center justify-center border border-white/20 px-4 py-2 text-xs uppercase tracking-[0.22em] text-white transition hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-60"
      >
        {state.type === "loading" ? "Sincronizando..." : "Resync Tokko"}
      </button>

      {state.message ? (
        <p
          className={
            state.type === "error"
              ? "max-w-[420px] text-right text-xs text-red-300"
              : "text-right text-xs text-white/60"
          }
        >
          {state.message}
        </p>
      ) : null}
    </div>
  );
}
