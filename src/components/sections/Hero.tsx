"use client";

import Image from "next/image";
import { contact } from "@/data/site";
import { useCountUp } from "@/hooks/useCountUp";

export function Hero() {
  const { ref: statsRef, values } = useCountUp([12, 6000, 4.9]);
  const [years, patients, rating] = values;

  return (
    <section
      id="top"
      className="mx-auto flex max-w-[1240px] flex-wrap-reverse items-center gap-14 px-6 py-[clamp(48px,8vw,96px)]"
    >
      <div className="min-w-80 flex-[1_1_440px]">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-brand-tint px-3.5 py-1.5 text-[13px] font-semibold text-brand-dark">
          <span className="h-1.5 w-1.5 rounded-full bg-brand" />
          Now accepting new patients
        </div>

        <h1 className="mb-5.5 font-heading text-[clamp(2.4rem,4.5vw+1rem,4rem)] leading-[1.08] font-bold tracking-[-0.02em] text-ink">
          Your smile, elevated with expert care.
        </h1>

        <p className="mb-8 max-w-[480px] text-lg text-muted">
          SmileUp pairs experienced dentistry with a calm, modern clinic
          experience — so every visit feels easy, comfortable, and worth
          smiling about.
        </p>

        <div className="flex flex-wrap gap-3.5">
          <a
            href="#book"
            className="rounded-full bg-brand px-7 py-4 text-base font-semibold text-white shadow-[0_8px_24px_rgba(0,185,0,0.32)] transition-[background-color,transform] hover:-translate-y-px hover:bg-brand-dark"
          >
            Book Appointment
          </a>
          <a
            href={contact.whatsappHref}
            target="_blank"
            rel="noopener"
            className="flex items-center gap-2.5 rounded-full border-[1.5px] border-brand bg-white px-6.5 py-4 text-base font-semibold text-brand transition-colors hover:bg-brand-tint"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-brand">
              <span className="h-2.5 w-2.5 rounded-[3px] bg-white" />
            </span>
            Chat on WhatsApp
          </a>
        </div>

        <div ref={statsRef} data-reveal="fade" className="mt-11 flex flex-wrap gap-8">
          <div>
            <div className="font-heading text-[28px] font-bold text-ink">
              {Math.round(years)}+
            </div>
            <div className="text-[13px] text-muted">Years experience</div>
          </div>
          <div>
            <div className="font-heading text-[28px] font-bold text-ink">
              {Math.round(patients).toLocaleString()}+
            </div>
            <div className="text-[13px] text-muted">Happy patients</div>
          </div>
          <div>
            <div className="font-heading text-[28px] font-bold text-ink">
              {rating.toFixed(1)}★
            </div>
            <div className="text-[13px] text-muted">Patient rating</div>
          </div>
        </div>
      </div>

      <div className="min-w-80 relative flex-[1.3_1_420px]">
        <div className="relative aspect-[4/5] overflow-hidden rounded-[28px] bg-brand-tint shadow-[0_24px_60px_rgba(0,150,0,0.2)]">
          <Image
            src="https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=1000&q=80"
            alt="Patient smiling after a SmileUp dental appointment"
            fill
            priority
            sizes="(min-width: 1240px) 620px, 90vw"
            className="object-cover"
          />
          <div className="absolute right-5 bottom-5 left-5 flex items-center gap-3 rounded-2xl bg-white p-4 shadow-[0_12px_28px_rgba(0,0,0,0.14)]">
            <Image
              src="https://images.unsplash.com/photo-1489980557514-251d61e3eeb6?auto=format&fit=crop&w=100&q=80"
              alt="Amara O., verified SmileUp patient"
              width={40}
              height={40}
              className="h-10 w-10 shrink-0 rounded-full object-cover"
            />
            <div>
              <div className="text-sm font-semibold text-ink">
                &ldquo;Best dental experience I&rsquo;ve had.&rdquo;
              </div>
              <div className="mt-0.5 text-xs text-muted">
                Amara O. — verified patient
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
