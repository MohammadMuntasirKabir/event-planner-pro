"use client";

import * as Accordion from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";
import RevealElement from "./animated-card";

const faqs = [
  {
    q: "Do my guests need an account to RSVP?",
    a: "No. Anyone with the invite link can respond with a single tap — Going, Maybe, or Not Going — without signing up.",
  },
  {
    q: "Is Event Planner Pro really free?",
    a: "Yes. Creating events, sharing invite links, and tracking RSVPs is free with no credit card required.",
  },
  {
    q: "Can I edit an event after sharing it?",
    a: "Absolutely. Open the event, hit Edit, change the title, date, location, or description, and your guests always see the latest version.",
  },
  {
    q: "How do I get the full guest list?",
    a: "From any event's detail page you can export every response — name, email, and status — to a CSV file in one click.",
  },
  {
    q: "What happens if someone responds twice?",
    a: "We dedupe by email, so a returning guest simply updates their previous answer instead of creating a duplicate.",
  },
  {
    q: "Is my event data private?",
    a: "Yes. Only you (the owner) can see responses and manage the event. Invite links are unique and unguessable tokens.",
  },
];

export default function FaqSection() {
  return (
    <section className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="animate-fade-in-up text-3xl font-bold text-white sm:text-4xl">
            Frequently asked questions
          </h2>
          <p className="animate-fade-in-up-delay mt-4 text-lg text-white/50">
            Everything you need to know about planning with Event Planner Pro.
          </p>
        </div>

        <RevealElement>
          <Accordion.Root
            type="single"
            collapsible
            className="space-y-3"
          >
            {faqs.map((faq, i) => (
              <Accordion.Item
                key={faq.q}
                value={`item-${i}`}
                className="group overflow-hidden rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm transition-colors data-[state=open]:border-violet-500/30"
              >
                <Accordion.Header>
                  <Accordion.Trigger className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-medium text-white/90 transition-colors hover:text-white">
                    {faq.q}
                    <ChevronDown className="h-4 w-4 shrink-0 text-white/40 transition-transform duration-300 group-data-[state=open]:rotate-180" />
                  </Accordion.Trigger>
                </Accordion.Header>
                <Accordion.Content className="overflow-hidden text-sm text-white/55 data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                  <div className="px-5 pb-5 leading-relaxed">{faq.a}</div>
                </Accordion.Content>
              </Accordion.Item>
            ))}
          </Accordion.Root>
        </RevealElement>
      </div>
    </section>
  );
}
