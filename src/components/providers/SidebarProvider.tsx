"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type SidebarContextType = {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  isLTSidebarOpen: boolean;
  setIsLTSidebarOpen: (open: boolean) => void;
  isDocumentsDialogOpen: boolean;
  setIsDocumentsDialogOpen: (open: boolean) => void;
  isMobile: boolean;
};

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const SidebarProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLTSidebarOpen, setIsLTSidebarOpen] = useState(false);
  const [isDocumentsDialogOpen, setIsDocumentsDialogOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setIsSidebarOpen(false);
        setIsLTSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    if (window.innerWidth >= 1024) {
      // New visitors see the review panel; an explicit dismissal is preserved.
      try {
        setIsLTSidebarOpen(
          localStorage.getItem("rte-lt-sidebar-open") !== "false",
        );
      } catch {
        setIsLTSidebarOpen(true);
      }
    }

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const toggleSidebar = (value: boolean) => {
    if (isMobile && value) return; // Prevent opening on mobile
    setIsSidebarOpen(value);
    localStorage.setItem("rte-sidebar-open", String(value));
  };

  const toggleLTSidebar = (value: boolean) => {
    setIsLTSidebarOpen(value);
    try {
      localStorage.setItem("rte-lt-sidebar-open", String(value));
    } catch {
      // The panel remains usable when browser storage is unavailable.
    }
  };

  return (
    <SidebarContext.Provider
      value={{
        isSidebarOpen,
        setIsSidebarOpen: toggleSidebar,
        isLTSidebarOpen,
        setIsLTSidebarOpen: toggleLTSidebar,
        isDocumentsDialogOpen,
        setIsDocumentsDialogOpen,
        isMobile, // Export isMobile to help components decide to hide themselves
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    return {
      isSidebarOpen: false,
      setIsSidebarOpen: () =>
        console.warn("useSidebar used outside SidebarProvider"),
      isLTSidebarOpen: false,
      setIsLTSidebarOpen: () =>
        console.warn("useSidebar used outside SidebarProvider"),
      isDocumentsDialogOpen: false,
      setIsDocumentsDialogOpen: () =>
        console.warn("useSidebar used outside SidebarProvider"),
      isMobile: false,
    };
  }
  return context;
};
