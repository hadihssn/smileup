"use client";

import { useState, type FormEvent } from "react";
import { services } from "@/data/site";
import { useReveal } from "@/hooks/useReveal";

interface BookingFormData {
  name: string;
  phone: string;
  treatment: string;
  date: string;
  message: string;
}

const initialFormData: BookingFormData = {
  name: "",
  phone: "",
  treatment: "",
  date: "",
  message: "",
};

export function Booking() {
  const textRef = useReveal<HTMLDivElement>();
  const formRef = useReveal<HTMLFormElement>();
  const [formData, setFormData] = useState<BookingFormData>(initialFormData);
  const [submitted, setSubmitted] = useState(false);

  function updateField<K extends keyof BookingFormData>(
    field: K,
    value: BookingFormData[K],
  ) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // No backend yet — see design-reference README. This should POST to
    // whatever booking system/CRM the clinic ends up using.
    setSubmitted(true);
  }

  return (
    <section id="book" className="bg-brand px-6 py-[clamp(64px,8vw,110px)]">
      <div className="mx-auto grid max-w-[1240px] grid-cols-[repeat(auto-fit,minmax(320px,1fr))] items-center gap-12">
        <div ref={textRef} data-reveal="left">
          <div className="mb-3 text-[13px] font-bold tracking-[0.08em] text-[#dfffdf] uppercase">
            Book Now
          </div>
          <h2 className="mb-4 font-heading text-[clamp(1.8rem,3vw+1rem,2.6rem)] font-bold tracking-[-0.01em] text-white">
            Let&rsquo;s get your smile started.
          </h2>
          <p className="max-w-[420px] text-base text-[#e5ffe5]">
            Fill in your details and our team will confirm your appointment
            within one business day.
          </p>
        </div>

        <form
          ref={formRef}
          data-reveal="right"
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 rounded-3xl bg-white p-8 shadow-[0_24px_60px_rgba(0,0,0,0.2)]"
        >
          {submitted ? (
            <div className="px-2 py-6 text-center">
              <div className="mb-2 text-3xl">✓</div>
              <h3 className="mb-2 text-lg font-bold text-ink">
                Request received!
              </h3>
              <p className="text-[14.5px] text-muted">
                We&rsquo;ll call or WhatsApp you shortly to confirm.
              </p>
            </div>
          ) : (
            <>
              <div>
                <label className="mb-1.5 block text-[13px] font-semibold text-ink">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="Jane Doe"
                  className="w-full rounded-[10px] border border-line px-3.5 py-3 font-[inherit] text-[14.5px]"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[13px] font-semibold text-ink">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  placeholder="+1 555 000 0000"
                  className="w-full rounded-[10px] border border-line px-3.5 py-3 font-[inherit] text-[14.5px]"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[13px] font-semibold text-ink">
                  Treatment
                </label>
                <select
                  value={formData.treatment}
                  onChange={(e) => updateField("treatment", e.target.value)}
                  className="w-full rounded-[10px] border border-line bg-white px-3.5 py-3 font-[inherit] text-[14.5px]"
                >
                  <option value="">Select a treatment</option>
                  {services.map((s) => (
                    <option key={s.code} value={s.title}>
                      {s.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-[13px] font-semibold text-ink">
                  Preferred Date
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => updateField("date", e.target.value)}
                  className="w-full rounded-[10px] border border-line px-3.5 py-3 font-[inherit] text-[14.5px]"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[13px] font-semibold text-ink">
                  Message (optional)
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => updateField("message", e.target.value)}
                  placeholder="Anything we should know?"
                  rows={3}
                  className="w-full resize-y rounded-[10px] border border-line px-3.5 py-3 font-[inherit] text-[14.5px]"
                />
              </div>
              <button
                type="submit"
                className="mt-1 rounded-xl bg-brand px-5 py-4 text-[15.5px] font-bold text-white transition-colors hover:bg-brand-dark"
              >
                Request Appointment
              </button>
            </>
          )}
        </form>
      </div>
    </section>
  );
}
