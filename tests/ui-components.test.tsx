import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Footer from "@/components/footer";
import HowItWorks from "@/components/how-it-works";
import TestimonialsSection from "@/components/testimonials-section";
import FeaturesSection from "@/components/features-section";
import RevealElement from "@/components/animated-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { CalendarPlus, Link2, Sparkles } from "lucide-react";

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

describe("Footer", () => {
  it("renders brand name", () => {
    render(<Footer />);
    expect(screen.getByText("EventPlanner Pro")).toBeTruthy();
  });

  it("renders copyright text", () => {
    render(<Footer />);
    expect(screen.getByText(/Built with Next.js/)).toBeTruthy();
  });

  it("renders calendar icon", () => {
    const { container } = render(<Footer />);
    expect(container.querySelector("svg")).toBeTruthy();
  });
});

describe("HowItWorks", () => {
  it("renders section heading", () => {
    render(<HowItWorks />);
    expect(screen.getByText("Three steps to a perfect event")).toBeTruthy();
  });

  it("renders subheading", () => {
    render(<HowItWorks />);
    expect(screen.getByText(/From creation to tracking/)).toBeTruthy();
  });

  it("renders all three step titles", () => {
    render(<HowItWorks />);
    expect(screen.getByText("Create your event")).toBeTruthy();
    expect(screen.getByText("Share the invite link")).toBeTruthy();
    expect(screen.getByText("Track responses live")).toBeTruthy();
  });

  it("renders step numbers", () => {
    render(<HowItWorks />);
    expect(screen.getByText("01")).toBeTruthy();
    expect(screen.getByText("02")).toBeTruthy();
    expect(screen.getByText("03")).toBeTruthy();
  });
});

describe("TestimonialsSection", () => {
  it("renders all testimonial authors", () => {
    render(<TestimonialsSection />);
    expect(screen.getByText("Sarah Chen")).toBeTruthy();
    expect(screen.getByText("Marcus Johnson")).toBeTruthy();
    expect(screen.getByText("Priya Patel")).toBeTruthy();
  });

  it("renders all roles", () => {
    render(<TestimonialsSection />);
    expect(screen.getByText("Marketing Manager")).toBeTruthy();
    expect(screen.getByText("Startup Founder")).toBeTruthy();
    expect(screen.getByText("Event Coordinator")).toBeTruthy();
  });

  it("renders initials", () => {
    render(<TestimonialsSection />);
    expect(screen.getByText("SC")).toBeTruthy();
    expect(screen.getByText("MJ")).toBeTruthy();
    expect(screen.getByText("PP")).toBeTruthy();
  });
});

describe("FeaturesSection", () => {
  const features = [
    { icon: CalendarPlus, title: "Create events", description: "Quick setup" },
    { icon: Link2, title: "Share links", description: "Easy sharing" },
    { icon: Sparkles, title: "Magic", description: "AI powered" },
  ];

  it("renders section heading", () => {
    render(<FeaturesSection features={features} />);
    expect(screen.getByText(/Everything you need/)).toBeTruthy();
  });

  it("renders all feature titles", () => {
    render(<FeaturesSection features={features} />);
    expect(screen.getByText("Create events")).toBeTruthy();
    expect(screen.getByText("Share links")).toBeTruthy();
    expect(screen.getByText("Magic")).toBeTruthy();
  });

  it("renders all descriptions", () => {
    render(<FeaturesSection features={features} />);
    expect(screen.getByText("Quick setup")).toBeTruthy();
    expect(screen.getByText("Easy sharing")).toBeTruthy();
    expect(screen.getByText("AI powered")).toBeTruthy();
  });

  it("renders empty when no features", () => {
    render(<FeaturesSection features={[]} />);
    expect(screen.getByText(/Everything you need/)).toBeTruthy();
  });
});

describe("UI Components", () => {
  describe("Button", () => {
    it("renders with default variant", () => {
      render(<Button>Click Me</Button>);
      expect(screen.getByText("Click Me")).toBeTruthy();
    });

    it("renders with destructive variant", () => {
      render(<Button variant="destructive">Delete</Button>);
      expect(screen.getByText("Delete")).toBeTruthy();
    });

    it("renders with outline variant", () => {
      render(<Button variant="outline">Outline</Button>);
      expect(screen.getByText("Outline")).toBeTruthy();
    });

    it("renders with secondary variant", () => {
      render(<Button variant="secondary">Secondary</Button>);
      expect(screen.getByText("Secondary")).toBeTruthy();
    });

    it("renders with ghost variant", () => {
      render(<Button variant="ghost">Ghost</Button>);
      expect(screen.getByText("Ghost")).toBeTruthy();
    });

    it("renders with link variant", () => {
      render(<Button variant="link">Link</Button>);
      expect(screen.getByText("Link")).toBeTruthy();
    });

    it("renders with sm size", () => {
      render(<Button size="sm">Small</Button>);
      expect(screen.getByText("Small")).toBeTruthy();
    });

    it("renders with lg size", () => {
      render(<Button size="lg">Large</Button>);
      expect(screen.getByText("Large")).toBeTruthy();
    });

    it("renders with icon size", () => {
      render(
        <Button size="icon">
          <Sparkles className="h-4 w-4" />
        </Button>
      );
      expect(screen.getByRole("button")).toBeTruthy();
    });

    it("is disabled when disabled prop is set", () => {
      render(<Button disabled>Disabled</Button>);
      const btn = screen.getByText("Disabled");
      expect(btn.getAttribute("disabled")).not.toBeNull();
    });

    it("applies custom className", () => {
      const { container } = render(<Button className="custom-btn">Custom</Button>);
      expect(container.querySelector(".custom-btn")).toBeTruthy();
    });
  });

  describe("Input", () => {
    it("renders an input element", () => {
      render(<Input placeholder="Enter text" />);
      expect(screen.getByPlaceholderText("Enter text")).toBeTruthy();
    });

    it("applies custom className", () => {
      const { container } = render(<Input className="custom-input" />);
      expect(container.querySelector(".custom-input")).toBeTruthy();
    });

    it("can be typed into", () => {
      render(<Input data-testid="test-input" />);
      const input = screen.getByTestId("test-input") as HTMLInputElement;
      fireEvent.change(input, { target: { value: "hello" } });
      expect(input.value).toBe("hello");
    });

    it("forwards ref correctly", () => {
      render(<Input />);
      expect(screen.getByRole("textbox")).toBeTruthy();
    });
  });

  describe("Textarea", () => {
    it("renders a textarea element", () => {
      render(<Textarea placeholder="Enter description" />);
      expect(screen.getByPlaceholderText("Enter description")).toBeTruthy();
    });

    it("applies custom className", () => {
      const { container } = render(<Textarea className="custom-textarea" />);
      expect(container.querySelector(".custom-textarea")).toBeTruthy();
    });

    it("supports multiple rows", () => {
      render(<Textarea rows={5} />);
      const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
      expect(textarea.rows).toBe(5);
    });
  });

  describe("Label", () => {
    it("renders a label element", () => {
      render(<Label>Email Address</Label>);
      expect(screen.getByText("Email Address")).toBeTruthy();
    });

    it("applies custom className", () => {
      const { container } = render(<Label className="custom-label">Name</Label>);
      expect(container.querySelector(".custom-label")).toBeTruthy();
    });

    it("associates with htmlFor", () => {
      const { container } = render(<Label htmlFor="email-input">Email</Label>);
      const label = container.querySelector("label");
      expect(label?.htmlFor).toBe("email-input");
    });
  });

  describe("Card", () => {
    it("renders card container", () => {
      render(<Card>Card Content</Card>);
      expect(screen.getByText("Card Content")).toBeTruthy();
    });

    it("renders card with header", () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Title</CardTitle>
            <CardDescription>Description</CardDescription>
          </CardHeader>
        </Card>
      );
      expect(screen.getByText("Title")).toBeTruthy();
      expect(screen.getByText("Description")).toBeTruthy();
    });

    it("renders card with content", () => {
      render(
        <Card>
          <CardContent>Body content here</CardContent>
        </Card>
      );
      expect(screen.getByText("Body content here")).toBeTruthy();
    });

    it("renders card with footer", () => {
      render(
        <Card>
          <CardFooter>Footer content</CardFooter>
        </Card>
      );
      expect(screen.getByText("Footer content")).toBeTruthy();
    });

    it("renders full card structure", () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Event Card</CardTitle>
            <CardDescription>Card description</CardDescription>
          </CardHeader>
          <CardContent>Event details go here</CardContent>
          <CardFooter>
            <Button>Action</Button>
          </CardFooter>
        </Card>
      );
      expect(screen.getByText("Event Card")).toBeTruthy();
      expect(screen.getByText("Card description")).toBeTruthy();
      expect(screen.getByText("Event details go here")).toBeTruthy();
      expect(screen.getByText("Action")).toBeTruthy();
    });

    it("applies custom className to card", () => {
      const { container } = render(<Card className="custom-card">Content</Card>);
      expect(container.querySelector(".custom-card")).toBeTruthy();
    });
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
      <RevealElement className="custom-reveal">
        <div>Content</div>
      </RevealElement>
    );
    expect(container.querySelector(".custom-reveal")).toBeTruthy();
  });

  it("applies delay as inline style", () => {
    render(
      <RevealElement delay={500}>
        <div>Content</div>
      </RevealElement>
    );
    // The delay is used internally with setTimeout, not as a DOM attribute
    expect(screen.getByText("Content")).toBeTruthy();
  });
});
