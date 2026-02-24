import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import MenuBar from '@/components/TiptapEditor/components/MenuBar'

// ── Hoisted Mocks ─────────────────────────────────────────────────────────────
const { mockEditor, mockRun } = vi.hoisted(() => {
    const run = vi.fn()
    const editor = {
        can: () => ({
            chain: () => ({
                focus: () => ({
                    toggleBold: () => ({ run }),
                    toggleItalic: () => ({ run }),
                    undo: () => ({ run }),
                    redo: () => ({ run }),
                }),
            }),
        }),
        chain: () => ({
            focus: () => ({
                toggleBold: () => ({ run }),
                toggleItalic: () => ({ run }),
                undo: () => ({ run }),
                redo: () => ({ run }),
            }),
        }),
        isActive: vi.fn().mockReturnValue(false),
    }
    return { mockEditor: editor, mockRun: run }
})

vi.mock('@clerk/nextjs', () => ({
    useAuth: () => ({
        isSignedIn: true,
        userId: 'test-user',
    }),
    useUser: () => ({
        user: { id: 'test-user', fullName: 'Test User' },
    }),
}))

vi.mock('@/components/TiptapEditor/components/Provider', () => ({
    useTiptapContext: () => ({
        editor: mockEditor,
        contentElement: { current: document.createElement('div') },
        locale: 'pt',
        userPlan: 'free',
        exportActions: {},
        draftActions: { drafts: [] },
        isLTSidebarOpen: false,
        setIsLTSidebarOpen: vi.fn(),
        setIsSidebarOpen: vi.fn(),
        onSaveDocument: vi.fn(),
        messages: {
            toolbar: {
                bold: 'Negrito',
                italic: 'Itálico',
                undo: 'Desfazer',
                redo: 'Refazer',
            }
        }
    }),
}))

const mockButtonVisibility = {
    bold: true,
    italic: true,
    undo: true,
    redo: true,
    save: true,
}

vi.mock('@/components/providers/EditorSettingsProvider', async (importOriginal) => {
    const actual = await importOriginal() as any
    return {
        ...actual,
        useEditorSettings: () => ({
            buttonVisibility: mockButtonVisibility,
        }),
    }
})

vi.mock('@/components/TiptapEditor/components/Tooltip', () => ({
    Tooltip: ({ children }: any) => <div>{children}</div>
}))

// Mock all button components to use the mockEditor directly
vi.mock('@/components/TiptapEditor/components/controls/BoldButton', () => ({
    default: () => <button onClick={() => mockEditor.chain().focus().toggleBold().run()}>Bold</button>
}))
vi.mock('@/components/TiptapEditor/components/controls/ItalicButton', () => ({
    default: () => <button onClick={() => mockEditor.chain().focus().toggleItalic().run()}>Italic</button>
}))
vi.mock('@/components/TiptapEditor/components/controls/UndoButton', () => ({
    default: () => <button onClick={() => mockEditor.chain().focus().undo().run()}>Undo</button>
}))
vi.mock('@/components/TiptapEditor/components/controls/RedoButton', () => ({
    default: () => <button onClick={() => mockEditor.chain().focus().redo().run()}>Redo</button>
}))

describe('MenuBar', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mockButtonVisibility.bold = true
        mockButtonVisibility.italic = true
        mockButtonVisibility.undo = true
        mockButtonVisibility.redo = true
        mockButtonVisibility.save = true
    })

    it('renderiza os botões básicos quando a visibilidade está ativa', () => {
        render(<MenuBar />)
        expect(screen.getByText('Bold')).toBeInTheDocument()
        expect(screen.getByText('Italic')).toBeInTheDocument()
        expect(screen.getByText('Undo')).toBeInTheDocument()
        expect(screen.getByText('Redo')).toBeInTheDocument()
    })

    it('não renderiza o botão Negrito quando buttonVisibility.bold = false', () => {
        mockButtonVisibility.bold = false
        render(<MenuBar />)
        expect(screen.queryByText('Bold')).not.toBeInTheDocument()
    })

    it('chama o comando correto do editor ao clicar no botão', () => {
        render(<MenuBar />)
        fireEvent.click(screen.getByText('Bold'))
        expect(mockRun).toHaveBeenCalled()
    })
})
