import RevealElement from "./animated-card";

const testimonials = [
  {
    quote: "I used to spend hours managing RSVPs in spreadsheets. Now it takes me 2 minutes to create an event and share the link.",
    author: "Sarah Chen",
    role: "Marketing Manager",
    initials: "SC",
  },
  {
    quote: "The real-time tracking is a game-changer. I always know exactly who's coming without sending a single follow-up email.",
    author: "Marcus Johnson",
    role: "Startup Founder",
    initials: "MJ",
  },
  {
    quote: "Finally, an event tool that doesn't look like it was built in 2005. My guests actually enjoy responding to the invites.",
    author: "Priya Patel",
    role: "Event Coordinator",
    initials: "PP",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="animate-fade-in-up text-3xl font-bold text-white sm:text-4xl">
            Loved by event planners
          </h2>
          <p className="animate-fade-in-up-delay mt-4 text-lg text-white/50 max-w-2xl mx-auto">
            See why thousands of people choose Event Planner Pro for their events.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <RevealElement key={t.author} delay={i * 120}>
              <div className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all duration-500 hover:border-violet-500/30 hover:bg-white/10 h-full flex flex-col">
                {/* Quote */}
                <p className="text-sm text-white/60 leading-relaxed flex-1">
                  &ldquo;{t.quote}&rdquo;
                </p>

                {/* Author */}
                <div className="mt-6 flex items-center gap-3 border-t border-white/10 pt-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-600/20 text-sm font-semibold text-violet-300">
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{t.author}</p>
                    <p className="text-xs text-white/40">{t.role}</p>
                  </div>
                </div>
              </div>
            </RevealElement>
          ))}
        </div>
      </div>
    </section>
  );
}
