"use client";

import Header from "@/components/shared/Header";
import Footer from "@/components/Footer/footer";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";
import { useSidebar } from "@/components/providers/SidebarProvider";
import { DocumentsDialog } from "@/components/shared/DocumentsDialog";
import { ScrollToTop } from "@/components/shared/ScrollToTop";
import { Locale } from "../../i18n-config";

import { EditorSettingsProvider } from "@/components/providers/EditorSettingsProvider";
import { SettingsDialog } from "@/components/shared/SettingsDialog";

interface MainContentProps {
  children: React.ReactNode;
  userButton: React.ReactNode;
  locale: Locale;
  userPlan: "free" | "pro" | "team";
}

export const MainContent = ({
  children,
  userButton,
  locale,
  userPlan,
}: MainContentProps) => {
  const { isDocumentsDialogOpen, setIsDocumentsDialogOpen } = useSidebar();

  return (
    <EditorSettingsProvider>
      <Header userButton={userButton} />
      <main>{children}</main>
      <SpeedInsights />
      <Analytics />
      <Footer initialLocale={locale} />
      <DocumentsDialog
        isOpen={isDocumentsDialogOpen}
        onClose={() => setIsDocumentsDialogOpen(false)}
        userPlan={userPlan}
      />
      <ScrollToTop />
      <SettingsDialog userPlan={userPlan} />
    </EditorSettingsProvider>
  );
};
