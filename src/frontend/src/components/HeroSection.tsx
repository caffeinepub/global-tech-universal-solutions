import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronDown } from "lucide-react";

export default function HeroSection() {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="home"
      className="relative min-h-screen flex flex-col items-center justify-center text-center overflow-hidden"
    >
      {/* Background image + overlay */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "url('/assets/generated/hero-bg.dim_1600x900.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />
      {/* Dark overlay with gradient */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            "linear-gradient(to bottom, oklch(0.09 0.018 255 / 0.82) 0%, oklch(0.09 0.018 255 / 0.72) 60%, oklch(0.09 0.018 255) 100%)",
        }}
      />
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 z-0 grid-pattern opacity-30" />

      {/* Radial glow in center */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 50%, oklch(0.84 0.18 200 / 0.06) 0%, transparent 70%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
        {/* Eyebrow label */}
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase mb-8 animate-fadeInUp"
          style={{
            border: "1px solid oklch(0.84 0.18 200 / 0.4)",
            background: "oklch(0.84 0.18 200 / 0.08)",
            color: "oklch(0.84 0.18 200)",
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ background: "oklch(0.84 0.18 200)" }}
          />
          Global Tech Universal Solutions
        </div>

        {/* Main headline */}
        <h1
          className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-6 animate-fadeInUp delay-100"
          style={{ color: "oklch(0.97 0.01 230)" }}
        >
          Connecting <span className="text-shimmer">Top Tech Talent</span>
          <br className="hidden md:block" /> With Tomorrow&apos;s
          <br className="hidden md:block" /> Challenges
        </h1>

        {/* Subheadline */}
        <p
          className="text-base sm:text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-10 animate-fadeInUp delay-200"
          style={{ color: "oklch(0.72 0.03 230)" }}
        >
          We specialize in placing elite{" "}
          <span style={{ color: "oklch(0.84 0.18 200)" }}>
            Computer Science
          </span>{" "}
          and{" "}
          <span style={{ color: "oklch(0.84 0.18 200)" }}>Cybersecurity</span>{" "}
          professionals where they matter most.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fadeInUp delay-300">
          <Button
            onClick={() => scrollTo("positions")}
            size="lg"
            className="group font-semibold px-8 py-3 text-base rounded-md btn-pulse"
            style={{
              background: "oklch(0.84 0.18 200)",
              color: "oklch(0.09 0.018 255)",
              border: "none",
            }}
          >
            View Open Positions
            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button
            onClick={() => scrollTo("apply")}
            size="lg"
            variant="outline"
            className="font-semibold px-8 py-3 text-base rounded-md transition-all duration-200"
            style={{
              background: "transparent",
              border: "1px solid oklch(0.84 0.18 200 / 0.5)",
              color: "oklch(0.84 0.18 200)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "oklch(0.84 0.18 200 / 0.1)";
              (e.currentTarget as HTMLButtonElement).style.borderColor =
                "oklch(0.84 0.18 200)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "transparent";
              (e.currentTarget as HTMLButtonElement).style.borderColor =
                "oklch(0.84 0.18 200 / 0.5)";
            }}
          >
            Apply Now
          </Button>
        </div>

        {/* Scroll indicator */}
        <div
          className="mt-20 animate-float"
          style={{ color: "oklch(0.84 0.18 200 / 0.6)" }}
        >
          <ChevronDown
            size={28}
            className="mx-auto cursor-pointer hover:opacity-100 transition-opacity"
            onClick={() => scrollTo("about")}
          />
        </div>
      </div>
    </section>
  );
}
