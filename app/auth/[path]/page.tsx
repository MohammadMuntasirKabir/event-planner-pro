import { redirect } from "next/navigation";
import { getSession, setSession } from "@/lib/auth/server";
import Link from "next/link";

export default async function SignInPage() {
  const session = await getSession();
  if (session) {
    redirect("/dashboard");
  }

  async function handleSignIn(formData: FormData) {
    "use server";
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/auth/credentials`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      }
    );

    if (!res.ok) {
      throw new Error("Invalid email or password");
    }

    const { user } = await res.json();
    await setSession(user);
    redirect("/dashboard");
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="animate-fade-in-up rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm sm:p-8">
        <h1 className="text-2xl font-bold text-white mb-2">Sign In</h1>
        <p className="text-sm text-white/50 mb-8">
          Welcome back! Sign in to manage your events.
        </p>

        <form action={handleSignIn} className="space-y-5">
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-white/70"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="you@example.com"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/30 transition-all duration-200 focus:border-violet-500/50 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-white/70"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="••••••••"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/30 transition-all duration-200 focus:border-violet-500/50 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-violet-600 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-violet-600/25 transition-all duration-200 hover:bg-violet-500 hover:shadow-violet-500/40 hover:scale-[1.02]"
          >
            Sign In
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-white/40">
          Don&apos;t have an account?{" "}
          <Link
            href="/auth/signup"
            className="text-violet-400 hover:text-violet-300 transition-colors"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
