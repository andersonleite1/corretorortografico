"use client";

import { useState, useEffect } from "react";

import dynamic from "next/dynamic";
import Header from "@/components/shared/Header";
import Footer from "@/components/Footer/footer";
import { useSidebar } from "@/components/providers/SidebarProvider";
import { Locale } from "../../i18n-config";
import { useUserPlan } from "@/components/providers/PlanProvider";

import { EditorSettingsProvider } from "@/components/providers/EditorSettingsProvider";

const DocumentsDialog = dynamic(() => import("@/components/shared/DocumentsDialog"), { ssr: false });
const SettingsDialog = dynamic(() => import("@/components/shared/SettingsDialog"), { ssr: false });
const ScrollToTop = dynamic(() => import("@/components/shared/ScrollToTop").then(mod => mod.ScrollToTop), { ssr: false });

interface MainContentProps {
  children: React.ReactNode;
  userButton: React.ReactNode;
  locale: Locale;
}

export const MainContent = ({
  children,
  userButton,
  locale,
}: MainContentProps) => {
  const { isDocumentsDialogOpen, setIsDocumentsDialogOpen } = useSidebar();
  const { plan: userPlan } = useUserPlan();

  return (
    <EditorSettingsProvider>
      <Header userButton={userButton} />
      <main>{children}</main>
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
