import EmailLinkSignUp from "@/components/auth/EmailLinkSignUp";

export default function SignUpPage() {
    return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4 animate-in fade-in duration-500">
            <EmailLinkSignUp />
        </div>
    );
}
