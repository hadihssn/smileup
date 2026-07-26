"use client";

import type { ReactNode } from "react";
import { useReveal } from "@/hooks/useReveal";

type RevealVariant = "fade" | "scale" | "left" | "right";

/**
 * Wraps children in a div that fades/slides/scales into view on scroll
 * (see the [data-reveal] rules in globals.css and the useReveal hook).
 * Used for every repeated card across the page instead of calling
 * useReveal directly in each section, since hooks can't be called inside
 * a .map() loop.
 */
export function Reveal({
  variant = "fade",
  className,
  children,
}: {
  variant?: RevealVariant;
  className?: string;
  children: ReactNode;
}) {
  const ref = useReveal<HTMLDivElement>();

  return (
    <div ref={ref} data-reveal={variant} className={className}>
      {children}
    </div>
  );
}
