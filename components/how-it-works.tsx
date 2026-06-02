import { CalendarPlus, Link2, BarChart3 } from "lucide-react";
import RevealElement from "./animated-card";

const steps = [
  {
    icon: CalendarPlus,
    step: "01",
    title: "Create your event",
    description:
      "Enter the title, date, location, and description. Your event page is ready in under 30 seconds.",
  },
  {
    icon: Link2,
    step: "02",
    title: "Share the invite link",
    description:
      "Get a unique link for your event and share it with guests via email, text, or social media.",
  },
  {
    icon: BarChart3,
    step: "03",
    title: "Track responses live",
    description:
      "Watch RSVPs roll in real-time. See who's going, who's maybe, and who can't make it — all at a glance.",
  },
];

export default function HowItWorks() {
  return (
    <section className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="animate-fade-in-up text-3xl font-bold text-white sm:text-4xl">
            Three steps to a perfect event
          </h2>
          <p className="animate-fade-in-up-delay mt-4 text-lg text-white/50 max-w-2xl mx-auto">
            From creation to tracking, we make event planning effortless.
          </p>
        </div>

        {/* Steps */}
        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((step, i) => (
            <RevealElement key={step.title} delay={i * 120}>
              <div className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all duration-500 hover:border-violet-500/30 hover:bg-white/10 hover:shadow-xl hover:shadow-violet-500/5">
                {/* Step number */}
                <span className="absolute top-4 right-4 text-4xl font-bold text-white/5 group-hover:text-violet-500/10 transition-colors duration-300">
                  {step.step}
                </span>

                {/* Icon */}
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-violet-500/10 transition-all duration-300 group-hover:bg-violet-500/20 group-hover:scale-110">
                  <step.icon className="h-6 w-6 text-violet-400 transition-colors duration-300 group-hover:text-violet-300" />
                </div>

                {/* Content */}
                <h3 className="mb-2 text-lg font-semibold text-white">{step.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{step.description}</p>
              </div>
            </RevealElement>
          ))}
        </div>
      </div>
    </section>
  );
}
