# Handoff: SmileUp Dental Clinic Website

## Overview
A single-page marketing/booking website for a dental clinic brand called "SmileUp." Goal: increase appointment bookings while building trust, with a clean, premium, green-accented healthcare aesthetic.

## About the Design Files
The file in this bundle (`SmileUp.dc.html`) is a **design reference** built in HTML — a high-fidelity prototype showing intended look, layout, copy, and interactions. It is not production code to copy directly. The task is to **recreate this design in the target codebase's environment** (e.g. React/Next.js, Vue, or plain HTML/CSS/JS — whichever the project uses or is best suited, if none exists yet), using that environment's own component patterns, build tooling, and asset pipeline.

Note: the file has a custom `.dc.html` wrapper format (template + logic class) specific to the design tool it was built in. Treat it as a readable reference for markup structure, inline styles, and behavior — not literal source to paste in. Open it directly in a browser to see it render.

## Fidelity
**High-fidelity.** Colors, typography, spacing, copy, and interactions are final/near-final. Recreate pixel-close using the codebase's existing libraries and patterns; swap in the codebase's typography/spacing scale only if it already has one that's compatible.

## Screens / Sections
Single scrolling page, in this order:

1. **Sticky Nav** — logo (green circle "S" + wordmark), center links (Why Us, Services, Gallery, Dentist, Reviews, Contact, FAQ), phone number, "Book Appointment" pill button. Below 1080px width: links/phone collapse into a hamburger menu that expands a full-width dropdown.
2. **Hero** — two-column (reverses to stacked on narrow screens): left = eyebrow badge ("Now accepting new patients"), H1 "Your smile, elevated with expert care.", subtext, two CTAs (primary solid green "Book Appointment", secondary outlined "Chat on WhatsApp"), a row of 3 animated stats (Years experience, Happy patients, Patient rating). Right = large rounded photo (4:5) with a floating testimonial card bottom-overlay and a small floating circular photo accent top-right.
3. **Our Approach** — light green section background. Header row: eyebrow "Our Approach", H2 "Every treatment starts with a conversation, not a drill.", plus a short supporting paragraph. Below: a 4-step patient-journey grid (numbered green badges 01–04): Listen & Assess, Plan Together, Treat with Care, Stay in Touch — each with a short description. This replaces a generic "why choose us" feature-list with a process narrative specific to how the clinic works.
4. **Services** — white background, 8 cards in an auto-fit grid: Teeth Whitening, Dental Implants, Braces & Aligners, Root Canal, Veneers, Crowns & Bridges, Dental Cleaning, Cosmetic Dentistry. Each card: colored icon-badge with 2-letter code, title, description. No pricing shown (explicitly removed per client request).
5. **Before & After Gallery** — light green background, 4 cards, each split into two square image tiles labeled "before"/"after" (built here via a single photo with a grayscale filter for "before" vs full color for "after" — recreate with real before/after photography if available).
6. **Meet the Dentist** — Dr. Saad Aftab: portrait photo, bio paragraph, 3 info tiles (Qualification: BDS, MDS Prosthodontics; Experience: 12+ years; Focus: Implants & Cosmetic Dentistry), CTA button.
7. **Testimonials** — light green background, 4 cards with star rating, quote, avatar photo, name, location.
8. **Clinic Information** — two columns: address/phone/WhatsApp/email, and an embedded Google Map (iframe). Opening hours are listed as one row per day (Monday–Sunday), each with a bottom divider, day label left / time right — not grouped ranges.
9. **Appointment CTA** — solid green section, left = heading/subtext, right = white card form (Name, Phone, Treatment select, Preferred Date, Message, submit button). Submitting shows an inline success state (no real backend — needs wiring to actual booking/CRM system).
10. **FAQ** — 6-item accordion (click question to expand/collapse answer).
11. **Footer** — dark green background, 4 columns (brand blurb, nav links, contact links, social icons), bottom bar with copyright + legal links.
12. **Floating WhatsApp button** — fixed bottom-right circular button, all screens.

## Interactions & Behavior
- **Sticky nav**: `position: sticky; top: 0` with backdrop blur; collapses to hamburger below 1080px viewport width (JS resize listener, not just CSS media query, in the prototype).
- **Smooth anchor scrolling**: all in-page nav links (`#why`, `#services`, etc.) scroll smoothly (`scroll-behavior: smooth` on `<html>`).
- **Scroll-reveal animations**: most section headers and cards fade/slide/scale into place as they enter the viewport (via `IntersectionObserver`, threshold 0.15), and **reverse** (fade back out) when scrolled back out of view. Variants used: `fade` (opacity + translateY), `scale` (opacity + scale), `left`/`right` (opacity + translateX). Transition: 0.8s, `cubic-bezier(0.16,1,0.3,1)`.
- **Animated stat counters**: the 3 hero stats (12+ years, 6,000+ patients, 4.9★ rating) count up from 0 once, triggered when they scroll into view (`IntersectionObserver` + `requestAnimationFrame`, ease-out-cubic, ~1.2s).
- **FAQ accordion**: click toggles one item's expanded state independently per item (multiple can be open at once); "+" becomes "−" when open.
- **Appointment form**: controlled inputs (name, phone, treatment dropdown populated from the services list, date picker, message textarea); on submit, prevents default and shows a success confirmation panel in place of the form. No real submission endpoint — needs to POST to whatever booking system/CRM/email service the clinic uses.
- **Hover states**: nav CTA and hero CTAs darken on hover; service cards lift with a stronger shadow on hover; WhatsApp floating button scales up slightly on hover.

## State Management
- `mobileMenuOpen` (bool) — hamburger menu toggle.
- `isNarrow` (bool) — derived from `window.innerWidth < 1080`, drives nav/hamburger display.
- `formData` (object: name, phone, treatment, date, message) + `formSubmitted` (bool).
- `faqOpen` (map of index → bool) — independent per FAQ item.
- `animYears`, `animPatients`, `animRating`, `statsAnimated` — drive the counting-up stat animation.
- Reveal animation state is DOM-driven (CSS class toggle via IntersectionObserver), not component state — fine to reimplement the same way, or via a framework's intersection-observer hook (e.g. `react-intersection-observer`) driving a CSS class/animation variant.

## Design Tokens

**Colors**
- Brand primary green: `#00B900`
- Green hover/darker: `#009600`
- Light green tint (badges/icon backgrounds): `#E3F9E3`
- Light green section background: `#F2FBF2`
- Dark text: `#14201B`
- Muted body text: `#4B5B54`
- Borders: `#E4EAE6`
- Footer background: `#0D1F0D`
- Footer card/icon background: `#143314`
- Footer muted text: `#8FC08F` / `#6FA06F`
- White: `#FFFFFF`

**Typography**
- Heading font: Poppins (600–700 weight) — alternate pairings explored: Inter (humanist) or Fraunces (editorial serif); Poppins was the default selected.
- Body font: Inter (400–600 weight)
- H1: `clamp(2.4rem, 4.5vw + 1rem, 4rem)`, line-height 1.08, weight 700, letter-spacing -0.02em
- Section H2: `clamp(1.8rem, 3vw + 1rem, 2.6rem)`, weight 700, letter-spacing -0.01em
- Body copy: 14.5–18px, line-height ~1.55
- Eyebrow labels: 13px, weight 700, letter-spacing 0.08em, uppercase

**Spacing / Shape**
- Max content width: 1240px, side padding 24px
- Section vertical padding: `clamp(64px, 8vw, 110px)`
- Card border radius: 20px (large), 14–16px (small elements), 999px (pills/buttons)
- Card shadows: soft, e.g. `0 4px 16px rgba(20,32,27,0.03)` resting, `0 16px 36px rgba(0,150,0,0.16)` on hover
- Grid: CSS grid `auto-fit, minmax(...)` for card rows, gaps 24–28px

## Assets
All imagery in the prototype is **stock/placeholder photography from Unsplash**, hotlinked by URL — not final brand assets. Needs to be replaced with:
- Real clinic/patient photography for the hero, testimonials avatars, and before/after gallery
- A real professional photo of Dr. Saad Aftab
- Real Google Maps embed pointed at the clinic's actual address (placeholder currently points to a generic "Springfield" query)
- Real social media links (currently `#` placeholders)
- Real phone/WhatsApp/email contact details (currently placeholder: +1 (555) 123-4567 / hello@smileup.clinic)

## Files
- `SmileUp.dc.html` — the full design reference (all sections, inline styles, and interaction logic in one file).
