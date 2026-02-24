import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BugReportDialog } from '@/components/shared/BugReportDialog'

// ── Global fetch mock ─────────────────────────────────────────────────────────
const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

// ── Helpers ───────────────────────────────────────────────────────────────────
function renderDialog(isOpen = true, onClose = vi.fn()) {
    return render(
        <BugReportDialog
            isOpen={isOpen}
            onClose={onClose}
            pageUrl="https://editordetexto.online/editor"
        />
    )
}

// ── Tests ─────────────────────────────────────────────────────────────────────
describe('BugReportDialog', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mockFetch.mockResolvedValue(
            new Response(JSON.stringify({ id: 'report-1' }), { status: 201 })
        )
    })

    // ── Rendering ──────────────────────────────────────────────────────────────
    it('renders o formulário quando isOpen=true', () => {
        renderDialog(true)
        expect(screen.getByText('Reportar Problema')).toBeInTheDocument()
        expect(screen.getByLabelText(/Descrição breve/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/Informações adicionais/i)).toBeInTheDocument()
    })

    it('não renderiza nada quando isOpen=false', () => {
        renderDialog(false)
        expect(screen.queryByText('Reportar Problema')).not.toBeInTheDocument()
    })

    // ── Validação: campo de descrição ─────────────────────────────────────────
    it('exibe erro quando a descrição está vazia ao submeter', async () => {
        renderDialog(true)
        fireEvent.click(screen.getByRole('button', { name: /Enviar Relatório/i }))
        await waitFor(() => {
            expect(screen.getByText(/descreva o problema brevemente/i)).toBeInTheDocument()
        })
    })

    it('exibe erro quando a descrição tem menos de 10 caracteres', async () => {
        renderDialog(true)
        await userEvent.type(screen.getByLabelText(/Descrição breve/i), 'Curta')
        fireEvent.click(screen.getByRole('button', { name: /Enviar Relatório/i }))
        await waitFor(() => {
            expect(screen.getByText(/pelo menos 10 caracteres/i)).toBeInTheDocument()
        })
    })

    // ── Campo de e-mail condicional ────────────────────────────────────────────
    it('não exibe campo de e-mail por padrão', () => {
        renderDialog(true)
        expect(screen.queryByLabelText(/Seu e-mail/i)).not.toBeInTheDocument()
    })

    it('exibe campo de e-mail quando checkbox de notificação é marcado', async () => {
        renderDialog(true)
        await userEvent.click(screen.getByRole('checkbox'))
        expect(screen.getByLabelText(/Seu e-mail/i)).toBeInTheDocument()
    })

    it('exibe erro quando e-mail inválido é fornecido', async () => {
        renderDialog(true)
        await userEvent.type(screen.getByLabelText(/Descrição breve/i), 'Descrição com mais de dez caracteres')
        await userEvent.click(screen.getByRole('checkbox'))
        await userEvent.type(screen.getByLabelText(/Seu e-mail/i), 'email-invalido')
        fireEvent.click(screen.getByRole('button', { name: /Enviar Relatório/i }))
        await waitFor(() => {
            expect(screen.getByText(/e-mail válido/i)).toBeInTheDocument()
        })
    })

    it('exibe erro quando checkbox marcado mas e-mail está vazio', async () => {
        renderDialog(true)
        await userEvent.type(screen.getByLabelText(/Descrição breve/i), 'Descrição com mais de dez caracteres')
        await userEvent.click(screen.getByRole('checkbox'))
        fireEvent.click(screen.getByRole('button', { name: /Enviar Relatório/i }))
        await waitFor(() => {
            expect(screen.getByText(/Informe seu e-mail/i)).toBeInTheDocument()
        })
    })

    // ── Submissão bem-sucedida ──────────────────────────────────────────────────
    it('chama POST /api/bug-reports com os dados corretos ao submeter', async () => {
        renderDialog(true)
        await userEvent.type(screen.getByLabelText(/Descrição breve/i), 'Descrição válida com mais de 10 chars')
        await userEvent.type(screen.getByLabelText(/Informações adicionais/i), 'Informação extra')
        fireEvent.click(screen.getByRole('button', { name: /Enviar Relatório/i }))

        await waitFor(() => {
            expect(mockFetch).toHaveBeenCalledWith('/api/bug-reports', expect.objectContaining({
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: expect.stringContaining('Descrição válida'),
            }))
        })
    })

    it('exibe tela de sucesso após envio bem-sucedido', async () => {
        renderDialog(true)
        await userEvent.type(screen.getByLabelText(/Descrição breve/i), 'Descrição válida com mais de 10 chars')
        fireEvent.click(screen.getByRole('button', { name: /Enviar Relatório/i }))

        await waitFor(() => {
            expect(screen.getByText(/Obrigado pelo reporte/i)).toBeInTheDocument()
        })
    })

    it('mostra o e-mail informado na tela de sucesso quando notificação está ativa', async () => {
        renderDialog(true)
        await userEvent.type(screen.getByLabelText(/Descrição breve/i), 'Descrição válida com mais de 10 chars')
        await userEvent.click(screen.getByRole('checkbox'))
        await userEvent.type(screen.getByLabelText(/Seu e-mail/i), 'user@example.com')
        fireEvent.click(screen.getByRole('button', { name: /Enviar Relatório/i }))

        await waitFor(() => {
            expect(screen.getByText('user@example.com')).toBeInTheDocument()
        })
    })

    // ── Fechamento e reset ──────────────────────────────────────────────────────
    it('chama onClose e reseta formulário ao clicar em Cancelar', async () => {
        const onClose = vi.fn()
        renderDialog(true, onClose)
        await userEvent.type(screen.getByLabelText(/Descrição breve/i), 'Algum texto digitado')
        fireEvent.click(screen.getByRole('button', { name: /Cancelar/i }))

        expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('fecha o modal ao clicar no overlay', async () => {
        const onClose = vi.fn()
        renderDialog(true, onClose)
        // O overlay é o elemento pai com role="dialog" / o fundo escuro
        const overlay = document.querySelector('.fixed.inset-0') as HTMLElement
        expect(overlay).not.toBeNull()
        fireEvent.click(overlay)
        expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('fecha o modal ao clicar no botão X', async () => {
        const onClose = vi.fn()
        renderDialog(true, onClose)
        fireEvent.click(screen.getByLabelText(/Fechar diálogo/i))
        expect(onClose).toHaveBeenCalledTimes(1)
    })

    // ── Erro da API ────────────────────────────────────────────────────────────
    it('exibe erro genérico quando a API retorna status de erro', async () => {
        mockFetch.mockResolvedValue(
            new Response(JSON.stringify({ error: 'Erro interno ao registrar o problema.' }), { status: 500 })
        )
        renderDialog(true)
        await userEvent.type(screen.getByLabelText(/Descrição breve/i), 'Descrição válida com mais de 10 chars')
        fireEvent.click(screen.getByRole('button', { name: /Enviar Relatório/i }))

        await waitFor(() => {
            expect(screen.getByText(/Erro interno ao registrar o problema/i)).toBeInTheDocument()
        })
    })
})
