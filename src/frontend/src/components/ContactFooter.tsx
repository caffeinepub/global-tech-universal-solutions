import { Heart, Mail, MapPin, Phone } from "lucide-react";
import { SiLinkedin, SiX } from "react-icons/si";

const contactItems = [
  {
    icon: Mail,
    label: "Email",
    value: "careers@gtus.com",
    href: "mailto:careers@gtus.com",
  },
  {
    icon: Phone,
    label: "Phone",
    value: "+1 800 GTUS-TECH",
    href: "tel:+18004887832",
  },
  {
    icon: MapPin,
    label: "Location",
    value: "San Francisco, CA",
    href: "https://maps.google.com/?q=San+Francisco,CA",
  },
];

export default function ContactFooter() {
  return (
    <footer
      id="contact"
      className="relative pt-20 pb-10 overflow-hidden"
      style={{ background: "oklch(0.085 0.018 255)" }}
    >
      {/* Decorative top accent */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, oklch(0.84 0.18 200 / 0.5), transparent)",
        }}
      />

      {/* Glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 30% at 50% 0%, oklch(0.84 0.18 200 / 0.04) 0%, transparent 60%)",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
          {/* Brand column */}
          <div className="md:col-span-1">
            <img
              src="/assets/generated/gtus-logo-transparent.dim_300x100.png"
              alt="GTUS Logo"
              className="h-10 w-auto object-contain mb-4"
            />
            <p
              className="text-sm leading-relaxed max-w-xs"
              style={{ color: "oklch(0.55 0.025 230)" }}
            >
              Connecting elite Computer Science and Cybersecurity talent with
              the organizations building tomorrow's digital world.
            </p>
          </div>

          {/* Contact info */}
          <div>
            <h3
              className="font-display text-sm font-semibold uppercase tracking-widest mb-6"
              style={{ color: "oklch(0.84 0.18 200)" }}
            >
              Contact Us
            </h3>
            <ul className="space-y-4">
              {contactItems.map(({ icon: Icon, label, value, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    target={href.startsWith("http") ? "_blank" : undefined}
                    rel={
                      href.startsWith("http")
                        ? "noopener noreferrer"
                        : undefined
                    }
                    className="flex items-start gap-3 group"
                  >
                    <div
                      className="mt-0.5 w-7 h-7 rounded-md flex items-center justify-center shrink-0 transition-colors duration-200"
                      style={{
                        background: "oklch(0.84 0.18 200 / 0.08)",
                        border: "1px solid oklch(0.84 0.18 200 / 0.2)",
                      }}
                    >
                      <Icon
                        size={13}
                        style={{ color: "oklch(0.84 0.18 200)" }}
                      />
                    </div>
                    <div>
                      <div
                        className="text-xs uppercase tracking-wider mb-0.5"
                        style={{ color: "oklch(0.45 0.02 230)" }}
                      >
                        {label}
                      </div>
                      <span
                        className="text-sm group-hover:text-[oklch(0.84_0.18_200)] transition-colors duration-200"
                        style={{ color: "oklch(0.72 0.03 230)" }}
                      >
                        {value}
                      </span>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Social + quick links */}
          <div>
            <h3
              className="font-display text-sm font-semibold uppercase tracking-widest mb-6"
              style={{ color: "oklch(0.84 0.18 200)" }}
            >
              Connect
            </h3>
            <div className="flex gap-3 mb-8">
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200"
                style={{
                  background: "oklch(0.84 0.18 200 / 0.08)",
                  border: "1px solid oklch(0.84 0.18 200 / 0.2)",
                  color: "oklch(0.72 0.03 230)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.background =
                    "oklch(0.84 0.18 200 / 0.2)";
                  (e.currentTarget as HTMLAnchorElement).style.color =
                    "oklch(0.84 0.18 200)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.background =
                    "oklch(0.84 0.18 200 / 0.08)";
                  (e.currentTarget as HTMLAnchorElement).style.color =
                    "oklch(0.72 0.03 230)";
                }}
                aria-label="LinkedIn"
              >
                <SiLinkedin size={18} />
              </a>
              <a
                href="https://x.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200"
                style={{
                  background: "oklch(0.84 0.18 200 / 0.08)",
                  border: "1px solid oklch(0.84 0.18 200 / 0.2)",
                  color: "oklch(0.72 0.03 230)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.background =
                    "oklch(0.84 0.18 200 / 0.2)";
                  (e.currentTarget as HTMLAnchorElement).style.color =
                    "oklch(0.84 0.18 200)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.background =
                    "oklch(0.84 0.18 200 / 0.08)";
                  (e.currentTarget as HTMLAnchorElement).style.color =
                    "oklch(0.72 0.03 230)";
                }}
                aria-label="X (Twitter)"
              >
                <SiX size={16} />
              </a>
            </div>

            {/* Quick links */}
            <nav aria-label="Footer navigation">
              <ul className="space-y-2">
                {["Home", "About", "Open Positions", "Apply"].map((item) => (
                  <li key={item}>
                    <a
                      href={`#${item.toLowerCase().replace(/ /g, "-")}`}
                      onClick={(e) => {
                        e.preventDefault();
                        const id =
                          item === "Open Positions"
                            ? "positions"
                            : item.toLowerCase();
                        document
                          .getElementById(id)
                          ?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="text-sm transition-colors duration-200"
                      style={{ color: "oklch(0.55 0.025 230)" }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLAnchorElement).style.color =
                          "oklch(0.84 0.18 200)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLAnchorElement).style.color =
                          "oklch(0.55 0.025 230)";
                      }}
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8"
          style={{ borderTop: "1px solid oklch(0.18 0.03 255)" }}
        >
          <p className="text-sm" style={{ color: "oklch(0.45 0.02 230)" }}>
            © 2026 Global Tech Universal Solutions. All rights reserved.
          </p>
          <p
            className="text-sm flex items-center gap-1.5"
            style={{ color: "oklch(0.45 0.02 230)" }}
          >
            Built with{" "}
            <Heart
              size={13}
              fill="oklch(0.84 0.18 200)"
              style={{ color: "oklch(0.84 0.18 200)" }}
            />{" "}
            using{" "}
            <a
              href="https://caffeine.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors duration-200"
              style={{ color: "oklch(0.84 0.18 200)" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.color =
                  "oklch(0.92 0.1 200)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.color =
                  "oklch(0.84 0.18 200)";
              }}
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
