"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";

export function Toaster(props: ToasterProps) {
  return (
    <Sonner
      theme="dark"
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast:
            "group rounded-xl border border-white/10 bg-[#12121a]/95 backdrop-blur-xl text-white shadow-xl shadow-black/40",
          description: "text-white/60",
          actionButton: "bg-violet-600 text-white",
          cancelButton: "bg-white/10 text-white/70",
          error: "border-red-500/30",
          success: "border-green-500/30",
        },
      }}
      {...props}
    />
  );
}
