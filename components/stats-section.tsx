"use client";

import { useEffect, useRef, useState } from "react";
import RevealElement from "./animated-card";

type Stat = {
  value: number;
  suffix?: string;
  label: string;
};

const stats: Stat[] = [
  { value: 12000, suffix: "+", label: "Events planned" },
  { value: 98, suffix: "%", label: "On-time invites delivered" },
  { value: 4, suffix: " steps", label: "From idea to RSVP" },
  { value: 0, suffix: "$", label: "Cost to get started" },
];

function useCountUp(target: number, active: boolean) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) return;
    let raf = 0;
    const duration = 1400;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, active]);

  return value;
}

function StatCard({ stat, active }: { stat: Stat; active: boolean }) {
  const count = useCountUp(stat.value, active);
  return (
    <div className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-sm transition-all duration-500 hover:border-violet-500/30 hover:bg-white/10">
      <div className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
        {stat.suffix === "$" ? "$" : ""}
        {count.toLocaleString()}
        {stat.suffix && stat.suffix !== "$" ? stat.suffix : ""}
      </div>
      <div className="mt-2 text-sm text-white/50">{stat.label}</div>
    </div>
  );
}

export default function StatsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="relative py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" ref={ref}>
        <RevealElement>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <StatCard key={stat.label} stat={stat} active={active} />
            ))}
          </div>
        </RevealElement>
      </div>
    </section>
  );
}
