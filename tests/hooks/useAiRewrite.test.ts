import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAiRewrite } from '@/components/TiptapEditor/hooks/useAiRewrite'

// ── Mocks ─────────────────────────────────────────────────────────────────────

// Mock the TiptapContext so the hook can read the editor
const mockEditor = {
    state: {
        doc: {
            textBetween: vi.fn().mockReturnValue('texto selecionado'),
        },
        selection: { from: 0, to: 17 },
    },
    getText: vi.fn().mockReturnValue('texto completo do editor'),
    chain: vi.fn().mockReturnValue({
        focus: vi.fn().mockReturnThis(),
        deleteRange: vi.fn().mockReturnThis(),
        insertContent: vi.fn().mockReturnThis(),
        setContent: vi.fn().mockReturnThis(),
        run: vi.fn(),
    }),
}

vi.mock('@/components/TiptapEditor/components/Provider', () => ({
    useTiptapContext: () => ({ editor: mockEditor }),
}))

// Mock @ai-sdk/react useCompletion
const mockComplete = vi.fn()
const mockSetCompletion = vi.fn()

vi.mock('@ai-sdk/react', () => ({
    useCompletion: vi.fn(() => ({
        complete: mockComplete,
        completion: 'Texto reescrito pelo mock da IA',
        isLoading: false,
        setCompletion: mockSetCompletion,
    })),
}))

// ── Helpers ───────────────────────────────────────────────────────────────────
function setupHook() {
    return renderHook(() => useAiRewrite())
}

// ── Tests ─────────────────────────────────────────────────────────────────────
describe('useAiRewrite', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('handleRewrite', () => {
        it('chama complete() com o texto selecionado e toneId quando scope="selection"', async () => {
            const { result } = setupHook()
            act(() => {
                result.current.handleRewrite('formal', undefined, 'selection')
            })
            expect(mockComplete).toHaveBeenCalledWith('', {
                body: { text: 'texto selecionado', tone: 'formal', customInstructions: undefined, language: 'pt-BR' },
            })
        })

        it('chama complete() com texto completo quando scope="all"', () => {
            const { result } = setupHook()
            act(() => {
                result.current.handleRewrite('casual', undefined, 'all')
            })
            expect(mockEditor.getText).toHaveBeenCalled()
            expect(mockComplete).toHaveBeenCalledWith('', {
                body: { text: 'texto completo do editor', tone: 'casual', customInstructions: undefined, language: 'pt-BR' },
            })
        })

        it('não chama complete() quando o texto está vazio', () => {
            mockEditor.state.doc.textBetween.mockReturnValueOnce('   ')
            const { result } = setupHook()
            act(() => {
                result.current.handleRewrite('formal', undefined, 'selection')
            })
            expect(mockComplete).not.toHaveBeenCalled()
        })

        it('passes customInstructions corretamente para complete()', () => {
            const { result } = setupHook()
            act(() => {
                result.current.handleRewrite('custom-tone', 'Seja muito criativo', 'all')
            })
            expect(mockComplete).toHaveBeenCalledWith('', {
                body: {
                    text: 'texto completo do editor',
                    tone: 'custom-tone',
                    customInstructions: 'Seja muito criativo',
                    language: 'pt-BR',
                },
            })
        })

        it('define showPreview como true após iniciar reescrita', () => {
            const { result } = setupHook()
            act(() => {
                result.current.handleRewrite('formal', undefined, 'all')
            })
            expect(result.current.showPreview).toBe(true)
        })

        it('reseta completion ao iniciar nova reescrita', () => {
            const { result } = setupHook()
            act(() => {
                result.current.handleRewrite('formal', undefined, 'all')
            })
            expect(mockSetCompletion).toHaveBeenCalledWith('')
        })
    })

    describe('handleAccept', () => {
        it('substitui o conteúdo do editor e reseta showPreview com scope="all"', () => {
            const chain = mockEditor.chain()
            const { result } = setupHook()
            // First trigger rewrite to set showPreview
            act(() => result.current.handleRewrite('formal', undefined, 'all'))
            act(() => result.current.handleAccept('all'))
            expect(chain.setContent).toHaveBeenCalled()
            expect(result.current.showPreview).toBe(false)
        })

        it('insere no range selecionado com scope="selection"', () => {
            const chain = mockEditor.chain()
            const { result } = setupHook()
            act(() => result.current.handleRewrite('formal', undefined, 'selection'))
            act(() => result.current.handleAccept('selection'))
            expect(chain.deleteRange).toHaveBeenCalledWith({ from: 0, to: 17 })
            expect(chain.insertContent).toHaveBeenCalled()
        })
    })

    describe('handleDiscard', () => {
        it('reseta completion e showPreview sem alterar o editor', () => {
            const { result } = setupHook()
            act(() => result.current.handleRewrite('formal', undefined, 'all'))
            act(() => result.current.handleDiscard())
            expect(mockSetCompletion).toHaveBeenLastCalledWith('')
            expect(result.current.showPreview).toBe(false)
        })
    })
})
