"use client";

import Header from "@/components/shared/Header";
import Footer from "@/components/Footer/footer";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";
import { useSidebar } from "@/components/providers/SidebarProvider";
import { DocumentsDialog } from "@/components/shared/DocumentsDialog";
import { Locale } from "../../../i18n-config";

interface MainContentProps {
    children: React.ReactNode;
    userButton: React.ReactNode;
    locale: Locale;
}

export const MainContent = ({ children, userButton, locale }: MainContentProps) => {
    const { isDocumentsDialogOpen, setIsDocumentsDialogOpen } = useSidebar();

    return (
        <>
            <Header userButton={userButton} />
            <main>{children}</main>
            <SpeedInsights />
            <Analytics />
            <Footer initialLocale={locale} />
            <DocumentsDialog
                isOpen={isDocumentsDialogOpen}
                onClose={() => setIsDocumentsDialogOpen(false)}
            />
        </>
    );
};
