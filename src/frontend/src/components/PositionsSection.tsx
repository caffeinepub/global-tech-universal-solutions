import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Code2, Shield } from "lucide-react";
import { JobRole } from "../backend.d";

interface JobCard {
  title: string;
  role: JobRole;
  department: "CS" | "Cybersecurity";
  description: string;
}

const jobCards: JobCard[] = [
  {
    title: "Software Engineer",
    role: JobRole.softwareEngineer,
    department: "CS",
    description:
      "Design and build scalable software systems. Work on cutting-edge products with top-tier engineering teams across the globe.",
  },
  {
    title: "Full Stack Developer",
    role: JobRole.fullStackDeveloper,
    department: "CS",
    description:
      "Lead end-to-end product development from database to UI. Own entire feature stacks in fast-paced environments.",
  },
  {
    title: "Data Scientist",
    role: JobRole.dataScientist,
    department: "CS",
    description:
      "Transform complex datasets into actionable insights. Build predictive models and ML pipelines for high-impact decisions.",
  },
  {
    title: "Cybersecurity Analyst",
    role: JobRole.cybersecurityAnalyst,
    department: "Cybersecurity",
    description:
      "Monitor, detect, and respond to security incidents. Safeguard critical infrastructure against evolving cyber threats.",
  },
  {
    title: "Security Engineer",
    role: JobRole.securityEngineer,
    department: "Cybersecurity",
    description:
      "Build and maintain security systems at scale. Design robust defenses and conduct penetration testing.",
  },
  {
    title: "Network Engineer",
    role: JobRole.networkEngineer,
    department: "Cybersecurity",
    description:
      "Architect and secure enterprise networks. Ensure resilience, performance, and protection across digital infrastructure.",
  },
];

interface Props {
  onSelectRole: (role: string) => void;
}

export default function PositionsSection({ onSelectRole }: Props) {
  return (
    <section
      id="positions"
      className="relative py-24 lg:py-32 overflow-hidden"
      style={{ background: "oklch(0.09 0.018 255)" }}
    >
      {/* Mesh background */}
      <div className="absolute inset-0 mesh-bg pointer-events-none" />
      <div className="absolute inset-0 grid-pattern opacity-20 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-widest uppercase mb-4"
            style={{
              border: "1px solid oklch(0.84 0.18 200 / 0.3)",
              background: "oklch(0.84 0.18 200 / 0.06)",
              color: "oklch(0.84 0.18 200)",
            }}
          >
            Opportunities
          </div>
          <h2
            className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4"
            style={{ color: "oklch(0.97 0.01 230)" }}
          >
            Open Positions
          </h2>
          <p
            className="text-base md:text-lg max-w-xl mx-auto"
            style={{ color: "oklch(0.60 0.025 230)" }}
          >
            Explore our current openings across Computer Science and
            Cybersecurity disciplines.
          </p>
        </div>

        {/* Job cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobCards.map((job) => (
            <article
              key={job.role}
              className="card-glow rounded-xl p-6 flex flex-col group relative overflow-hidden"
              style={{
                background: "oklch(0.12 0.022 255)",
                border: "1px solid oklch(0.20 0.033 255)",
              }}
            >
              {/* Top gradient shimmer on hover */}
              <div
                className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, oklch(0.84 0.18 200), transparent)",
                }}
              />

              {/* Department badge */}
              <div className="flex items-center justify-between mb-4">
                <Badge
                  className="text-xs font-semibold px-2.5 py-1 rounded-md"
                  style={
                    job.department === "CS"
                      ? {
                          background: "oklch(0.55 0.22 250 / 0.15)",
                          color: "oklch(0.75 0.18 240)",
                          border: "1px solid oklch(0.55 0.22 250 / 0.3)",
                        }
                      : {
                          background: "oklch(0.84 0.18 200 / 0.12)",
                          color: "oklch(0.84 0.18 200)",
                          border: "1px solid oklch(0.84 0.18 200 / 0.3)",
                        }
                  }
                >
                  {job.department === "CS" ? (
                    <Code2 size={11} className="mr-1.5 inline-block" />
                  ) : (
                    <Shield size={11} className="mr-1.5 inline-block" />
                  )}
                  {job.department}
                </Badge>
                <div
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ background: "oklch(0.75 0.18 145)" }}
                />
              </div>

              {/* Role title */}
              <h3
                className="font-display text-lg font-bold mb-3 group-hover:text-[oklch(0.84_0.18_200)] transition-colors duration-200"
                style={{ color: "oklch(0.97 0.01 230)" }}
              >
                {job.title}
              </h3>

              {/* Description */}
              <p
                className="text-sm leading-relaxed flex-1 mb-6"
                style={{ color: "oklch(0.60 0.025 230)" }}
              >
                {job.description}
              </p>

              {/* Apply button */}
              <Button
                onClick={() => onSelectRole(job.role)}
                className="w-full group/btn font-semibold text-sm py-2.5 rounded-md transition-all duration-200"
                style={{
                  background: "oklch(0.84 0.18 200 / 0.1)",
                  color: "oklch(0.84 0.18 200)",
                  border: "1px solid oklch(0.84 0.18 200 / 0.3)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "oklch(0.84 0.18 200)";
                  (e.currentTarget as HTMLButtonElement).style.color =
                    "oklch(0.09 0.018 255)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "oklch(0.84 0.18 200 / 0.1)";
                  (e.currentTarget as HTMLButtonElement).style.color =
                    "oklch(0.84 0.18 200)";
                }}
              >
                Apply for this role
                <ArrowRight
                  size={14}
                  className="ml-2 inline-block group-hover/btn:translate-x-0.5 transition-transform"
                />
              </Button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
