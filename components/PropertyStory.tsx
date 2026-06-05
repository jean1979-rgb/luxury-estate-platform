"use client";

import { useState } from "react";

type Props = {
  tagline: string;
  description: string;
};

export default function PropertyStory({ tagline, description }: Props) {
  const [expanded, setExpanded] = useState(false);

  const paragraphs = description
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  const mobileParagraphs = expanded ? paragraphs : paragraphs.slice(0, 1);

  return (
    <section className="grid gap-8 md:grid-cols-12 md:gap-10">
      <div className="md:col-span-4">
        <p className="text-[10px] uppercase tracking-[0.35em] text-[#d6c3a1]">
          Editorial Note
        </p>
        <h2 className="mt-4 text-2xl font-light leading-tight md:text-4xl">
          {tagline}
        </h2>
      </div>

      <div className="md:col-span-8">
        <div className="max-w-3xl space-y-5 text-sm leading-7 text-[#b8afa3] md:hidden">
          {mobileParagraphs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}

          {paragraphs.length > 1 ? (
            <button
              type="button"
              onClick={() => setExpanded((value) => !value)}
              className="mt-2 inline-flex rounded-full border border-[#d6c3a1]/50 px-5 py-2 text-[11px] uppercase tracking-[0.24em] text-[#d6c3a1] transition hover:bg-[#d6c3a1] hover:text-black"
            >
              {expanded ? "Leer menos" : "Leer más"}
            </button>
          ) : null}
        </div>

        <div className="hidden max-w-3xl space-y-6 text-lg leading-8 text-[#b8afa3] md:block">
          {paragraphs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </div>
    </section>
  );
}
