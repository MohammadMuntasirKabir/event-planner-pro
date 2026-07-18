import { CalendarDays } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#0a0a0f]/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-violet-600">
              <CalendarDays className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-medium text-white">EventPlanner Pro</span>
          </div>
          <p className="text-xs text-white/40">
            Built with Next.js, Neon, and Prisma. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
