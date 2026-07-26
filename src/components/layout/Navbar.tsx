"use client";

import { useState } from "react";
import { contact, navLinks } from "@/data/site";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-line bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1240px] items-center justify-between gap-4 px-6 py-4">
        <a href="#top" className="flex shrink-0 items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand font-heading text-[17px] font-bold text-white">
            S
          </span>
          <span className="font-heading text-xl font-bold text-ink">
            SmileUp
          </span>
        </a>

        <div className="hidden items-center gap-7 nav:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-[15px] font-medium text-ink/80 hover:text-ink"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <a
            href={contact.phoneHref}
            className="hidden whitespace-nowrap text-sm font-semibold text-ink nav:block"
          >
            {contact.phone}
          </a>
          <a
            href="#book"
            className="whitespace-nowrap rounded-full bg-brand px-5 py-[11px] text-sm font-semibold text-white shadow-[0_4px_14px_rgba(0,185,0,0.28)] transition-colors hover:bg-brand-dark"
          >
            Book Appointment
          </a>
          <button
            type="button"
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="flex h-10 w-10 flex-col items-center justify-center gap-1 rounded-[10px] border border-line bg-white nav:hidden"
          >
            <span className="h-0.5 w-[18px] rounded-full bg-ink" />
            <span className="h-0.5 w-[18px] rounded-full bg-ink" />
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="flex flex-col gap-3.5 border-t border-line bg-white px-6 pt-3 pb-5 nav:hidden">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="text-[15px] font-semibold text-ink"
            >
              {link.label}
            </a>
          ))}
          <a
            href={contact.phoneHref}
            className="text-[15px] font-semibold text-brand"
          >
            {contact.phone}
          </a>
        </div>
      )}
    </nav>
  );
}
