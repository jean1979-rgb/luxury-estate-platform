"use client";
export const dynamic = "force-dynamic";

import Viewer360Stage from "@/modules/viewer360/Viewer360Stage";

export default function Viewer360CoreLabPage() {
  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white md:px-10">
      <div className="mx-auto max-w-6xl">
        <p className="text-[10px] uppercase tracking-[0.35em] text-white/40">
          Viewer360 Lab
        </p>

        <h1 className="mt-4 text-4xl font-light">Stage completo</h1>

        <div className="mt-8">
          <Viewer360Stage
            scenes={[
              {
                id: "scene-1",
                title: "Demo",
                image: "/360/sample-panorama.jpg",
                initialYaw: 0,
                initialPitch: 0,
              },
            ]}
          />
        </div>
      </div>
    </main>
  );
}
