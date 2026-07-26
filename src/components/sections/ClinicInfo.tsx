import { contact, hours } from "@/data/site";
import { Reveal } from "@/components/ui/Reveal";

export function ClinicInfo() {
  return (
    <section id="contact" className="px-6 py-[clamp(64px,8vw,110px)]">
      <div className="mx-auto grid max-w-[1240px] grid-cols-[repeat(auto-fit,minmax(320px,1fr))] items-stretch gap-10">
        <Reveal variant="left">
          <div className="mb-3 text-[13px] font-bold tracking-[0.08em] text-brand uppercase">
            Visit Us
          </div>
          <h2 className="mb-6 font-heading text-[clamp(1.8rem,3vw+1rem,2.4rem)] font-bold tracking-[-0.01em] text-ink">
            Clinic Information
          </h2>

          <div className="flex flex-col gap-5">
            <div>
              <div className="mb-1 text-[12.5px] text-muted">Address</div>
              <div className="text-[15.5px] font-semibold text-ink">
                {contact.address}
              </div>
            </div>
            <div>
              <div className="mb-1 text-[12.5px] text-muted">Phone</div>
              <a
                href={contact.phoneHref}
                className="text-[15.5px] font-semibold text-ink"
              >
                {contact.phone}
              </a>
            </div>
            <div>
              <div className="mb-1 text-[12.5px] text-muted">WhatsApp</div>
              <a
                href={contact.whatsappHref}
                target="_blank"
                rel="noopener"
                className="text-[15.5px] font-semibold text-brand"
              >
                Message us directly →
              </a>
            </div>
            <div>
              <div className="mb-1 text-[12.5px] text-muted">Email</div>
              <a
                href={`mailto:${contact.email}`}
                className="text-[15.5px] font-semibold text-ink"
              >
                {contact.email}
              </a>
            </div>
            <div>
              <div className="mb-2.5 text-[12.5px] text-muted">
                Opening Hours
              </div>
              <div className="flex max-w-[340px] flex-col">
                {hours.map((h) => (
                  <div
                    key={h.day}
                    className="flex justify-between border-b border-line py-2.5 text-sm"
                  >
                    <span className="font-bold tracking-[0.04em] text-ink uppercase">
                      {h.day}
                    </span>
                    <span className="text-muted">{h.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal
          variant="right"
          className="min-h-80 overflow-hidden rounded-[20px] border border-line"
        >
          <iframe
            title="Clinic location map"
            src={contact.mapEmbedSrc}
            className="h-full min-h-80 w-full border-0"
            loading="lazy"
          />
        </Reveal>
      </div>
    </section>
  );
}
