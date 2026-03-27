import Link from "next/link";

type Props = {
  id: string;
  title: string;
  location: string;
  image: string;
  badge?: string;
  eyebrow?: string;
};

export default function PropertyCard({
  id,
  title,
  location,
  image,
  badge,
  eyebrow = "Private Listing",
}: Props) {
  return (
    <Link href={`/properties/${id}`} className="group block">
      <article className="overflow-hidden rounded-[34px] border border-white/10 bg-[#111111] shadow-[0_20px_80px_rgba(0,0,0,0.35)]">
        <div className="relative h-[620px] overflow-hidden">
          <img
            src={image}
            alt={title}
            className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

          <div className="absolute left-0 right-0 top-0 flex items-center justify-between p-5">
            <span className="rounded-full border border-white/15 bg-black/20 px-3 py-1 text-[10px] uppercase tracking-[0.32em] text-white/65 backdrop-blur-sm">
              {badge || "Curated"}
            </span>

            <span className="text-[10px] uppercase tracking-[0.32em] text-white/45 transition group-hover:text-white/75">
              View
            </span>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-7">
            <p className="text-[10px] uppercase tracking-[0.34em] text-[#d8c7a6]">
              {eyebrow}
            </p>

            <h3 className="mt-3 text-2xl font-light leading-tight text-white md:text-[30px]">
              {title}
            </h3>

            <p className="mt-3 max-w-[85%] text-sm text-white/68 md:text-[15px]">
              {location}
            </p>

            <div className="mt-6 h-px w-12 bg-white/25 transition duration-500 group-hover:w-20 group-hover:bg-white/60" />
          </div>
        </div>
      </article>
    </Link>
  );
}
