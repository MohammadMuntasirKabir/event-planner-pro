import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Event Planner Pro — Plan events that people love",
  description:
    "Create beautiful events, share invite links, and track RSVPs in real-time. Simple, elegant event planning for everyone.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetch session server-side — Navbar reads via useSession() client hook
  // but we also pre-fetch for SSR pages that need it
  await auth();

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
