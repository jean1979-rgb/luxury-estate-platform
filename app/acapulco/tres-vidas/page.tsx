export const dynamic = "force-dynamic";
export const revalidate = 0;

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?auto=format&fit=crop&w=2400&q=90";

const FAIRWAY_IMAGE =
  "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&w=1800&q=85";

const OCEAN_IMAGE =
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1800&q=85";

const ARCHITECTURE_IMAGE =
  "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1800&q=85";

const experiences = [
  {
    eyebrow: "Golf",
    title: "Sunrise tee times",
    text: "Golf al amanecer dentro de un enclave donde el fairway, el viento y el Pacífico definen el ritmo del día.",
  },
  {
    eyebrow: "Wellness",
    title: "Pacific recovery",
    text: "Wellness privado, caminatas frente al mar y una forma más silenciosa de vivir Acapulco.",
  },
  {
    eyebrow: "Hospitality",
    title: "Private beach dining",
    text: "Cenas frente al océano, chefs invitados y encuentros diseñados alrededor del club lifestyle.",
  },
];

export default function TresVidasPage() {
  return (
    <main className="min-h-screen bg-[#0d0f0d] text-white">
      <section className="relative min-h-screen overflow-hidden">
        <img
          src={HERO_IMAGE}
          alt="Tres Vidas golf and ocean estates"
          className="absolute inset-0 h-full w-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/20 to-[#0d0f0d]" />

        <div className="relative z-10 flex min-h-screen items-end px-6 pb-16 md:px-12 md:pb-24">
          <div className="max-w-5xl">
            <p className="text-xs uppercase tracking-[0.42em] text-white/70">
              Private Estates México presents
            </p>
            <h1 className="mt-6 text-5xl font-light tracking-[-0.06em] md:text-8xl">
              TRES VIDAS
            </h1>
            <p className="mt-5 max-w-2xl text-xl font-light leading-8 text-white/78 md:text-2xl">
              Golf & Ocean Homesites.
            </p>
            <p className="mt-8 max-w-3xl text-base leading-8 text-white/68 md:text-lg">
              A private Pacific enclave where golf, oceanfront land and
              architecture converge into a quieter vision of Acapulco.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-6 py-24 md:grid-cols-[0.9fr_1.1fr] md:px-12">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-white/40">
            The collection
          </p>
          <h2 className="mt-5 text-4xl font-light tracking-[-0.04em] md:text-6xl">
            The private side of Acapulco.
          </h2>
        </div>
        <div className="space-y-7 text-lg leading-9 text-white/64">
          <p>
            TRES VIDAS no se lee como inventario tradicional. Se entiende como
            territorio: homesites frente al Pacífico, reservas residenciales
            sobre fairway y la posibilidad de construir una residencia
            irrepetible dentro de uno de los enclaves más exclusivos de
            Acapulco.
          </p>
          <p>
            Aquí la tierra no es un lote. Es un lienzo arquitectónico con
            escala, privacidad y relación directa con el paisaje.
          </p>
        </div>
      </section>

      <section className="grid md:grid-cols-3">
        {[
          ["Oceanfront Homesites", "Terrenos frente al Pacífico para residencias privadas de escala excepcional."],
          ["Fairway Estate Lots", "Parcelas residenciales integradas al campo, con amplitud visual y baja densidad."],
          ["Future Private Residences", "Arquitectura futura, lifestyle de club y una lectura más silenciosa del lujo."],
        ].map(([title, text]) => (
          <article key={title} className="border-t border-white/10 p-8 md:border-l md:p-12">
            <p className="text-xs uppercase tracking-[0.32em] text-white/35">
              Homesite
            </p>
            <h3 className="mt-8 text-3xl font-light tracking-[-0.04em]">
              {title}
            </h3>
            <p className="mt-5 text-sm leading-7 text-white/55">{text}</p>
          </article>
        ))}
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-6 py-24 md:grid-cols-2 md:px-12">
        <div className="overflow-hidden rounded-[2rem]">
          <img src={FAIRWAY_IMAGE} alt="Golf facing the Pacific" className="h-full min-h-[520px] w-full object-cover" />
        </div>
        <div className="flex flex-col justify-center">
          <p className="text-xs uppercase tracking-[0.35em] text-white/40">
            Golf facing the Pacific
          </p>
          <h2 className="mt-5 text-4xl font-light tracking-[-0.04em] md:text-6xl">
            Golf as landscape, not amenity.
          </h2>
          <p className="mt-8 text-lg leading-9 text-white/62">
            El campo diseñado por Robert von Hagge estructura la experiencia
            completa del enclave: amplitud visual, privacidad entre
            residencias y una relación constante con el océano.
          </p>
        </div>
      </section>

      <section className="relative overflow-hidden py-28">
        <img src={OCEAN_IMAGE} alt="Pacific ocean" className="absolute inset-0 h-full w-full object-cover opacity-45" />
        <div className="absolute inset-0 bg-black/45" />
        <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
          <p className="text-xs uppercase tracking-[0.35em] text-white/50">
            A different Acapulco
          </p>
          <h2 className="mt-6 text-4xl font-light leading-tight tracking-[-0.05em] md:text-7xl">
            Less density. More horizon. More silence.
          </h2>
          <p className="mx-auto mt-8 max-w-3xl text-lg leading-9 text-white/68">
            Mientras otras zonas del puerto evolucionan hacia la densidad,
            TRES VIDAS conserva una lectura más abierta, natural y profundamente
            privada de Acapulco.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24 md:px-12">
        <div className="max-w-3xl">
          <p className="text-xs uppercase tracking-[0.35em] text-white/40">
            Experiences
          </p>
          <h2 className="mt-5 text-4xl font-light tracking-[-0.04em] md:text-6xl">
            Built around golf, ocean and privacy.
          </h2>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {experiences.map((item) => (
            <article key={item.title} className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-8">
              <p className="text-xs uppercase tracking-[0.3em] text-white/35">
                {item.eyebrow}
              </p>
              <h3 className="mt-8 text-2xl font-light tracking-[-0.03em]">
                {item.title}
              </h3>
              <p className="mt-5 text-sm leading-7 text-white/55">
                {item.text}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-6 pb-28 md:grid-cols-[1fr_0.9fr] md:px-12">
        <div className="flex flex-col justify-center rounded-[2rem] border border-white/10 bg-white/[0.035] p-8 md:p-12">
          <p className="text-xs uppercase tracking-[0.35em] text-white/40">
            Partner vision
          </p>
          <h2 className="mt-5 text-4xl font-light tracking-[-0.04em] md:text-6xl">
            A flagship territory for Private Estates México.
          </h2>
          <p className="mt-8 text-lg leading-9 text-white/62">
            La propuesta no es publicar terrenos. Es construir una narrativa
            digital premium para posicionar TRES VIDAS como el enclave de golf,
            océano y privacidad más deseable de Acapulco.
          </p>
          <a
            href="/acapulco"
            className="mt-10 inline-flex w-fit rounded-full border border-white/20 px-6 py-3 text-xs uppercase tracking-[0.25em] text-white/75 transition hover:bg-white hover:text-black"
          >
            Return to Acapulco
          </a>
        </div>
        <div className="overflow-hidden rounded-[2rem]">
          <img src={ARCHITECTURE_IMAGE} alt="Future private residence" className="h-full min-h-[520px] w-full object-cover" />
        </div>
      </section>
    </main>
  );
}
