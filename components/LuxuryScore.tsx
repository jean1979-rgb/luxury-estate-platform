type Props = {
  value: number;
};

export default function LuxuryScore({ value }: Props) {
  return (
    <div className="rounded-[26px] border border-white/10 bg-[#121212] p-10 text-center">
      <p className="text-[12px] uppercase tracking-[0.4em] text-[#b8afa3]">
        Luxury Score
      </p>

      <div className="mt-6 text-[64px] font-light text-[#d6c3a1] leading-none">
        {value}
      </div>

      <div className="mt-3 text-[12px] uppercase tracking-[0.35em] text-[#b8afa3]">
        curated index
      </div>
    </div>
  );
}
