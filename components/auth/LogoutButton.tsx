"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="border border-white/15 px-4 py-2 text-xs uppercase tracking-[0.22em] text-white/80 transition hover:bg-white hover:text-black"
    >
      Cerrar sesión
    </button>
  );
}
