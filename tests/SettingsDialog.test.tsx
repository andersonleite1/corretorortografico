import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SettingsDialog } from '@/components/shared/SettingsDialog'
import {
    DEFAULT_SETTINGS,
    DEFAULT_TONES,
    TOOLBAR_BUTTON_LABELS,
    TONE_LABELS,
} from '@/components/providers/EditorSettingsProvider'

// ── Mocks ─────────────────────────────────────────────────────────────────────
const mockToggleButtonVisibility = vi.fn()
const mockToggleToneActivation = vi.fn()
const mockAddCustomTone = vi.fn()
const mockDeleteCustomTone = vi.fn()
const mockToggleCustomToneActivation = vi.fn()
const mockSetIsSettingsDialogOpen = vi.fn()

const mockEditorSettings = {
    isSettingsDialogOpen: true,
    setIsSettingsDialogOpen: mockSetIsSettingsDialogOpen,
    buttonVisibility: { ...DEFAULT_SETTINGS },
    toggleButtonVisibility: mockToggleButtonVisibility,
    activeTones: { ...DEFAULT_TONES },
    toggleToneActivation: mockToggleToneActivation,
    customTones: [],
    addCustomTone: mockAddCustomTone,
    deleteCustomTone: mockDeleteCustomTone,
    toggleCustomToneActivation: mockToggleCustomToneActivation,
    isLoadingSettings: false,
}

vi.mock('@/components/providers/EditorSettingsProvider', async (importOriginal) => {
    const original = await importOriginal() as any
    return {
        ...original,
        useEditorSettings: () => mockEditorSettings,
    }
})

// Mock Icon component
vi.mock('@/components/TiptapEditor/components/ui/Icon', () => ({
    Icon: ({ name }: { name: string }) => <span data-testid={`icon-${name}`} />,
}))

// ── Tests ─────────────────────────────────────────────────────────────────────
describe('SettingsDialog', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mockEditorSettings.isSettingsDialogOpen = true
        mockEditorSettings.customTones = []
    })

    it('não renderiza nada quando isSettingsDialogOpen=false', () => {
        mockEditorSettings.isSettingsDialogOpen = false
        render(<SettingsDialog />)
        expect(screen.queryByText('Configurações')).not.toBeInTheDocument()
    })

    it('renderiza aba "Opções de Tom e Estilo" por padrão', () => {
        render(<SettingsDialog />)
        expect(screen.getByText('Opções de Tom e Estilo')).toBeInTheDocument()
    })

    it('exibe todos os tons padrão na aba de tons', () => {
        render(<SettingsDialog />)
        const toneNames = Object.values(TONE_LABELS)
        toneNames.forEach(label => {
            expect(screen.getByText(label)).toBeInTheDocument()
        })
    })

    it('chama toggleToneActivation ao clicar em um tom padrão', async () => {
        render(<SettingsDialog />)
        const toneIds = Object.keys(DEFAULT_TONES)
        // Click first tone card button
        const toneLabel = TONE_LABELS[toneIds[0] as keyof typeof TONE_LABELS]
        const toneButton = screen.getByText(toneLabel).closest('button')!
        fireEvent.click(toneButton)
        expect(mockToggleToneActivation).toHaveBeenCalledWith(toneIds[0])
    })

    it('exibe botão "Novo Tom" quando há menos de 5 tons personalizados', () => {
        mockEditorSettings.customTones = []
        render(<SettingsDialog />)
        expect(screen.getByTitle('Cadastrar tom personalizado')).toBeInTheDocument()
    })

    it('não exibe botão "Novo Tom" quando há 5 tons personalizados', () => {
        mockEditorSettings.customTones = [
            { id: '1', name: 'Tom 1', description: 'Desc', instructions: 'Inst', isActive: true },
            { id: '2', name: 'Tom 2', description: 'Desc', instructions: 'Inst', isActive: true },
            { id: '3', name: 'Tom 3', description: 'Desc', instructions: 'Inst', isActive: true },
            { id: '4', name: 'Tom 4', description: 'Desc', instructions: 'Inst', isActive: true },
            { id: '5', name: 'Tom 5', description: 'Desc', instructions: 'Inst', isActive: true },
        ]
        render(<SettingsDialog />)
        expect(screen.queryByTitle('Cadastrar tom personalizado')).not.toBeInTheDocument()
    })

    it('abre modal de criação ao clicar em "Novo Tom"', async () => {
        render(<SettingsDialog />)
        fireEvent.click(screen.getByTitle('Cadastrar tom personalizado'))
        await waitFor(() => {
            expect(screen.getByText('Cadastrar tom personalizado')).toBeInTheDocument()
            expect(screen.getByPlaceholderText(/Ex: Divertido/i)).toBeInTheDocument()
        })
    })

    it('chama addCustomTone com dados corretos ao criar tom personalizado', async () => {
        render(<SettingsDialog />)
        fireEvent.click(screen.getByTitle('Cadastrar tom personalizado'))

        await userEvent.type(screen.getByPlaceholderText(/Ex: Divertido/i), 'Meu Tom')
        await userEvent.type(screen.getByPlaceholderText(/Máximo 20 caracteres/i), 'Descrição curta')
        await userEvent.type(screen.getByPlaceholderText(/Instruções para a IA/i), 'Escreva de forma criativa e envolvente')

        fireEvent.click(screen.getByRole('button', { name: 'Criar Tom' }))

        await waitFor(() => {
            expect(mockAddCustomTone).toHaveBeenCalledWith({
                name: 'Meu Tom',
                description: 'Descrição curta',
                instructions: 'Escreva de forma criativa e envolvente',
            })
        })
    })

    it('exibe tons personalizados existentes', () => {
        mockEditorSettings.customTones = [
            { id: 'c1', name: 'Tom Criativo', description: 'Criativo', instructions: 'Seja criativo', isActive: true },
        ]
        render(<SettingsDialog />)
        expect(screen.getByText('Tom Criativo')).toBeInTheDocument()
    })

    // ── Aba Barra de Ferramentas ───────────────────────────────────────────────
    it('alterna para aba "Barra de Ferramentas" ao clicar', async () => {
        render(<SettingsDialog />)
        fireEvent.click(screen.getByText('Barra de Ferramentas'))
        await waitFor(() => {
            expect(screen.getByText('Selecione quais botões você deseja exibir no cabeçalho do editor.')).toBeInTheDocument()
        })
    })

    it('exibe lista de checkboxes de botões na aba Barra de Ferramentas', async () => {
        render(<SettingsDialog />)
        fireEvent.click(screen.getByText('Barra de Ferramentas'))
        await waitFor(() => {
            expect(screen.getByLabelText(TOOLBAR_BUTTON_LABELS.bold)).toBeInTheDocument()
            expect(screen.getByLabelText(TOOLBAR_BUTTON_LABELS.italic)).toBeInTheDocument()
        })
    })

    it('chama toggleButtonVisibility ao marcar/desmarcar um botão da toolbar', async () => {
        render(<SettingsDialog />)
        fireEvent.click(screen.getByText('Barra de Ferramentas'))
        await waitFor(() => screen.getByLabelText(TOOLBAR_BUTTON_LABELS.bold))
        fireEvent.click(screen.getByLabelText(TOOLBAR_BUTTON_LABELS.bold))
        expect(mockToggleButtonVisibility).toHaveBeenCalledWith('bold')
    })

    // ── Aba Configurações Gerais ───────────────────────────────────────────────
    it('alterna para aba "Conf. Gerais" ao clicar', async () => {
        render(<SettingsDialog />)
        fireEvent.click(screen.getByText('Conf. Gerais'))
        await waitFor(() => {
            expect(screen.getByText('Exibição do rodapé do editor')).toBeInTheDocument()
            expect(screen.getByText('Corretor do navegador')).toBeInTheDocument()
        })
    })

    it('chama toggleButtonVisibility para browserSpellcheck na aba Conf. Gerais', async () => {
        render(<SettingsDialog />)
        fireEvent.click(screen.getByText('Conf. Gerais'))
        await waitFor(() => screen.getByText('Corretor do navegador'))
        fireEvent.click(screen.getByLabelText(TOOLBAR_BUTTON_LABELS.browserSpellcheck))
        expect(mockToggleButtonVisibility).toHaveBeenCalledWith('browserSpellcheck')
    })

    // ── Fechar ────────────────────────────────────────────────────────────────
    it('chama setIsSettingsDialogOpen(false) ao clicar em Concluído', () => {
        render(<SettingsDialog />)
        fireEvent.click(screen.getByRole('button', { name: 'Concluído' }))
        expect(mockSetIsSettingsDialogOpen).toHaveBeenCalledWith(false)
    })

    it('chama setIsSettingsDialogOpen(false) ao clicar no overlay', () => {
        render(<SettingsDialog />)
        const overlay = document.querySelector('.fixed.inset-0') as HTMLElement
        fireEvent.click(overlay)
        expect(mockSetIsSettingsDialogOpen).toHaveBeenCalledWith(false)
    })
})
