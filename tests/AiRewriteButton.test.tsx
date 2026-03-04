import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AiRewriteButton from "@/components/TiptapEditor/components/controls/AiRewriteButton";
import { TONE_LABELS } from "@/components/providers/EditorSettingsProvider";

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockHandleRewrite = vi.fn();
const mockSetShowPreview = vi.fn();

vi.mock("@/components/TiptapEditor/hooks/useAiRewrite", () => ({
  useAiRewrite: () => ({
    handleRewrite: mockHandleRewrite,
    handleAccept: vi.fn(),
    handleDiscard: vi.fn(),
    completion: "",
    isLoading: false,
    showPreview: false,
    setShowPreview: mockSetShowPreview,
  }),
}));

const mockTiptapContext = {
  userPlan: "free",
};

vi.mock("@/components/TiptapEditor/components/Provider", () => ({
  useTiptapContext: () => mockTiptapContext,
}));

const mockEditorSettings = {
  activeTones: {} as any,
  customTones: [] as any[],
};

vi.mock(
  "@/components/providers/EditorSettingsProvider",
  async (importOriginal) => {
    const actual = (await importOriginal()) as any;
    return {
      ...actual,
      useEditorSettings: () => mockEditorSettings,
    };
  },
);

vi.mock("@clerk/nextjs", () => ({
  useAuth: () => ({
    isSignedIn: true,
  }),
}));

// Mock individual UI components if needed, or let them render
// Popover might need careful handling if it uses Radix

describe("AiRewriteButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Enable all tones for testing
    const toneIds = Object.keys(TONE_LABELS);
    toneIds.forEach((id) => {
      mockEditorSettings.activeTones[id] = true;
    });
    mockEditorSettings.customTones = [];
    mockTiptapContext.userPlan = "free";
  });

  it("renderiza o botão de reescrita", () => {
    render(<AiRewriteButton />);
    expect(screen.getByText(/Reescrever/i)).toBeInTheDocument();
  });

  it("exibe apenas os primeiros 5 tons para usuários no plano Free", async () => {
    render(<AiRewriteButton />);

    // Abrir popover
    fireEvent.click(screen.getByText(/Reescrever/i));

    await waitFor(() => {
      expect(screen.getByText(/Escolha o tom/i)).toBeInTheDocument();
    });

    const toneIds = Object.keys(TONE_LABELS);

    // First 5 (Formal, Casual, Acadêmico, Criativo, Simplificado) should be present
    for (let i = 0; i < 5; i++) {
      const label = TONE_LABELS[toneIds[i] as keyof typeof TONE_LABELS];
      expect(screen.getByText(label)).toBeInTheDocument();
    }

    // 6th tone (Romantic) should NOT be present for Free
    const sixthToneLabel = TONE_LABELS[toneIds[5] as keyof typeof TONE_LABELS];
    expect(screen.queryByText(sixthToneLabel)).not.toBeInTheDocument();
  });

  it("exibe todos os tons para usuários no plano Pro", async () => {
    mockTiptapContext.userPlan = "pro";
    render(<AiRewriteButton />);

    // Abrir popover
    fireEvent.click(screen.getByText(/Reescrever/i));

    await waitFor(() => {
      expect(screen.getByText(/Escolha o tom/i)).toBeInTheDocument();
    });

    const toneIds = Object.keys(TONE_LABELS);

    // All tones should be present
    toneIds.forEach((id) => {
      const label = TONE_LABELS[id as keyof typeof TONE_LABELS];
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  it("chama onRewrite ao clicar em um tom", async () => {
    mockTiptapContext.userPlan = "pro";
    render(<AiRewriteButton />);

    fireEvent.click(screen.getByText(/Reescrever/i));

    await waitFor(() => {
      const formalButton = screen.getByText(TONE_LABELS.formal);
      fireEvent.click(formalButton);
    });

    expect(mockHandleRewrite).toHaveBeenCalledWith("formal", undefined, "all");
  });
});
