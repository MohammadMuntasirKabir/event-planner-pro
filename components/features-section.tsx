import RevealElement from "./animated-card";
import {
  CalendarPlus,
  Link2,
  BarChart3,
  Bell,
  ShieldCheck,
  Download,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Feature = {
  icon: LucideIcon;
  title: string;
  description: string;
};

const defaultFeatures: Feature[] = [
  {
    icon: CalendarPlus,
    title: "Create in seconds",
    description:
      "Spin up a polished event page with a title, date, and location — no setup, no friction.",
  },
  {
    icon: Link2,
    title: "Share anywhere",
    description:
      "Generate a unique invite link and drop it in email, group chat, or social — guests reply without an account.",
  },
  {
    icon: BarChart3,
    title: "Track live",
    description:
      "Watch Going / Maybe / Not-going tallies update in real-time so you always know the headcount.",
  },
  {
    icon: Bell,
    title: "Never chase replies",
    description:
      "Guests respond on a clean public page while you stay focused on the event itself.",
  },
  {
    icon: ShieldCheck,
    title: "Private by default",
    description:
      "Owner-only controls, rate-limited APIs, and validated input keep your events safe.",
  },
  {
    icon: Download,
    title: "Export anytime",
    description:
      "Pull the full attendee list as CSV the moment you need it — no spreadsheets to maintain.",
  },
];

export default function FeaturesSection({
  features = defaultFeatures,
}: {
  features?: Feature[];
}) {
  return (
    <section className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="animate-fade-in-up text-3xl font-bold text-white sm:text-4xl">
            Everything you need to plan amazing events
          </h2>
          <p className="animate-fade-in-up-delay mt-4 text-lg text-white/50 max-w-2xl mx-auto">
            Powerful features with a beautiful, intuitive interface.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <RevealElement key={feature.title} delay={i * 100}>
              <div className="feature-card group relative h-full overflow-hidden rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all duration-500 hover:border-violet-500/30 hover:bg-white/10 hover:shadow-xl hover:shadow-violet-500/5 hover:-translate-y-1">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-violet-500/10 transition-all duration-300 group-hover:bg-violet-500/20 group-hover:scale-110">
                  <feature.icon className="h-6 w-6 text-violet-400 transition-colors duration-300 group-hover:text-violet-300" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-white">
                  {feature.title}
                </h3>
                <p className="text-sm text-white/50 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </RevealElement>
          ))}
        </div>
      </div>
    </section>
  );
}
