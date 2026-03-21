import { Building2, Calendar, Users } from "lucide-react";

const stats = [
  {
    icon: Users,
    value: "500+",
    label: "Placements",
    description:
      "Successful candidate placements across CS & Cybersecurity roles",
  },
  {
    icon: Calendar,
    value: "10+",
    label: "Years Experience",
    description:
      "A decade of expertise connecting top talent with industry leaders",
  },
  {
    icon: Building2,
    value: "50+",
    label: "Partner Companies",
    description:
      "Trusted by leading tech organizations and security firms worldwide",
  },
];

export default function AboutSection() {
  return (
    <section
      id="about"
      className="relative py-24 lg:py-32 overflow-hidden"
      style={{ background: "oklch(0.10 0.02 255)" }}
    >
      {/* Ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 80% 20%, oklch(0.55 0.22 250 / 0.05) 0%, transparent 60%)",
        }}
      />
      <div className="section-divider absolute top-0 left-0 right-0" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="max-w-3xl mb-16">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-widest uppercase mb-4"
            style={{
              border: "1px solid oklch(0.84 0.18 200 / 0.3)",
              background: "oklch(0.84 0.18 200 / 0.06)",
              color: "oklch(0.84 0.18 200)",
            }}
          >
            About Us
          </div>
          <h2
            className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold mb-6"
            style={{ color: "oklch(0.97 0.01 230)" }}
          >
            Who We Are
          </h2>
          <div
            className="w-16 h-1 rounded-full mb-8"
            style={{ background: "oklch(0.84 0.18 200)" }}
          />
          <p
            className="text-base md:text-lg leading-relaxed mb-4"
            style={{ color: "oklch(0.72 0.03 230)" }}
          >
            Global Tech Universal Solutions (GTUS) is a premier technology
            recruitment firm dedicated to bridging the gap between exceptional
            talent and forward-thinking organizations. We specialize exclusively
            in Computer Science and Cybersecurity — two of the most critical
            disciplines shaping our digital future.
          </p>
          <p
            className="text-base md:text-lg leading-relaxed mb-4"
            style={{ color: "oklch(0.72 0.03 230)" }}
          >
            Our mission is simple: find the right people for the right roles. We
            go beyond resumes and algorithms — we understand technical depth,
            cultural fit, and long-term career trajectories. Every placement we
            make is a partnership built on trust, expertise, and results.
          </p>
          <p
            className="text-base md:text-lg leading-relaxed"
            style={{ color: "oklch(0.72 0.03 230)" }}
          >
            With a global network spanning startups to Fortune 500 enterprises,
            GTUS is where elite talent meets world-class opportunity.
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map(({ icon: Icon, value, label, description }) => (
            <div
              key={label}
              className="card-glow rounded-xl p-8 relative overflow-hidden group"
              style={{
                background: "oklch(0.13 0.025 255)",
                border: "1px solid oklch(0.22 0.035 255)",
              }}
            >
              {/* Corner glow */}
              <div
                className="absolute top-0 right-0 w-24 h-24 rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background:
                    "radial-gradient(circle, oklch(0.84 0.18 200 / 0.15) 0%, transparent 70%)",
                  transform: "translate(30%, -30%)",
                }}
              />
              <div
                className="inline-flex items-center justify-center w-12 h-12 rounded-lg mb-5"
                style={{
                  background: "oklch(0.84 0.18 200 / 0.12)",
                  border: "1px solid oklch(0.84 0.18 200 / 0.25)",
                }}
              >
                <Icon size={22} style={{ color: "oklch(0.84 0.18 200)" }} />
              </div>
              <div
                className="font-display text-4xl font-extrabold mb-1"
                style={{ color: "oklch(0.84 0.18 200)" }}
              >
                {value}
              </div>
              <div
                className="text-sm font-semibold uppercase tracking-wider mb-3"
                style={{ color: "oklch(0.97 0.01 230)" }}
              >
                {label}
              </div>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "oklch(0.60 0.025 230)" }}
              >
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="section-divider absolute bottom-0 left-0 right-0" />
    </section>
  );
}
