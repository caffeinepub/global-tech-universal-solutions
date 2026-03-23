import { Button } from "@/components/ui/button";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { Loader2, Menu, ShieldCheck, X } from "lucide-react";
import { useEffect, useState } from "react";

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Open Positions", href: "#positions" },
  { label: "Apply", href: "#apply" },
  { label: "Contact", href: "#contact" },
];

interface NavbarProps {
  onAdminClick: () => void;
}

export default function Navbar({ onAdminClick }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { identity, login, isLoggingIn, isInitializing } =
    useInternetIdentity();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const handleNav = (href: string) => {
    setMobileOpen(false);
    const id = href.replace("#", "");
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const handleAdminClick = () => {
    if (!identity) {
      login();
    } else {
      onAdminClick();
    }
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled
          ? "oklch(0.09 0.018 255 / 0.95)"
          : "oklch(0.09 0.018 255 / 0.6)",
        backdropFilter: "blur(16px)",
        borderBottom: scrolled
          ? "1px solid oklch(0.22 0.035 255)"
          : "1px solid transparent",
        boxShadow: scrolled ? "0 4px 30px oklch(0 0 0 / 0.4)" : "none",
      }}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        {/* Logo */}
        <button
          type="button"
          onClick={() => handleNav("#home")}
          className="flex items-center gap-2 shrink-0 bg-transparent border-0 cursor-pointer p-0"
        >
          <img
            src="/assets/generated/gtus-logo-transparent.dim_300x100.png"
            alt="GTUS Logo"
            className="h-10 w-auto object-contain"
          />
        </button>

        {/* Desktop nav links */}
        <ul className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleNav(link.href);
                }}
                className="px-3 py-2 text-sm font-medium transition-colors duration-200 rounded-md"
                style={{ color: "oklch(0.72 0.03 230)" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.color =
                    "oklch(0.84 0.18 200)";
                  (e.currentTarget as HTMLAnchorElement).style.background =
                    "oklch(0.84 0.18 200 / 0.08)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.color =
                    "oklch(0.72 0.03 230)";
                  (e.currentTarget as HTMLAnchorElement).style.background =
                    "transparent";
                }}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-2">
          <Button
            onClick={handleAdminClick}
            disabled={isLoggingIn || isInitializing}
            variant="ghost"
            size="sm"
            className="text-sm font-medium gap-1.5"
            style={{
              color: "oklch(0.72 0.03 230)",
              borderColor: "oklch(0.22 0.035 255)",
            }}
            data-ocid="admin.button"
          >
            {isLoggingIn ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <ShieldCheck size={15} />
            )}
            {identity ? "Dashboard" : "Admin"}
          </Button>
          <Button
            onClick={() => handleNav("#apply")}
            className="text-sm font-semibold px-5 py-2 rounded-md btn-pulse"
            style={{
              background: "oklch(0.84 0.18 200)",
              color: "oklch(0.09 0.018 255)",
              border: "none",
            }}
          >
            Apply Now
          </Button>
        </div>

        {/* Mobile menu toggle */}
        <button
          type="button"
          className="md:hidden p-2 rounded-md transition-colors"
          style={{ color: "oklch(0.72 0.03 230)" }}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          className="md:hidden border-t"
          style={{
            background: "oklch(0.09 0.018 255 / 0.98)",
            borderColor: "oklch(0.22 0.035 255)",
          }}
        >
          <ul className="px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNav(link.href);
                  }}
                  className="block px-3 py-3 text-sm font-medium rounded-md transition-colors"
                  style={{ color: "oklch(0.72 0.03 230)" }}
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li>
              <Button
                onClick={() => {
                  setMobileOpen(false);
                  handleAdminClick();
                }}
                disabled={isLoggingIn || isInitializing}
                variant="ghost"
                className="w-full text-sm font-medium justify-start gap-2"
                style={{ color: "oklch(0.72 0.03 230)" }}
                data-ocid="admin.button"
              >
                {isLoggingIn ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <ShieldCheck size={15} />
                )}
                {identity ? "Admin Dashboard" : "Admin Login"}
              </Button>
            </li>
            <li className="pt-2">
              <Button
                onClick={() => handleNav("#apply")}
                className="w-full text-sm font-semibold"
                style={{
                  background: "oklch(0.84 0.18 200)",
                  color: "oklch(0.09 0.018 255)",
                }}
              >
                Apply Now
              </Button>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
