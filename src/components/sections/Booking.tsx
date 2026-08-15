"use client";

import { useEffect, useState, type FormEvent } from "react";
import { services } from "@/data/site";
import { useReveal } from "@/hooks/useReveal";
import { fetchAvailableSlots, submitBooking } from "@/app/actions/booking";

interface BookingFormData {
  name: string;
  phone: string;
  treatment: string;
  date: string;
  time: string;
  message: string;
}

const initialFormData: BookingFormData = {
  name: "",
  phone: "",
  treatment: "",
  date: "",
  time: "",
  message: "",
};

function formatSlotLabel(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

export function Booking() {
  const textRef = useReveal<HTMLDivElement>();
  const formRef = useReveal<HTMLFormElement>();
  const [formData, setFormData] = useState<BookingFormData>(initialFormData);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Tracks which date the fetched slots belong to, alongside the slots
  // themselves, rather than a separate `loadingSlots` boolean set eagerly
  // at the top of the effect. "Loading" is then derived (slotsFor.date !==
  // formData.date) instead of set directly — every setState call below
  // happens inside the async .then() callback, none synchronously in the
  // effect body, which is what avoids the cascading-render footgun the
  // "no setState directly in an effect" lint rule is guarding against.
  const [slotsFor, setSlotsFor] = useState<{ date: string; slots: string[] }>({
    date: "",
    slots: [],
  });
  const loadingSlots = formData.date !== "" && slotsFor.date !== formData.date;
  const availableSlots = slotsFor.date === formData.date ? slotsFor.slots : [];

  // Whenever the chosen date changes, ask the server which times are still
  // open — this list can go stale (someone else books a slot) between here
  // and submit, which is why submitBooking re-checks server-side too; this
  // fetch is just for showing the patient a useful picker, not a guarantee.
  useEffect(() => {
    // Nothing to fetch without a date — the time-slot field itself is only
    // rendered once formData.date is set.
    if (!formData.date) return;
    let cancelled = false;
    fetchAvailableSlots(formData.date).then((slots) => {
      if (!cancelled) setSlotsFor({ date: formData.date, slots });
    });
    return () => {
      cancelled = true;
    };
  }, [formData.date]);

  function updateField<K extends keyof BookingFormData>(
    field: K,
    value: BookingFormData[K],
  ) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError(null);
    setIsSubmitting(true);
    const result = await submitBooking({
      name: formData.name,
      phone: formData.phone,
      serviceTitle: formData.treatment,
      date: formData.date,
      time: formData.time,
      message: formData.message,
    });
    setIsSubmitting(false);
    if (result.ok) {
      setSubmitted(true);
    } else {
      setSubmitError(result.error);
    }
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
                  required
                  min={new Date().toISOString().slice(0, 10)}
                  value={formData.date}
                  onChange={(e) => {
                    updateField("date", e.target.value);
                    updateField("time", "");
                  }}
                  className="w-full rounded-[10px] border border-line px-3.5 py-3 font-[inherit] text-[14.5px]"
                />
              </div>
              {formData.date && (
                <div>
                  <label className="mb-1.5 block text-[13px] font-semibold text-ink">
                    Preferred Time
                  </label>
                  <select
                    required
                    value={formData.time}
                    onChange={(e) => updateField("time", e.target.value)}
                    disabled={loadingSlots || availableSlots.length === 0}
                    className="w-full rounded-[10px] border border-line bg-white px-3.5 py-3 font-[inherit] text-[14.5px] disabled:opacity-60"
                  >
                    <option value="">
                      {loadingSlots
                        ? "Loading available times…"
                        : availableSlots.length === 0
                          ? "No times available this day"
                          : "Select a time"}
                    </option>
                    {availableSlots.map((slot) => (
                      <option key={slot} value={slot}>
                        {formatSlotLabel(slot)}
                      </option>
                    ))}
                  </select>
                </div>
              )}
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
              {submitError && (
                <p className="text-[13.5px] font-medium text-red-600">{submitError}</p>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-1 rounded-xl bg-brand px-5 py-4 text-[15.5px] font-bold text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
              >
                {isSubmitting ? "Requesting…" : "Request Appointment"}
              </button>
            </>
          )}
        </form>
      </div>
    </section>
  );
}
