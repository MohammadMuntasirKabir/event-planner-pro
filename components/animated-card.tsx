"use client";

import { useEffect, useRef } from "react";

type RevealElementProps = {
  children: React.ReactNode;
  delay?: number;
  className?: string;
};

export default function RevealElement({
  children,
  delay = 0,
  className = "",
}: RevealElementProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              el.classList.add("reveal-visible");
            }, delay);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div ref={ref} className={`reveal-element ${className}`}>
      {children}
    </div>
  );
}
