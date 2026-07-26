import Image from "next/image";
import { gallery } from "@/data/site";
import { Reveal } from "@/components/ui/Reveal";

export function Gallery() {
  return (
    <section id="gallery" className="bg-section px-6 py-[clamp(64px,8vw,110px)]">
      <div className="mx-auto max-w-[1240px]">
        <Reveal variant="fade" className="mb-12 max-w-[600px]">
          <div className="mb-3 text-[13px] font-bold tracking-[0.08em] text-brand uppercase">
            Real Results
          </div>
          <h2 className="font-heading text-[clamp(1.8rem,3vw+1rem,2.6rem)] font-bold tracking-[-0.01em] text-ink">
            Before &amp; after transformations.
          </h2>
        </Reveal>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-6">
          {gallery.map((item) => (
            <Reveal
              key={item.title}
              variant="scale"
              className="overflow-hidden rounded-[20px] border border-line bg-white"
            >
              <div className="grid grid-cols-2">
                <div className="relative aspect-square bg-[#eef3f0]">
                  <Image
                    src={item.img}
                    alt={`${item.title} — before`}
                    fill
                    sizes="(min-width: 1240px) 280px, 45vw"
                    className="object-cover brightness-95 contrast-90 grayscale"
                  />
                  <span className="absolute bottom-2.5 left-1/2 -translate-x-1/2 rounded-md bg-white px-2 py-1 font-mono text-[11px] text-muted">
                    before
                  </span>
                </div>
                <div className="relative aspect-square bg-brand-tint">
                  <Image
                    src={item.img}
                    alt={`${item.title} — after`}
                    fill
                    sizes="(min-width: 1240px) 280px, 45vw"
                    className="object-cover"
                  />
                  <span className="absolute bottom-2.5 left-1/2 -translate-x-1/2 rounded-md bg-white px-2 py-1 font-mono text-[11px] text-brand-dark">
                    after
                  </span>
                </div>
              </div>
              <div className="p-[18px_20px]">
                <h3 className="mb-1 text-[15.5px] font-bold text-ink">
                  {item.title}
                </h3>
                <p className="text-[13.5px] text-muted">{item.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
