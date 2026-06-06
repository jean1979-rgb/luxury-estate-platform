type Props = {
  price: string;
  bedrooms: number;
  bathrooms: number;
  area: string;
  location: string;
};

export default function PropertyFacts({
  price,
  bedrooms,
  bathrooms,
  area,
  location,
}: Props) {
  const items = [
    { label: "Precio", value: price },
    { label: "Recámaras", value: String(bedrooms) },
    { label: "Baños", value: String(bathrooms) },
    { label: "Superficie", value: area },
    { label: "Ubicación", value: location },
  ];

  return (
    <div className="rounded-[26px] border border-white/10 bg-[#121212] p-5 md:p-10">
      <p className="text-[13px] uppercase tracking-[0.4em] text-[#b8afa3]">
        Property Facts
      </p>

      <div className="mt-8">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex items-start justify-between gap-4 border-b border-white/10 py-4 md:gap-10 md:py-7"
          >
            <span className="text-[15px] text-[#b8afa3] md:text-[22px]">
              {item.label}
            </span>

            <span className="max-w-[60%] break-words text-right text-[16px] font-light text-[#f5f1eb] md:text-[20px]">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
