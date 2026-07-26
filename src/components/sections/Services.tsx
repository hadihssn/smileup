import { services } from "@/data/site";
import { Reveal } from "@/components/ui/Reveal";

export function Services() {
  return (
    <section id="services" className="px-6 py-[clamp(64px,8vw,110px)]">
      <div className="mx-auto max-w-[1240px]">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-5">
          <Reveal variant="fade" className="max-w-[600px]">
            <div className="mb-3 text-[13px] font-bold tracking-[0.08em] text-brand uppercase">
              Our Services
            </div>
            <h2 className="font-heading text-[clamp(1.8rem,3vw+1rem,2.6rem)] font-bold tracking-[-0.01em] text-ink">
              Complete care, one clinic.
            </h2>
          </Reveal>
          <a
            href="#book"
            className="text-[15px] font-semibold whitespace-nowrap text-brand"
          >
            View all treatments →
          </a>
        </div>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-6">
          {services.map((service) => (
            <Reveal
              key={service.code}
              variant="fade"
              className="rounded-[20px] border border-line bg-white p-[30px_26px] shadow-[0_4px_16px_rgba(20,32,27,0.03)] transition-[box-shadow,transform] duration-[250ms] hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(0,150,0,0.16)]"
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-[14px] bg-brand-tint font-heading text-sm font-bold text-brand-dark">
                {service.code}
              </div>
              <h3 className="mb-2 text-lg font-bold text-ink">
                {service.title}
              </h3>
              <p className="text-[14.5px] text-muted">{service.desc}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
