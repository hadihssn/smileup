"use client";

import { useEffect, useRef, useState } from "react";

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * Animates a set of numbers from 0 up to their target values, once, the
 * first time the returned ref scrolls into view. Used for the hero's
 * "12+ years / 6,000+ patients / 4.9★ rating" counters.
 */
export function useCountUp(targets: number[], duration = 1200) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [values, setValues] = useState<number[]>(() => targets.map(() => 0));
  const hasAnimated = useRef(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || hasAnimated.current) return;
        hasAnimated.current = true;

        const start = performance.now();
        const tick = (now: number) => {
          const progress = Math.min(1, (now - start) / duration);
          const eased = easeOutCubic(progress);
          setValues(targets.map((target) => target * eased));
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );

    observer.observe(node);
    return () => observer.disconnect();
    // targets/duration are expected to be stable literals at each call site.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { ref, values };
}
