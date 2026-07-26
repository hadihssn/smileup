import Image from "next/image";
import { testimonials } from "@/data/site";
import { Reveal } from "@/components/ui/Reveal";

export function Testimonials() {
  return (
    <section
      id="testimonials"
      className="bg-section px-6 py-[clamp(64px,8vw,110px)]"
    >
      <div className="mx-auto max-w-[1240px]">
        <Reveal variant="fade" className="mb-12 max-w-[600px]">
          <div className="mb-3 text-[13px] font-bold tracking-[0.08em] text-brand uppercase">
            Patient Stories
          </div>
          <h2 className="font-heading text-[clamp(1.8rem,3vw+1rem,2.6rem)] font-bold tracking-[-0.01em] text-ink">
            Loved by our patients.
          </h2>
        </Reveal>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6">
          {testimonials.map((t) => (
            <Reveal
              key={t.name}
              variant="fade"
              className="rounded-[20px] border border-line bg-white p-[28px_26px]"
            >
              <div className="mb-3.5 text-[15px] tracking-[2px] text-brand">
                {t.stars}
              </div>
              <p className="mb-5 text-[15px] text-[#2c3a34]">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <Image
                  src={t.avatar}
                  alt={t.name}
                  width={38}
                  height={38}
                  className="h-9.5 w-9.5 shrink-0 rounded-full object-cover"
                />
                <div>
                  <div className="text-sm font-bold text-ink">{t.name}</div>
                  <div className="text-[12.5px] text-muted">
                    {t.location}
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
