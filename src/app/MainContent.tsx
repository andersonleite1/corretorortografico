"use client";

import dynamic from "next/dynamic";
import Header from "@/components/shared/Header";
import Footer from "@/components/Footer/footer";
import { useSidebar } from "@/components/providers/SidebarProvider";
import { Locale } from "../../i18n-config";
import { useUserPlan } from "@/components/providers/PlanProvider";

import {
  useEditorSettings,
  EditorSettingsProvider,
} from "@/components/providers/EditorSettingsProvider";

const DocumentsDialog = dynamic(
  () => import("@/components/shared/DocumentsDialog"),
  { ssr: false },
);
const SettingsDialog = dynamic(
  () => import("@/components/shared/SettingsDialog"),
  { ssr: false },
);
const ScrollToTop = dynamic(
  () =>
    import("@/components/shared/ScrollToTop").then((mod) => mod.ScrollToTop),
  { ssr: false },
);

function SettingsOnDemand({ userPlan }: { userPlan: "free" | "pro" | "team" }) {
  const { isSettingsDialogOpen } = useEditorSettings();
  return isSettingsDialogOpen ? <SettingsDialog userPlan={userPlan} /> : null;
}

interface MainContentProps {
  children: React.ReactNode;
  locale: Locale;
}

export const MainContent = ({ children, locale }: MainContentProps) => {
  const { isDocumentsDialogOpen, setIsDocumentsDialogOpen } = useSidebar();
  const { plan: userPlan } = useUserPlan();

  return (
    <EditorSettingsProvider>
      <Header />
      <main>{children}</main>
      <Footer initialLocale={locale} />
      {isDocumentsDialogOpen && (
        <DocumentsDialog
          isOpen
          onClose={() => setIsDocumentsDialogOpen(false)}
          userPlan={userPlan}
        />
      )}
      <ScrollToTop />
      <SettingsOnDemand userPlan={userPlan} />
    </EditorSettingsProvider>
  );
};
