"use client";

import { useState } from "react";
import { faq } from "@/data/site";
import { Reveal } from "@/components/ui/Reveal";

export function Faq() {
  const [openIndexes, setOpenIndexes] = useState<Set<number>>(new Set());

  function toggle(index: number) {
    setOpenIndexes((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }

  return (
    <section id="faq" className="px-6 py-[clamp(64px,8vw,110px)]">
      <div className="mx-auto max-w-[800px]">
        <Reveal variant="fade" className="mb-12 text-center">
          <div className="mb-3 text-[13px] font-bold tracking-[0.08em] text-brand uppercase">
            FAQ
          </div>
          <h2 className="font-heading text-[clamp(1.8rem,3vw+1rem,2.4rem)] font-bold tracking-[-0.01em] text-ink">
            Common questions.
          </h2>
        </Reveal>

        <div className="flex flex-col gap-3">
          {faq.map((item, index) => {
            const isOpen = openIndexes.has(index);
            return (
              <Reveal
                key={item.q}
                variant="fade"
                className="overflow-hidden rounded-2xl border border-line bg-white"
              >
                <button
                  type="button"
                  onClick={() => toggle(index)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 p-[20px_22px] text-left"
                >
                  <span className="text-[15.5px] font-semibold text-ink">
                    {item.q}
                  </span>
                  <span className="shrink-0 text-xl text-brand">
                    {isOpen ? "−" : "+"}
                  </span>
                </button>
                {isOpen && (
                  <div className="px-[22px] pb-5 text-[14.5px] text-muted">
                    {item.a}
                  </div>
                )}
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
