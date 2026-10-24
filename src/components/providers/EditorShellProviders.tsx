"use client";

import type { ReactNode } from "react";
import { Toaster } from "sonner";
import { EditorSettingsProvider } from "./EditorSettingsProvider";
import { SidebarProvider } from "./SidebarProvider";

export default function EditorShellProviders({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <SidebarProvider>
      <EditorSettingsProvider>
        {children}
        <Toaster richColors position="top-right" />
      </EditorSettingsProvider>
    </SidebarProvider>
  );
}
