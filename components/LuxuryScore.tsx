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

  const ratings = [
    ["Vista", 5],
    ["Ubicación", 5],
    ["Amenidades", 5],
    ["Diseño", value >= 90 ? 5 : 4],
    ["Privacidad", value >= 95 ? 5 : 4],
    ["Exclusividad", value >= 95 ? 5 : 4],
  ];

  const highlights = [
    location ? `Ubicación premium en ${location}` : "Ubicación premium",
    area && area !== "N/D" ? `${area} de superficie` : "Superficie destacada",
    "Amenidades de nivel resort",
    "Experiencia residencial curada",
    "Selección editorial Private Estates",
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

        <aside className="relative z-10 ml-auto flex h-full w-full max-w-[720px] flex-col overflow-y-auto border-l border-white/10 bg-[#090909] shadow-2xl">
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

          {coverImage ? (
            <div
              className="h-[280px] bg-cover bg-center"
              style={{ backgroundImage: `url("${coverImage}")` }}
            />
          ) : null}

          <div className="space-y-10 p-7 md:p-10">
            <div>
              <p className="text-[11px] uppercase tracking-[0.32em] text-white/35">
                Luxury Score {value}
              </p>

              <h2 className="mt-3 text-4xl font-light uppercase tracking-[0.12em] text-[#d6b464]">
                {category}
              </h2>

              {title ? (
                <p className="mt-4 text-lg text-white/80">{title}</p>
              ) : null}
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              <section>
                <p className="mb-5 text-[11px] uppercase tracking-[0.3em] text-[#d6b464]">
                  Evaluación PEM
                </p>

                <div className="space-y-4">
                  {ratings.map(([label, score]) => (
                    <div key={label as string} className="flex items-center justify-between gap-6">
                      <span className="text-sm text-white/75">{label}</span>
                      <span className="text-lg tracking-[0.22em] text-[#d6b464]">
                        {dots(score as number)}
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <p className="mb-5 text-[11px] uppercase tracking-[0.3em] text-[#d6b464]">
                  Highlights
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

            <section className="rounded-[24px] border border-white/10 bg-white/[0.03] p-6">
              <p className="mb-4 text-[11px] uppercase tracking-[0.3em] text-[#d6b464]">
                Nota editorial PEM
              </p>

              <p className="text-sm leading-7 text-white/70">
                Esta propiedad alcanza un Luxury Score destacado por su ubicación,
                escala, experiencia residencial y selección editorial dentro del
                portafolio Private Estates México.
              </p>
            </section>
          </div>
        </aside>
      </div>
    </>
  );
}
