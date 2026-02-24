import React from 'react'
import { vi } from 'vitest'
import { DEFAULT_SETTINGS, DEFAULT_TONES, TOOLBAR_BUTTON_LABELS, TONE_LABELS, TONE_ICONS, TONE_DESCRIPTIONS } from '@/components/providers/EditorSettingsProvider'

// ---------------------------------------------------------------------------
// Mock EditorSettings context value
// ---------------------------------------------------------------------------
export const mockEditorSettingsValue = {
    buttonVisibility: { ...DEFAULT_SETTINGS },
    toggleButtonVisibility: vi.fn(),
    activeTones: { ...DEFAULT_TONES },
    toggleToneActivation: vi.fn(),
    customTones: [] as any[],
    addCustomTone: vi.fn(),
    deleteCustomTone: vi.fn(),
    toggleCustomToneActivation: vi.fn(),
    isSettingsDialogOpen: true,
    setIsSettingsDialogOpen: vi.fn(),
    isLoadingSettings: false,
}

// ---------------------------------------------------------------------------
// Mock EditorSettingsProvider (uses mocked context)
// ---------------------------------------------------------------------------
vi.mock('@/components/providers/EditorSettingsProvider', async (importOriginal) => {
    const original = await importOriginal() as any
    return {
        ...original,
        useEditorSettings: () => mockEditorSettingsValue,
        EditorSettingsProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    }
})

// ---------------------------------------------------------------------------
// Mock SidebarProvider
// ---------------------------------------------------------------------------
vi.mock('@/components/providers/SidebarProvider', () => ({
    useSidebar: () => ({
        isSidebarOpen: false,
        setIsSidebarOpen: vi.fn(),
        isLTSidebarOpen: false,
        setIsLTSidebarOpen: vi.fn(),
        isMobile: false,
        isDocumentsDialogOpen: false,
        setIsDocumentsDialogOpen: vi.fn(),
    }),
}))
