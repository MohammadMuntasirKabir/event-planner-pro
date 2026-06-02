import HeroSection from "@/components/hero-section";
import FeaturesSection from "@/components/features-section";
import {
  CalendarPlus,
  Link2,
  BarChart3,
  Shield,
  Zap,
  Globe,
} from "lucide-react";

const features = [
  {
    icon: CalendarPlus,
    title: "Create events in seconds",
    description:
      "Set title, date, location, and details with a clean, intuitive form. No clutter, no confusion.",
  },
  {
    icon: Link2,
    title: "Share unique invite links",
    description:
      "Generate a one-click invite link per event. Share it anywhere — email, social, messaging apps.",
  },
  {
    icon: BarChart3,
    title: "Real-time RSVP tracking",
    description:
      "See Going, Maybe, and Not Going counts update live. Know exactly who's attending.",
  },
  {
    icon: Shield,
    title: "Private by default",
    description:
      "Only you can manage your events. Guests RSVP via invite link — no account required for them.",
  },
  {
    icon: Zap,
    title: "Fast and lightweight",
    description:
      "Built on Next.js 16 and Neon Postgres for instant page loads and real-time updates.",
  },
  {
    icon: Globe,
    title: "Beautiful on every device",
    description:
      "Responsive design with smooth animations. Looks great on mobile, tablet, and desktop.",
  },
];

export default function Home() {
  return (
    <>
      <HeroSection />
      <FeaturesSection features={features} />
    </>
  );
}
