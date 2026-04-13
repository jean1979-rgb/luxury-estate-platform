export const dynamic = "force-dynamic";
import Link from "next/link";

const ITEMS = [
  {
    title: "Home",
    href: "/admin/public/home",
    description: "Hero, CTAs y bloques editoriales del homepage público.",
  },
  {
    title: "Destinations",
    href: "/admin/public/destinations",
    description: "Gestión de destinos y sus fichas editoriales.",
  },
  {
    title: "Partners",
    href: "/admin/public/partners",
    description: "Marcas, aliados y presencia editorial en home.",
  },
  {
    title: "Experiences",
    href: "/admin/public/experiences",
    description: "Experiencias lifestyle y contenido aspiracional.",
  },
  {
    title: "Publishing",
    href: "/admin/public/publishing",
    description: "Visibilidad, publicación y featured de la capa pública.",
  },
];

export default function PublicNavigationPage() {
  return (
    <div className="min-h-screen bg-black p-10 text-white">
      <div className="mx-auto max-w-6xl space-y-8">
        <div>
          <div className="text-[11px] uppercase tracking-[0.34em] text-white/40">
            Public CMS
          </div>
          <h1 className="mt-2 text-3xl font-light">Navigation</h1>
          <p className="mt-2 max-w-2xl text-sm text-white/60">
            Centro de navegación editorial para operar la capa pública.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {ITEMS.map((item: any) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-white/30 hover:bg-white/[0.05]"
            >
              <div className="text-[11px] uppercase tracking-[0.24em] text-white/35">
                Public admin
              </div>
              <h2 className="mt-3 text-2xl font-light text-white">{item.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-white/60">
                {item.description}
              </p>
              <div className="mt-6 inline-flex rounded-xl border border-white/15 px-4 py-2 text-xs uppercase tracking-[0.22em] text-white/75">
                Entrar
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
