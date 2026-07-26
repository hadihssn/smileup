import { journeySteps } from "@/data/site";
import { Reveal } from "@/components/ui/Reveal";

export function Approach() {
  return (
    <section id="why" className="bg-section px-6 py-[clamp(64px,8vw,110px)]">
      <div className="mx-auto max-w-[1240px]">
        <Reveal
          variant="fade"
          className="mb-14 flex flex-wrap items-end gap-12"
        >
          <div className="min-w-70 flex-[2_1_420px]">
            <div className="mb-3 text-[13px] font-bold tracking-[0.08em] text-brand uppercase">
              Our Approach
            </div>
            <h2 className="font-heading text-[clamp(1.8rem,3vw+1rem,2.6rem)] font-bold tracking-[-0.01em] text-ink">
              Every treatment starts with a conversation, not a drill.
            </h2>
          </div>
          <p className="min-w-65 flex-[1_1_320px] text-[15.5px] text-muted">
            Most dental visits jump straight to treatment. At SmileUp, we
            slow down first — understanding your history, your anxieties,
            and your goals — so the plan we build actually fits your life,
            not just your teeth.
          </p>
        </Reveal>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(230px,1fr))] gap-7">
          {journeySteps.map((step) => (
            <Reveal key={step.n} variant="fade">
              <div className="mb-5.5 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand font-heading text-xl font-bold text-white shadow-[0_10px_26px_rgba(0,150,0,0.28)]">
                {step.n}
              </div>
              <h3 className="mb-2.5 text-lg font-bold text-ink">
                {step.title}
              </h3>
              <p className="text-[14.5px] text-muted">{step.desc}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
