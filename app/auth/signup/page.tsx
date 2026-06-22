import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <SignUp
        appearance={{
          elements: {
            rootBox: "mx-auto w-full max-w-md",
            card: "rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 sm:p-8 shadow-none",
            headerTitle: "text-2xl font-bold text-white mb-2",
            headerSubtitle: "text-sm text-white/50 mb-8",
            socialButtonsBlockButton:
              "flex w-full items-center justify-center gap-3 rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:bg-white/10 disabled:opacity-50",
            socialButtonsBlockButtonText: "text-sm font-medium text-white",
            dividerLine: "bg-white/10",
            dividerText: "text-white/40 text-sm",
            formFieldInput:
              "w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/30 transition-all duration-200 focus:border-violet-500/50 focus:outline-none focus:ring-2 focus:ring-violet-500/20",
            formFieldLabel: "block text-sm font-medium text-white/70",
            formButtonPrimary:
              "w-full rounded-lg bg-violet-600 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-violet-600/25 transition-all duration-200 hover:bg-violet-500 hover:shadow-violet-500/40 hover:scale-[1.02] disabled:opacity-50",
            footerActionText: "text-sm text-white/40",
            footerActionLink: "text-violet-400 hover:text-violet-300 transition-colors",
            formFieldWarningText: "text-sm",
            identityPreviewText: "text-white/70",
            identityPreviewEditButton: "text-violet-400 hover:text-violet-300",
            formResendCodeLink: "text-violet-400 hover:text-violet-300",
          },
          variables: {
            colorPrimary: "#7c3aed",
            borderRadius: "0.5rem",
          },
        }}
        routing="path"
        path="/auth/signup"
        signInUrl="/auth/signin"
        forceRedirectUrl="/dashboard"
      />
    </div>
  );
}
