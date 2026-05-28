type Props = {
  tagline: string;
  description: string;
};

export default function PropertyStory({ tagline, description }: Props) {
  return (
    <section className="grid gap-8 md:grid-cols-12 md:gap-10">
      <div className="md:col-span-4">
        <p className="text-[10px] uppercase tracking-[0.35em] text-[#d6c3a1]">
          Editorial Note
        </p>
        <h2 className="mt-4 text-3xl font-light leading-tight md:text-4xl">
          {tagline}
        </h2>
      </div>

      <div className="md:col-span-8">
        <div className="max-w-3xl space-y-6 text-base leading-8 text-[#b8afa3] md:text-lg">
          {description
            .split(/\n\s*\n/)
            .filter(Boolean)
            .map((paragraph, index) => (
              <p key={index}>
                {paragraph}
              </p>
            ))}
        </div>
      </div>
    </section>
  );
}
