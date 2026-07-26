"use client";

import { useEffect, useRef } from "react";

/**
 * Attach the returned ref to any element with a `data-reveal` attribute
 * (see the [data-reveal] rules in globals.css) to fade/slide/scale it in
 * once it enters the viewport, and back out if it scrolls out of view.
 */
export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        node.classList.toggle("is-revealed", entry.isIntersecting);
      },
      { threshold: 0.15 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return ref;
}
