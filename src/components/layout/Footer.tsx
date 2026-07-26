import { contact, navLinks } from "@/data/site";

const footerNavLinks = navLinks.filter((link) =>
  ["#why", "#services", "#gallery", "#testimonials"].includes(link.href),
);

const socialLinks = [
  { label: "Instagram", href: "#", shape: "square" as const },
  { label: "Facebook", href: "#", shape: "circle" as const },
];

export function Footer() {
  return (
    <footer className="bg-footer px-6 pt-16 pb-8">
      <div className="mx-auto max-w-[1240px]">
        <div className="mb-12 grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-10">
          <div>
            <div className="mb-4 flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand font-heading text-[15px] font-bold text-white">
                S
              </span>
              <span className="font-heading text-lg font-bold text-white">
                SmileUp
              </span>
            </div>
            <p className="max-w-55 text-[13.5px] text-footer-muted">
              Premium dental care that puts your comfort first.
            </p>
          </div>

          <div>
            <div className="mb-4 text-[13px] font-bold text-white">
              Navigate
            </div>
            <div className="flex flex-col gap-2.5">
              {footerNavLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-[13.5px] text-footer-muted hover:text-white"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-4 text-[13px] font-bold text-white">
              Contact
            </div>
            <div className="flex flex-col gap-2.5">
              <a
                href={contact.phoneHref}
                className="text-[13.5px] text-footer-muted hover:text-white"
              >
                {contact.phone}
              </a>
              <a
                href={`mailto:${contact.email}`}
                className="text-[13.5px] text-footer-muted hover:text-white"
              >
                {contact.email}
              </a>
              <a
                href="#contact"
                className="text-[13.5px] text-footer-muted hover:text-white"
              >
                {contact.address.split(",")[0]}
              </a>
            </div>
          </div>

          <div>
            <div className="mb-4 text-[13px] font-bold text-white">
              Follow
            </div>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-footer-card"
                >
                  <span
                    className={`h-3.5 w-3.5 border-[1.5px] border-footer-muted ${social.shape === "circle" ? "rounded-full" : "rounded"}`}
                  />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap justify-between gap-3 border-t border-footer-card pt-6">
          <div className="text-[12.5px] text-footer-muted-2">
            © 2026 SmileUp Dental Clinic. All rights reserved.
          </div>
          <div className="flex gap-5">
            <a href="#" className="text-[12.5px] text-footer-muted-2">
              Privacy Policy
            </a>
            <a href="#" className="text-[12.5px] text-footer-muted-2">
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
