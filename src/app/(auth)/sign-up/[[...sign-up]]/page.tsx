import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-950">
            <SignUp
                appearance={{
                    elements: {
                        formButtonPrimary: "bg-indigo-600 hover:bg-indigo-700 text-sm font-semibold",
                        card: "bg-gray-900 border border-gray-800 shadow-none",
                        headerTitle: "text-white",
                        headerSubtitle: "text-gray-400",
                        socialButtonsBlockButton: "bg-gray-800 border-gray-700 text-white hover:bg-gray-700",
                        socialButtonsBlockButtonText: "text-white font-medium",
                        dividerLine: "bg-gray-800",
                        dividerText: "text-gray-500",
                        formFieldLabel: "text-gray-300",
                        formFieldInput: "bg-gray-800 border-gray-700 text-white focus:border-indigo-500 focus:ring-indigo-500",
                        footerActionText: "text-gray-400",
                        footerActionLink: "text-indigo-400 hover:text-indigo-300",
                    },
                }}
            />
        </div>
    );
}
