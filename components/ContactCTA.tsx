type Props = {
  title: string;
  location?: string;
  price?: string;
  propertyUrl?: string;
};

export default function ContactCTA({
  title,
  location,
  price,
  propertyUrl,
}: Props) {
  const message = [
    "Hola, me interesa esta propiedad:",
    "",
    title,
    location ? `Ubicación: ${location}` : "",
    price ? `Precio: ${price}` : "",
    propertyUrl ? `Link: ${propertyUrl}` : "",
    "",
    "¿Podrían enviarme más información?",
  ]
    .filter(Boolean)
    .join("\n");

  const whatsappUrl = `https://wa.me/527442250891?text=${encodeURIComponent(
    message,
  )}`;

  return (
    <section className="rounded-[28px] border border-white/10 bg-[#121212] p-10">
      <p className="text-[10px] uppercase tracking-[0.35em] text-[#d6c3a1]">
        Private Access
      </p>

      <div className="mt-5 flex flex-col gap-8">
        <div>
          <h3 className="max-w-[14ch] text-3xl font-light leading-[0.98] md:text-3xl xl:text-[44px]">
            Solicita acceso privado
          </h3>

          <p className="mt-4 max-w-md text-sm leading-7 text-[#b8afa3] md:text-sm">
            Agenda una visita, solicita brochure o recibe atención personalizada
            para esta propiedad.
          </p>
        </div>

        <div className="flex">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[58px] w-full items-center justify-center rounded-full border border-[#d6c3a1] px-6 py-3 text-xs uppercase tracking-[0.28em] text-[#f5f1eb] transition hover:bg-[#d6c3a1] hover:text-black md:w-auto md:min-w-[220px]"
          >
            Contactar ahora
          </a>
        </div>
      </div>
    </section>
  );
}
