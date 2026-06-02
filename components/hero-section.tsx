import Link from "next/link";
import { ArrowRight, Sparkles, Check } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-28">
      {/* Animated gradient background */}
      <div className="hero-gradient absolute inset-0 opacity-30" />

      {/* Floating decorative elements */}
      <div className="floating-orb absolute left-1/4 top-20 h-64 w-64 rounded-full bg-violet-600/20 blur-3xl" />
      <div className="floating-orb-delayed absolute right-1/4 top-40 h-48 w-48 rounded-full bg-purple-500/20 blur-3xl" />
      <div className="floating-orb-slow absolute bottom-10 left-1/3 h-32 w-32 rounded-full bg-indigo-500/20 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        {/* Badge */}
        <div className="animate-fade-in-up inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-sm text-violet-300">
          <Sparkles className="h-4 w-4" />
          The modern way to plan events
        </div>

        {/* Headline */}
        <h1 className="animate-fade-in-up-delay mt-8 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl xl:text-7xl">
          Plan events that{" "}
          <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
            people love
          </span>
        </h1>

        {/* Subheadline */}
        <p className="animate-fade-in-up-delay-2 mx-auto mt-6 max-w-2xl text-lg text-white/60 sm:text-xl leading-relaxed">
          Create beautiful events, share invite links, and track RSVPs in real-time.
          Simple, elegant, and designed for people who value their time.
        </p>

        {/* CTA */}
        <div className="animate-fade-in-up-delay-3 mt-10">
          <Link
            href="/auth/signup"
            className="group inline-flex items-center gap-2 rounded-xl bg-violet-600 px-8 py-4 text-base font-semibold text-white shadow-xl shadow-violet-600/25 transition-all duration-300 hover:bg-violet-500 hover:shadow-violet-500/40 hover:scale-105"
          >
            Get Started Free
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
          <p className="mt-3 text-sm text-white/40">No credit card required</p>
        </div>

        {/* Trust signals */}
        <div className="animate-fade-in-up-delay-4 mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-white/50">
          <span className="flex items-center gap-1.5">
            <Check className="h-4 w-4 text-green-400" />
            Free forever
          </span>
          <span className="flex items-center gap-1.5">
            <Check className="h-4 w-4 text-green-400" />
            No credit card
          </span>
          <span className="flex items-center gap-1.5">
            <Check className="h-4 w-4 text-green-400" />
            1-click setup
          </span>
          <span className="flex items-center gap-1.5">
            <Check className="h-4 w-4 text-green-400" />
            Real-time updates
          </span>
        </div>
      </div>
    </section>
  );
}
