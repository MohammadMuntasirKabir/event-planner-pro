import type { Metadata } from "next";
import HeroSection from "@/components/hero-section";
import HowItWorks from "@/components/how-it-works";
import TestimonialsSection from "@/components/testimonials-section";
import FeaturesSection from "@/components/features-section";
import StatsSection from "@/components/stats-section";
import FaqSection from "@/components/faq-section";

export const metadata: Metadata = {
  title: "Event Planner Pro — Plan events that people love",
  description:
    "Create beautiful events, share invite links, and track RSVPs in real-time. Simple, elegant event planning for everyone.",
};

export default function Home() {
  return (
    <>
      <HeroSection />
      <StatsSection />
      <HowItWorks />
      <FeaturesSection />
      <TestimonialsSection />
      <FaqSection />
    </>
  );
}
