import Link from "next/link";
import { ArrowRight, PartyPopper, Sparkles } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-32">
      {/* Animated gradient background */}
      <div className="hero-gradient absolute inset-0 opacity-30" />

      {/* Floating decorative elements */}
      <div className="floating-orb absolute left-1/4 top-20 h-64 w-64 rounded-full bg-violet-600/20 blur-3xl" />
      <div className="floating-orb-delayed absolute right-1/4 top-40 h-48 w-48 rounded-full bg-purple-500/20 blur-3xl" />
      <div className="floating-orb-slow absolute bottom-10 left-1/3 h-32 w-32 rounded-full bg-indigo-500/20 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        <div className="animate-fade-in-up inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-sm text-violet-300">
          <Sparkles className="h-4 w-4" />
          The modern way to plan events
        </div>

        <h1 className="animate-fade-in-up-delay mt-8 text-4xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
          Plan events that{" "}
          <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
            people love
          </span>
        </h1>

        <p className="animate-fade-in-up-delay-2 mx-auto mt-6 max-w-2xl text-lg text-white/60 sm:text-xl">
          Create beautiful events, share invite links, and track RSVPs — all in one place.
          Simple, elegant, and designed for real people.
        </p>

        <div className="animate-fade-in-up-delay-3 mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/auth/signup"
            className="group inline-flex items-center gap-2 rounded-lg bg-violet-600 px-8 py-3.5 text-base font-semibold text-white shadow-xl shadow-violet-600/25 transition-all duration-300 hover:bg-violet-500 hover:shadow-violet-500/40 hover:scale-105"
          >
            Get Started Free
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-8 py-3.5 text-base font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/10 hover:border-white/25 hover:scale-105"
          >
            <PartyPopper className="h-4 w-4" />
            View Demo
          </Link>
        </div>

        {/* Stats bar */}
        <div className="animate-fade-in-up-delay-4 mt-16 grid grid-cols-3 gap-8 border-t border-white/10 pt-8 max-w-lg mx-auto">
          <div>
            <div className="text-2xl font-bold text-white">Free</div>
            <div className="text-xs text-white/50 mt-1">No credit card</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">1-Click</div>
            <div className="text-xs text-white/50 mt-1">Invite links</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">Real-time</div>
            <div className="text-xs text-white/50 mt-1">RSVP tracking</div>
          </div>
        </div>
      </div>
    </section>
  );
}
