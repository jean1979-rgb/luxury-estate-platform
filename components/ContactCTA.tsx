type Props = {
  title: string;
};

export default function ContactCTA({ title }: Props) {
  return (
    <section className="rounded-[28px] border border-white/10 bg-[#121212] p-10">
      <p className="text-[10px] uppercase tracking-[0.35em] text-[#d6c3a1]">
        Private Access
      </p>

      <div className="mt-5 flex flex-col gap-6 xl:grid xl:grid-cols-12 xl:items-center">
        <div className="xl:col-span-7">
          <h3 className="max-w-[18ch] md:max-w-[14ch] text-3xl font-light leading-[0.98] md:text-3xl xl:text-[44px]">
            Solicita acceso privado a {title}
          </h3>

          <p className="mt-4 max-w-md text-sm leading-7 text-[#b8afa3] md:text-sm">
            Agenda una visita, solicita brochure o recibe atención personalizada
            para esta propiedad.
          </p>
        </div>

        <div className="xl:col-span-5 xl:flex xl:justify-end">
          <a
            href="https://wa.me/527442250891?text=Hola,%20me%20interesa%20la%20propiedad"
            className="inline-flex min-h-[58px] w-full items-center justify-center rounded-full border border-[#d6c3a1] px-6 py-3 text-xs uppercase tracking-[0.28em] text-[#f5f1eb] transition hover:bg-[#d6c3a1] hover:text-black xl:w-auto xl:min-w-[220px]"
          >
            Contactar ahora
          </a>
        </div>
      </div>
    </section>
  );
}
