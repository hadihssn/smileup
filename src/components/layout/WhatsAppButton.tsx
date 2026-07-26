import { contact } from "@/data/site";

export function WhatsAppButton() {
  return (
    <a
      href={contact.whatsappHref}
      target="_blank"
      rel="noopener"
      aria-label="Chat on WhatsApp"
      className="fixed right-6 bottom-6 z-[60] flex h-15 w-15 items-center justify-center rounded-full bg-brand shadow-[0_12px_30px_rgba(0,150,0,0.45)] transition-transform hover:scale-[1.08]"
    >
      <span className="flex h-6.5 w-6.5 items-center justify-center rounded-lg bg-white">
        <span className="h-3 w-3 rounded-[4px] bg-brand" />
      </span>
    </a>
  );
}
