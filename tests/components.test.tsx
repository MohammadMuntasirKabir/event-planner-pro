import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import HeroSection from "@/components/hero-section";
import FeaturesSection from "@/components/features-section";
import RevealElement from "@/components/animated-card";
import { CalendarPlus, Link2 } from "lucide-react";

// Mock next/link
vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("HeroSection", () => {
  it("renders the hero heading", () => {
    render(<HeroSection />);
    expect(screen.getByText(/Plan events that/)).toBeTruthy();
  });

  it("renders CTA button", () => {
    render(<HeroSection />);
    expect(screen.getByText("Get Started Free")).toBeTruthy();
    expect(screen.getByText("No credit card required")).toBeTruthy();
  });

  it("renders trust signals", () => {
    render(<HeroSection />);
    expect(screen.getByText("Free forever")).toBeTruthy();
    expect(screen.getByText("No credit card")).toBeTruthy();
    expect(screen.getByText("1-click setup")).toBeTruthy();
    expect(screen.getByText("Real-time updates")).toBeTruthy();
  });
});

describe("FeaturesSection", () => {
  const features = [
    {
      icon: CalendarPlus,
      title: "Create events",
      description: "Create events in seconds",
    },
    {
      icon: Link2,
      title: "Share links",
      description: "Share invite links easily",
    },
  ];

  it("renders section heading", () => {
    render(<FeaturesSection features={features} />);
    expect(
      screen.getByText(/Everything you need to plan amazing events/)
    ).toBeTruthy();
  });

  it("renders feature cards", () => {
    render(<FeaturesSection features={features} />);
    expect(screen.getByText("Create events")).toBeTruthy();
    expect(screen.getByText("Share links")).toBeTruthy();
  });

  it("renders feature descriptions", () => {
    render(<FeaturesSection features={features} />);
    expect(screen.getByText("Create events in seconds")).toBeTruthy();
    expect(screen.getByText("Share invite links easily")).toBeTruthy();
  });
});

describe("RevealElement", () => {
  it("renders children", () => {
    render(
      <RevealElement>
        <div data-testid="child">Hello</div>
      </RevealElement>
    );
    expect(screen.getByTestId("child")).toBeTruthy();
  });

  it("adds reveal-element class", () => {
    const { container } = render(
      <RevealElement>
        <div>Content</div>
      </RevealElement>
    );
    expect(container.querySelector(".reveal-element")).toBeTruthy();
  });

  it("applies custom className", () => {
    const { container } = render(
      <RevealElement className="custom-class">
        <div>Content</div>
      </RevealElement>
    );
    expect(container.querySelector(".custom-class")).toBeTruthy();
  });
});
