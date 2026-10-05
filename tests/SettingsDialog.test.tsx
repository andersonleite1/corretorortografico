import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SettingsDialog } from "@/components/shared/SettingsDialog";
import {
  DEFAULT_SETTINGS,
  DEFAULT_TONES,
  TOOLBAR_BUTTON_LABELS,
  TONE_LABELS,
} from "@/components/providers/EditorSettingsProvider";

// ── Mocks ─────────────────────────────────────────────────────────────────────
const mockToggleButtonVisibility = vi.fn();
const mockToggleToneActivation = vi.fn();
const mockAddCustomTone = vi.fn();
const mockDeleteCustomTone = vi.fn();
const mockToggleCustomToneActivation = vi.fn();
const mockSetIsSettingsDialogOpen = vi.fn();

const mockEditorSettings = {
  isSettingsDialogOpen: true,
  setIsSettingsDialogOpen: mockSetIsSettingsDialogOpen,
  buttonVisibility: { ...DEFAULT_SETTINGS },
  toggleButtonVisibility: mockToggleButtonVisibility,
  activeTones: { ...DEFAULT_TONES },
  toggleToneActivation: mockToggleToneActivation,
  customTones: [] as any[],
  addCustomTone: mockAddCustomTone,
  deleteCustomTone: mockDeleteCustomTone,
  toggleCustomToneActivation: mockToggleCustomToneActivation,
  isLoadingSettings: false,
};

vi.mock(
  "@/components/providers/EditorSettingsProvider",
  async (importOriginal) => {
    const original = (await importOriginal()) as any;
    return {
      ...original,
      useEditorSettings: () => mockEditorSettings,
    };
  },
);

// Mock Icon component
vi.mock("@/components/TiptapEditor/components/ui/Icon", () => ({
  Icon: ({ name }: { name: string }) => <span data-testid={`icon-${name}`} />,
}));

// ── Tests ─────────────────────────────────────────────────────────────────────
describe("SettingsDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockEditorSettings.isSettingsDialogOpen = true;
    mockEditorSettings.customTones = [];
  });

  it("não renderiza nada quando isSettingsDialogOpen=false", () => {
    mockEditorSettings.isSettingsDialogOpen = false;
    render(<SettingsDialog />);
    expect(screen.queryByText("Configurações")).not.toBeInTheDocument();
  });

  it("abre a barra de ferramentas por padrão e não oferece tons de IA", () => {
    render(<SettingsDialog />);
    expect(
      screen.getByLabelText(TOOLBAR_BUTTON_LABELS.bold),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Opções de Tom e Estilo"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTitle("Cadastrar tom personalizado"),
    ).not.toBeInTheDocument();
  });

  // ── Aba Barra de Ferramentas ───────────────────────────────────────────────
  it('alterna para aba "Barra de Ferramentas" ao clicar', async () => {
    render(<SettingsDialog />);
    fireEvent.click(
      screen.getByRole("button", { name: "Barra de Ferramentas" }),
    );
    await waitFor(() => {
      expect(
        screen.getByText(
          "Selecione quais botões você deseja exibir no cabeçalho do editor.",
        ),
      ).toBeInTheDocument();
    });
  });

  it("exibe lista de checkboxes de botões na aba Barra de Ferramentas", async () => {
    render(<SettingsDialog />);
    fireEvent.click(
      screen.getByRole("button", { name: "Barra de Ferramentas" }),
    );
    await waitFor(() => {
      expect(
        screen.getByLabelText(TOOLBAR_BUTTON_LABELS.bold),
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText(TOOLBAR_BUTTON_LABELS.italic),
      ).toBeInTheDocument();
    });
  });

  it("chama toggleButtonVisibility ao marcar/desmarcar um botão da toolbar", async () => {
    render(<SettingsDialog />);
    fireEvent.click(
      screen.getByRole("button", { name: "Barra de Ferramentas" }),
    );
    await waitFor(() => screen.getByLabelText(TOOLBAR_BUTTON_LABELS.bold));
    fireEvent.click(screen.getByLabelText(TOOLBAR_BUTTON_LABELS.bold));
    expect(mockToggleButtonVisibility).toHaveBeenCalledWith("bold");
  });

  // ── Aba Configurações Gerais ───────────────────────────────────────────────
  it('alterna para aba "Configurações Gerais" ao clicar', async () => {
    render(<SettingsDialog />);
    fireEvent.click(
      screen.getByRole("button", { name: /Configurações Gerais/i }),
    );
    await waitFor(() => {
      expect(
        screen.getByText(/Exibição do rodapé do editor/i),
      ).toBeInTheDocument();
      expect(
        screen.getAllByText(/Corretor do Navegador/i).length,
      ).toBeGreaterThan(0);
    });
  });

  it("chama toggleButtonVisibility para browserSpellcheck na aba Configurações Gerais", async () => {
    render(<SettingsDialog />);
    fireEvent.click(
      screen.getByRole("button", { name: /Configurações Gerais/i }),
    );
    await waitFor(
      () => screen.getAllByText(/Corretor do Navegador/i).length > 0,
    );
    fireEvent.click(screen.getByLabelText(/Corretor do Navegador/i));
    expect(mockToggleButtonVisibility).toHaveBeenCalledWith(
      "browserSpellcheck",
    );
  });

  it.each(["free", "pro", "team"] as const)(
    "não oferece IA local para o plano %s",
    (plan) => {
      render(<SettingsDialog userPlan={plan} />);
      expect(
        screen.getByLabelText(TOOLBAR_BUTTON_LABELS.bold),
      ).toBeInTheDocument();
      expect(screen.queryByText("Novo Tom")).not.toBeInTheDocument();
    },
  );

  // ── Fechar ────────────────────────────────────────────────────────────────
  it("chama setIsSettingsDialogOpen(false) ao clicar em Concluído", () => {
    render(<SettingsDialog />);
    fireEvent.click(screen.getByRole("button", { name: "Concluído" }));
    expect(mockSetIsSettingsDialogOpen).toHaveBeenCalledWith(false);
  });

  it("chama setIsSettingsDialogOpen(false) ao clicar no overlay", () => {
    render(<SettingsDialog />);
    const overlay = document.querySelector(".fixed.inset-0") as HTMLElement;
    fireEvent.click(overlay);
    expect(mockSetIsSettingsDialogOpen).toHaveBeenCalledWith(false);
  });
});
