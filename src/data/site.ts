// Placeholder contact details and photography — see design-reference/.../README.md
// "Assets" section for the real values to swap in before launch.

export const contact = {
  phone: "+1 (555) 123-4567",
  phoneHref: "tel:+15551234567",
  whatsappHref: "https://wa.me/15551234567",
  email: "hello@smileup.clinic",
  address: "221 Maple Grove Ave, Suite 4, Springfield",
  mapEmbedSrc: "https://www.google.com/maps?q=Springfield&output=embed",
};

export const navLinks = [
  { href: "#why", label: "Why Us" },
  { href: "#services", label: "Services" },
  { href: "#gallery", label: "Gallery" },
  { href: "#dentist", label: "Dentist" },
  { href: "#testimonials", label: "Reviews" },
  { href: "#contact", label: "Contact" },
  { href: "#faq", label: "FAQ" },
];

export interface Service {
  code: string;
  title: string;
  desc: string;
}

export const services: Service[] = [
  { code: "TW", title: "Teeth Whitening", desc: "Professional-grade whitening for a brighter smile in one visit." },
  { code: "DI", title: "Dental Implants", desc: "Permanent, natural-looking replacements for missing teeth." },
  { code: "BA", title: "Braces & Aligners", desc: "Traditional braces and clear aligners for every age." },
  { code: "RC", title: "Root Canal", desc: "Gentle, precise treatment to save an infected tooth." },
  { code: "VN", title: "Veneers", desc: "Custom porcelain veneers for a flawless smile makeover." },
  { code: "CB", title: "Crowns & Bridges", desc: "Durable restorations that protect and restore function." },
  { code: "DC", title: "Dental Cleaning", desc: "Routine cleanings and checkups to keep your smile healthy." },
  { code: "CD", title: "Cosmetic Dentistry", desc: "Comprehensive smile design tailored to your goals." },
];

export interface JourneyStep {
  n: string;
  title: string;
  desc: string;
}

export const journeySteps: JourneyStep[] = [
  { n: "01", title: "Listen & Assess", desc: "A relaxed consultation where we learn your concerns before we look at a single tooth." },
  { n: "02", title: "Plan Together", desc: "A clear, jargon-free treatment plan with options and honest pricing — you decide the pace." },
  { n: "03", title: "Treat with Care", desc: "Modern, minimally-invasive techniques delivered in a calm, unhurried room." },
  { n: "04", title: "Stay in Touch", desc: "Follow-up check-ins and aftercare guidance so results last well beyond the visit." },
];

export interface GalleryItem {
  title: string;
  desc: string;
  img: string;
}

export const gallery: GalleryItem[] = [
  { title: "Smile Makeover", desc: "Full veneer restoration, 2 visits.", img: "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=500&q=80" },
  { title: "Implant Restoration", desc: "Single tooth implant, 3 months.", img: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=500&q=80" },
  { title: "Whitening + Alignment", desc: "Combined treatment, 4 months.", img: "https://images.unsplash.com/photo-1489980557514-251d61e3eeb6?auto=format&fit=crop&w=500&q=80" },
  { title: "Cosmetic Bonding", desc: "Front teeth reshaping, 1 visit.", img: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=500&q=80" },
];

export interface Testimonial {
  name: string;
  location: string;
  stars: string;
  quote: string;
  avatar: string;
}

export const testimonials: Testimonial[] = [
  { name: "Amara O.", location: "Springfield, IL", stars: "★★★★★", quote: "Best dental experience I've had. The whole team made me feel completely at ease.", avatar: "https://images.unsplash.com/photo-1489980557514-251d61e3eeb6?auto=format&fit=crop&w=100&q=80" },
  { name: "Daniel R.", location: "Springfield, IL", stars: "★★★★★", quote: "Dr. Aftab explained everything clearly and the results exceeded my expectations.", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80" },
  { name: "Priya K.", location: "Oakview", stars: "★★★★★", quote: "Modern clinic, friendly staff, and genuinely painless treatment. Highly recommend.", avatar: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=100&q=80" },
  { name: "Marcus T.", location: "Springfield, IL", stars: "★★★★★", quote: "My implant looks and feels completely natural. Worth every penny.", avatar: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=100&q=80" },
];

export interface OpeningHour {
  day: string;
  time: string;
}

export const hours: OpeningHour[] = [
  { day: "Monday", time: "9:00 AM – 7:00 PM" },
  { day: "Tuesday", time: "9:00 AM – 7:00 PM" },
  { day: "Wednesday", time: "9:00 AM – 7:00 PM" },
  { day: "Thursday", time: "9:00 AM – 7:00 PM" },
  { day: "Friday", time: "9:00 AM – 7:00 PM" },
  { day: "Saturday", time: "10:00 AM – 4:00 PM" },
  { day: "Sunday", time: "Closed" },
];

export interface FaqItem {
  q: string;
  a: string;
}

export const faq: FaqItem[] = [
  { q: "Do you accept dental insurance?", a: "Yes, we work with most major insurance providers and offer flexible payment plans for out-of-pocket costs." },
  { q: "Is teeth whitening safe?", a: "Professional whitening performed in-clinic is safe and monitored throughout — far gentler than over-the-counter kits." },
  { q: "How long do dental implants last?", a: "With proper care, implants commonly last 15-25 years or longer, often for a lifetime." },
  { q: "Will my treatment be painful?", a: "We use modern anesthesia and gentle techniques to keep every procedure as comfortable as possible." },
  { q: "How often should I visit for a cleaning?", a: "We recommend a checkup and cleaning every six months to maintain optimal oral health." },
  { q: "Can I book same-day appointments?", a: "Yes — call or WhatsApp us and we will do our best to fit you in the same day for urgent needs." },
];
