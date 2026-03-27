type Props = {
  src: string;
};

export default function VideoHero({ src }: Props) {
  return (
    <div className="relative h-[70vh] w-full overflow-hidden rounded-[28px] border border-white/10">
      <video
        src={src}
        autoPlay
        muted
        loop
        playsInline
        className="h-full w-full object-cover"
      />

      <div className="absolute inset-0 bg-black/30" />
    </div>
  );
}
