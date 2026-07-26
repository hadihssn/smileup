import Image from "next/image";
import { dentist } from "@/data/site";
import { Reveal } from "@/components/ui/Reveal";

const infoTiles = [
  { label: "Qualification", value: dentist.qualification },
  { label: "Experience", value: dentist.experience },
  { label: "Focus", value: dentist.focus },
];

export function Dentist() {
  return (
    <section id="dentist" className="px-6 py-[clamp(64px,8vw,110px)]">
      <div className="mx-auto flex max-w-[1240px] flex-wrap items-center gap-14">
        <Reveal
          variant="left"
          className="min-w-70 max-w-[400px] flex-[1_1_320px]"
        >
          <div className="relative aspect-[3/4] overflow-hidden rounded-3xl bg-brand-tint shadow-[0_20px_50px_rgba(0,150,0,0.18)]">
            <Image
              src={dentist.photo}
              alt={dentist.name}
              fill
              sizes="(min-width: 1240px) 400px, 80vw"
              className="object-cover"
            />
          </div>
        </Reveal>

        <Reveal variant="right" className="min-w-75 flex-[1_1_380px]">
          <div className="mb-3 text-[13px] font-bold tracking-[0.08em] text-brand uppercase">
            Meet Your Dentist
          </div>
          <h2 className="mb-4.5 font-heading text-[clamp(1.8rem,3vw+1rem,2.4rem)] font-bold tracking-[-0.01em] text-ink">
            {dentist.name}
          </h2>
          <p className="mb-6 max-w-[520px] text-base text-muted">
            {dentist.bio}
          </p>
          <div className="mb-6 grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4">
            {infoTiles.map((tile) => (
              <div
                key={tile.label}
                className="rounded-2xl border border-line p-[16px_18px]"
              >
                <div className="mb-1 text-[12.5px] text-muted">
                  {tile.label}
                </div>
                <div className="text-[14.5px] font-bold text-ink">
                  {tile.value}
                </div>
              </div>
            ))}
          </div>
          <a
            href="#book"
            className="inline-block rounded-full bg-brand px-6.5 py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-brand-dark"
          >
            Book with Dr. Aftab
          </a>
        </Reveal>
      </div>
    </section>
  );
}
