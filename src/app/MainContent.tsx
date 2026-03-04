"use client";

import dynamic from "next/dynamic";
import Header from "@/components/shared/Header";
import Footer from "@/components/Footer/footer";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";
import { useSidebar } from "@/components/providers/SidebarProvider";
import { Locale } from "../../i18n-config";

import { EditorSettingsProvider } from "@/components/providers/EditorSettingsProvider";

const DocumentsDialog = dynamic(() => import("@/components/shared/DocumentsDialog"), { ssr: false });
const SettingsDialog = dynamic(() => import("@/components/shared/SettingsDialog"), { ssr: false });
const ScrollToTop = dynamic(() => import("@/components/shared/ScrollToTop").then(mod => mod.ScrollToTop), { ssr: false });

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
