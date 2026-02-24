import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SideBar } from '@/components/TiptapEditor/components/SideBar'

// ── Navigation mocks ──────────────────────────────────────────────────────────
vi.mock('next/navigation', () => ({
    useRouter: () => ({ push: vi.fn() }),
    useParams: () => ({ locale: 'pt' }),
}))

// ── Sonner mock ────────────────────────────────────────────────────────────────
vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
        info: vi.fn(),
    },
}))

// ── Mock TiptapContext ─────────────────────────────────────────────────────────
const mockSetContent = vi.fn()
const mockSetIsSidebarOpen = vi.fn()

vi.mock('@/components/TiptapEditor/components/Provider', () => ({
    useTiptapContext: () => ({
        editor: { commands: { setContent: mockSetContent } },
        setIsSidebarOpen: mockSetIsSidebarOpen,
    }),
}))

// ── Fetch mock ─────────────────────────────────────────────────────────────────
const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

// ── Sample data ────────────────────────────────────────────────────────────────
const sampleDocs = [
    { id: 'doc-1', title: 'Primeiro Documento', content: '<p>Conteúdo 1</p>', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-15T00:00:00Z' },
    { id: 'doc-2', title: 'Segundo Documento', content: '<p>Conteúdo 2</p>', createdAt: '2026-01-05T00:00:00Z', updatedAt: '2026-01-20T00:00:00Z' },
]

// ── Tests ─────────────────────────────────────────────────────────────────────
describe('SideBar — Meus Documentos', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mockFetch.mockResolvedValue(
            new Response(JSON.stringify({ documents: sampleDocs }), { status: 200 })
        )
    })

    it('não renderiza nada quando isOpen=false', () => {
        render(<SideBar isOpen={false} />)
        expect(screen.queryByText('Meus Documentos')).not.toBeInTheDocument()
    })

    it('chama GET /api/documents ao abrir', async () => {
        render(<SideBar isOpen={true} />)
        await waitFor(() => {
            expect(mockFetch).toHaveBeenCalledWith('/api/documents?limit=100')
        })
    })

    it('exibe spinner durante o carregamento', () => {
        // Make fetch never resolve so loading remains true
        mockFetch.mockImplementation(() => new Promise(() => { }))
        render(<SideBar isOpen={true} />)
        // Spinner is a div with animate-spin
        expect(document.querySelector('.animate-spin')).toBeInTheDocument()
    })

    it('exibe lista de títulos de documentos após retorno da API', async () => {
        render(<SideBar isOpen={true} />)
        await waitFor(() => {
            expect(screen.getByText('Primeiro Documento')).toBeInTheDocument()
            expect(screen.getByText('Segundo Documento')).toBeInTheDocument()
        })
    })

    it('exibe mensagem de lista vazia quando não há documentos', async () => {
        mockFetch.mockResolvedValue(
            new Response(JSON.stringify({ documents: [] }), { status: 200 })
        )
        render(<SideBar isOpen={true} />)
        await waitFor(() => {
            expect(screen.getByText(/Nenhum documento salvo/i)).toBeInTheDocument()
        })
    })

    it('carrega o documento no editor ao clicar no item da lista', async () => {
        render(<SideBar isOpen={true} />)
        await waitFor(() => screen.getByText('Primeiro Documento'))
        fireEvent.click(screen.getByText('Primeiro Documento'))
        expect(mockSetContent).toHaveBeenCalledWith('<p>Conteúdo 1</p>')
    })

    it('exibe botões de confirmar/cancelar ao clicar em excluir', async () => {
        render(<SideBar isOpen={true} />)
        await waitFor(() => screen.getByText('Primeiro Documento'))

        // Hover sobre o item para revelar botão de excluir (fica opacity-0 sem hover em CSS)
        // Clicamos diretamente no botão Trash (mesmo invisível por CSS)
        const trashButtons = document.querySelectorAll('button[class*="hover:text-red"]')
        fireEvent.click(trashButtons[0])

        await waitFor(() => {
            expect(screen.getByText('Excluir?')).toBeInTheDocument()
            expect(screen.getByText('Não')).toBeInTheDocument()
        })
    })

    it('chama DELETE /api/documents/:id ao confirmar exclusão', async () => {
        mockFetch
            .mockResolvedValueOnce(new Response(JSON.stringify({ documents: sampleDocs }), { status: 200 }))
            .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true }), { status: 200 }))

        render(<SideBar isOpen={true} />)
        await waitFor(() => screen.getByText('Primeiro Documento'))

        const trashButtons = document.querySelectorAll('button[class*="hover:text-red"]')
        fireEvent.click(trashButtons[0])
        await waitFor(() => screen.getByText('Excluir?'))
        fireEvent.click(screen.getByText('Excluir?'))

        await waitFor(() => {
            expect(mockFetch).toHaveBeenCalledWith('/api/documents/doc-1', { method: 'DELETE' })
        })
    })

    it('remove documento da lista após exclusão bem-sucedida', async () => {
        mockFetch
            .mockResolvedValueOnce(new Response(JSON.stringify({ documents: sampleDocs }), { status: 200 }))
            .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true }), { status: 200 }))

        render(<SideBar isOpen={true} />)
        await waitFor(() => screen.getByText('Primeiro Documento'))

        const trashButtons = document.querySelectorAll('button[class*="hover:text-red"]')
        fireEvent.click(trashButtons[0])
        await waitFor(() => screen.getByText('Excluir?'))
        fireEvent.click(screen.getByText('Excluir?'))

        await waitFor(() => {
            expect(screen.queryByText('Primeiro Documento')).not.toBeInTheDocument()
            expect(screen.getByText('Segundo Documento')).toBeInTheDocument()
        })
    })

    it('botão de atualizar refaz o fetch', async () => {
        render(<SideBar isOpen={true} />)
        await waitFor(() => screen.getByTitle('Atualizar'))
        fireEvent.click(screen.getByTitle('Atualizar'))
        // Called at least twice: on open + on button click
        await waitFor(() => {
            expect(mockFetch).toHaveBeenCalledTimes(2)
        })
    })

    it('cancela a exclusão ao clicar em Não', async () => {
        render(<SideBar isOpen={true} />)
        await waitFor(() => screen.getByText('Primeiro Documento'))

        const trashButtons = document.querySelectorAll('button[class*="hover:text-red"]')
        fireEvent.click(trashButtons[0])
        await waitFor(() => screen.getByText('Não'))
        fireEvent.click(screen.getByText('Não'))

        expect(screen.queryByText('Excluir?')).not.toBeInTheDocument()
    })
})
