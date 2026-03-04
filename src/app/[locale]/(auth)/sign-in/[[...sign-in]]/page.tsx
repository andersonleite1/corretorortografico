import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4 animate-in fade-in duration-500">
      <SignIn
        appearance={{
          elements: {
            formButtonPrimary:
              "bg-black hover:bg-neutral-800 text-sm font-semibold rounded-full shadow-lg transition-all",
            card: "bg-white border border-neutral-200 shadow-2xl rounded-3xl",
            headerTitle: "text-neutral-900 tracking-tight",
            headerSubtitle: "text-neutral-600",
            socialButtonsBlockButton:
              "bg-neutral-50 border-neutral-200 text-neutral-900 hover:bg-neutral-100 rounded-2xl transition-all",
            socialButtonsBlockButtonText: "text-neutral-900 font-medium",
            dividerLine: "bg-neutral-100",
            dividerText: "text-neutral-400",
            formFieldLabel: "text-neutral-700",
            formFieldInput:
              "bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-full focus:border-emerald-600 focus:ring-emerald-600/50 transition-all",
            footerActionText: "text-neutral-400",
            footerActionLink:
              "text-emerald-600 hover:text-emerald-700 font-medium transition-colors",
            formFieldAction: "text-emerald-600 hover:text-emerald-700",
            identityPreviewText: "text-neutral-900",
            identityPreviewEditButtonIcon: "text-emerald-600",
          },
        }}
      />
    </div>
  );
}
