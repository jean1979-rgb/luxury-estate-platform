import { Viewer360Stage } from "@/modules/viewer360";

const DEMO_SCENES = [
  {
    id: "scene-1",
    title: "DJI test pano",
    image: "/360/sample-panorama.jpg",
    initialYaw: 0,
    initialPitch: 0,
    hotspots: [],
  },
];

export default function Viewer360LabPage() {
  return (
    <main className="min-h-screen bg-[#050505] px-6 py-10 text-white md:px-10">
      <div className="mx-auto max-w-6xl">
        <p className="text-[10px] uppercase tracking-[0.35em] text-white/40">
          Viewer360 Lab
        </p>

        <h1 className="mt-4 text-4xl font-light">
          Módulo nuevo 360
        </h1>

        <p className="mt-4 max-w-3xl text-white/65">
          Prueba con panorama equirectangular real.
        </p>

        <div className="mt-10">
          <Viewer360Stage scenes={DEMO_SCENES} />
        </div>
      </div>
    </main>
  );
}
