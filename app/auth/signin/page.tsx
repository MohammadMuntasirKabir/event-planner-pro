"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { auth } from "@/lib/auth";

export default function SignInPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleCredentialsSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        router.push("/dashboard");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  async function handleOAuthSignIn(provider: "google" | "facebook" | "apple") {
    setLoading(true);
    try {
      await signIn(provider, { callbackUrl: "/dashboard" });
    } catch {
      setError("OAuth sign-in failed");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="animate-fade-in-up rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm sm:p-8">
        <h1 className="text-2xl font-bold text-white mb-2">Sign In</h1>
        <p className="text-sm text-white/50 mb-8">
          Welcome back! Sign in to manage your events.
        </p>

        {/* OAuth buttons */}
        <div className="space-y-3 mb-6">
          <button
            onClick={() => handleOAuthSignIn("google")}
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:bg-white/10 disabled:opacity-50"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.83C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <button
            onClick={() => handleOAuthSignIn("facebook")}
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:bg-white/10 disabled:opacity-50"
          >
            <svg className="h-5 w-5" fill="#1877F2" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.028 24 18.062 24 12.073z"/>
            </svg>
            Continue with Facebook
          </button>

          <button
            onClick={() => handleOAuthSignIn("apple")}
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:bg-white/10 disabled:opacity-50"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.05 20.28c-.98.95-2.05.88-3.08.41-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.41C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
            </svg>
            Continue with Apple
          </button>
        </div>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-[#0a0a0f] px-3 text-white/40">or continue with email</span>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Credentials form */}
        <form onSubmit={handleCredentialsSubmit} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="signin-email" className="block text-sm font-medium text-white/70">Email</label>
            <input id="signin-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/30 transition-all duration-200 focus:border-violet-500/50 focus:outline-none focus:ring-2 focus:ring-violet-500/20" />
          </div>

          <div className="space-y-2">
            <label htmlFor="signin-password" className="block text-sm font-medium text-white/70">Password</label>
            <input id="signin-password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/30 transition-all duration-200 focus:border-violet-500/50 focus:outline-none focus:ring-2 focus:ring-violet-500/20" />
          </div>

          <button type="submit" disabled={loading} className="w-full rounded-lg bg-violet-600 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-violet-600/25 transition-all duration-200 hover:bg-violet-500 hover:shadow-violet-500/40 hover:scale-[1.02] disabled:opacity-50">
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-white/40">
          Don&apos;t have an account?{" "}
          <Link href="/auth/signup" className="text-violet-400 hover:text-violet-300 transition-colors">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
