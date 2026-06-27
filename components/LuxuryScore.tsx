type Props = {
  value: number;
  title?: string;
  coverImage?: string;
  location?: string;
  area?: string;
};

function getCategory(value: number) {
  if (value >= 95) return "ICONIC";
  if (value >= 90) return "SIGNATURE";
  if (value >= 85) return "EXCEPTIONAL";
  if (value >= 80) return "DISTINGUISHED";
  return "PREMIUM";
}

function getPositioning(value: number) {
  if (value >= 98) return "Top 1% PEM Collection";
  if (value >= 95) return "Iconic Residence";
  if (value >= 90) return "Signature Property";
  if (value >= 85) return "Exceptional Residence";
  return "Private Estates Selection";
}

function getCollection(location: string, title: string) {
  const text = `${location} ${title}`.toLowerCase();

  if (
    text.includes("frente al pacífico") ||
    text.includes("frente al mar") ||
    text.includes("playamar") ||
    text.includes("playa diamante") ||
    text.includes("oceanfront")
  ) {
    return "Oceanfront Collection";
  }

  if (
    text.includes("brisas") ||
    text.includes("marqués") ||
    text.includes("bahía") ||
    text.includes("puerto marqués")
  ) {
    return "Hillside Ocean View Collection";
  }

  if (
    text.includes("real diamante") ||
    text.includes("golf") ||
    text.includes("tres vidas")
  ) {
    return "Golf & Resort Collection";
  }

  return "Private Residential Collection";
}

function getRatingProfile(value: number, location: string, title: string, area: string) {
  const text = `${location} ${title} ${area}`.toLowerCase();
  const numericArea = Number(String(area).replace(/[^0-9.]/g, ""));

  const isOceanfront =
    text.includes("frente al mar") ||
    text.includes("frente al pacífico") ||
    text.includes("playamar") ||
    text.includes("playa diamante");

  const isOceanView =
    text.includes("vista") ||
    text.includes("bahía") ||
    text.includes("marqués") ||
    text.includes("brisas");

  const hasResortAmenities =
    text.includes("playamar") ||
    text.includes("diamante") ||
    text.includes("amenidades") ||
    text.includes("club") ||
    text.includes("golf") ||
    text.includes("spa");

  const isLargeScale = numericArea >= 400;
  const isEstateScale = numericArea >= 900;

  return [
    ["Vista / Entorno", isOceanfront || isOceanView ? 5 : value >= 90 ? 4 : 3],
    ["Ubicación", isOceanfront || text.includes("diamante") || text.includes("brisas") ? 5 : value >= 90 ? 4 : 3],
    ["Amenidades", hasResortAmenities ? 5 : value >= 92 ? 4 : 3],
    ["Diseño & Materialidad", value >= 95 ? 5 : value >= 88 ? 4 : 3],
    ["Privacidad", isEstateScale ? 5 : isLargeScale || value >= 95 ? 4 : 3],
    ["Exclusividad", value >= 95 ? 5 : value >= 88 ? 4 : 3],
  ];
}

function getEditorialNote(value: number, collection: string) {
  if (value >= 98) {
    return `Esta propiedad se ubica dentro de la lectura más alta de Private Estates México: ${collection}, atributos residenciales sobresalientes y una combinación poco común de ubicación, escala, experiencia y valor aspiracional.`;
  }

  if (value >= 95) {
    return `Esta propiedad destaca como una residencia icónica dentro de ${collection}, con una lectura editorial fuerte por ubicación, privacidad, amenidades y capacidad de sostener deseo en el mercado premium.`;
  }

  if (value >= 90) {
    return `Esta propiedad se posiciona como una residencia signature dentro de ${collection}, con atributos sólidos de ubicación, diseño, amenidades y experiencia residencial.`;
  }

  return `Esta propiedad forma parte de la selección Private Estates México por su potencial residencial, ubicación y capacidad de construir una experiencia de vida premium.`;
}

function dots(value: number) {
  return "●".repeat(value) + "○".repeat(5 - value);
}

export default function LuxuryScore({
  value,
  title = "",
  coverImage = "",
  location = "",
  area = "",
}: Props) {
  const category = getCategory(value || 0);
  const positioning = getPositioning(value || 0);
  const collection = getCollection(location, title);

  const ratings = getRatingProfile(value || 0, location, title, area);
  const editorialNote = getEditorialNote(value || 0, collection);

  const highlights = [
    location ? `Ubicación premium en ${location}` : "Ubicación premium",
    area && area !== "N/D" ? `${area} de superficie evaluada` : "Superficie destacada",
    "Amenidades y experiencia residencial de nivel resort",
    "Curaduría editorial dentro del portafolio Private Estates México",
    positioning,
  ];

  return (
    <>
      <style>{`
        #pem-luxury-review {
          opacity: 0;
          visibility: hidden;
          pointer-events: none;
        }

        #pem-luxury-review:target {
          opacity: 1;
          visibility: visible;
          pointer-events: auto;
        }
      `}</style>

      <div id="luxury-score-card" className="rounded-[26px] border border-white/10 bg-[#121212] p-8 md:p-10">
        <p className="text-[12px] uppercase tracking-[0.4em] text-[#b8afa3]">
          Luxury Score
        </p>

        <div className="mt-5 text-[58px] font-light leading-none text-white md:text-[70px]">
          {value}
        </div>

        <div className="mt-4 text-[18px] uppercase tracking-[0.26em] text-[#d6b464]">
          {category}
        </div>

        <p className="mt-4 text-sm leading-6 text-white/45">
          Evaluación editorial de ubicación, entorno, amenidades, privacidad y experiencia residencial.
        </p>

        <a
          href="#pem-luxury-review"
          className="mt-7 inline-flex rounded-full border border-[#d6b464]/70 px-5 py-3 text-[11px] font-medium uppercase tracking-[0.2em] text-[#d6b464] transition hover:bg-[#d6b464] hover:text-black"
        >
          Ver evaluación →
        </a>
      </div>

      <div
        id="pem-luxury-review"
        className="fixed inset-0 z-[9999] bg-black/90 transition-opacity duration-300"
      >
        <a
          href="#luxury-score-card"
          className="absolute inset-0"
          aria-label="Cerrar evaluación"
        />

        <aside className="relative z-10 ml-auto flex h-full w-full max-w-[760px] flex-col overflow-y-auto border-l border-white/10 bg-[#090909] shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
            <p className="text-[11px] uppercase tracking-[0.34em] text-white/45">
              Private Estates Review
            </p>

            <a
              href="#luxury-score-card"
              className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/70 hover:bg-white/10"
            >
              Cerrar
            </a>
          </div>

          <div className="relative min-h-[330px] overflow-hidden bg-[#111]">
            {coverImage ? (
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url("${coverImage}")` }}
              />
            ) : null}

            <div className="absolute inset-0 bg-gradient-to-t from-[#090909] via-black/45 to-black/10" />

            <div className="relative z-10 flex min-h-[330px] flex-col justify-end p-7 md:p-10">
              <p className="text-[10px] uppercase tracking-[0.34em] text-[#d6b464]">
                {collection}
              </p>

              <h2 className="mt-4 text-4xl font-light uppercase tracking-[0.1em] text-white md:text-5xl">
                {category}
              </h2>

              <div className="mt-5 flex flex-wrap gap-3">
                <span className="rounded-full border border-[#d6b464]/50 bg-black/30 px-4 py-2 text-[10px] uppercase tracking-[0.22em] text-[#d6b464] backdrop-blur">
                  Luxury Score {value}
                </span>

                <span className="rounded-full border border-white/15 bg-black/30 px-4 py-2 text-[10px] uppercase tracking-[0.22em] text-white/65 backdrop-blur">
                  {positioning}
                </span>
              </div>

              {title ? (
                <p className="mt-5 max-w-xl text-lg leading-7 text-white/82">{title}</p>
              ) : null}
            </div>
          </div>

          <div className="space-y-8 p-7 md:p-10">
            <section className="rounded-[28px] border border-white/10 bg-white/[0.035] p-6">
              <p className="text-[11px] uppercase tracking-[0.32em] text-[#d6b464]">
                Lectura editorial PEM
              </p>

              <p className="mt-4 text-sm leading-7 text-white/70">
                Este índice no sustituye una valuación comercial. Resume la lectura editorial de Private Estates
                sobre el potencial residencial de la propiedad: ubicación, entorno, escala, amenidades,
                privacidad, diseño y capacidad de generar una experiencia de vida superior.
              </p>
            </section>

            <div className="grid gap-6 md:grid-cols-2">
              <section className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6">
                <p className="mb-5 text-[11px] uppercase tracking-[0.3em] text-[#d6b464]">
                  Evaluación PEM
                </p>

                <div className="space-y-4">
                  {ratings.map(([label, score]) => (
                    <div key={label as string} className="border-b border-white/10 pb-4 last:border-b-0 last:pb-0">
                      <div className="flex items-center justify-between gap-6">
                        <span className="text-sm text-white/75">{label}</span>
                        <span className="text-lg tracking-[0.22em] text-[#d6b464]">
                          {dots(score as number)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6">
                <p className="mb-5 text-[11px] uppercase tracking-[0.3em] text-[#d6b464]">
                  Factores destacados
                </p>

                <div className="space-y-3">
                  {highlights.map((item) => (
                    <div key={item} className="flex gap-3 text-sm leading-6 text-white/75">
                      <span className="text-[#d6b464]">✓</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <section className="rounded-[28px] border border-[#d6b464]/20 bg-[#d6b464]/[0.06] p-6">
              <p className="mb-4 text-[11px] uppercase tracking-[0.3em] text-[#d6b464]">
                Nota editorial PEM
              </p>

              <p className="text-sm leading-7 text-white/72">
                {editorialNote}
              </p>
            </section>
          </div>
        </aside>
      </div>
    </>
  );
}
