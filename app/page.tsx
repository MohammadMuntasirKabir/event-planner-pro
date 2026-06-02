import Link from "next/link";
import type { Metadata } from "next";
import HeroSection from "@/components/hero-section";
import HowItWorks from "@/components/how-it-works";
import TestimonialsSection from "@/components/testimonials-section";

export const metadata: Metadata = {
  title: "Event Planner Pro — Plan events that people love",
  description:
    "Create beautiful events, share invite links, and track RSVPs in real-time. Simple, elegant event planning for everyone.",
};

export default function Home() {
  return (
    <>
      <HeroSection />
      <HowItWorks />
      <TestimonialsSection />
    </>
  );
}
