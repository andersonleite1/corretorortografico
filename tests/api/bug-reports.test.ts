import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '@/app/api/bug-reports/route'
import { NextRequest } from 'next/server'

// ── Hoisted Mocks ─────────────────────────────────────────────────────────────
const { mockBugReportCreate, mockUserFindUnique } = vi.hoisted(() => ({
    mockBugReportCreate: vi.fn(),
    mockUserFindUnique: vi.fn().mockResolvedValue(null),
}))

vi.mock('@clerk/nextjs/server', () => ({
    auth: vi.fn().mockResolvedValue({ userId: null }),
}))

vi.mock('@/lib/db', () => ({
    db: {
        user: {
            findUnique: (...args: any[]) => mockUserFindUnique(...args),
        },
        bugReport: {
            create: (...args: any[]) => mockBugReportCreate(...args),
        },
    },
}))

// ── Tests ─────────────────────────────────────────────────────────────────────
describe('POST /api/bug-reports', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mockBugReportCreate.mockResolvedValue({ id: 'report-123' })
    })

    it('persiste dados válidos e retorna 201', async () => {
        const req = new NextRequest('http://localhost/api/bug-reports', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                description: 'O botão de exportação não funciona',
                additionalInfo: 'Acontece no Chrome',
                wantsNotification: false,
                notificationEmail: null,
                pageUrl: 'https://editordetexto.online/editor',
            }),
        })

        const response = await POST(req)
        const json = await response.json()

        expect(response.status).toBe(201)
        expect(json.id).toBe('report-123')
        expect(mockBugReportCreate).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    description: 'O botão de exportação não funciona',
                    wantsNotification: false,
                }),
            })
        )
    })

    it('retorna 400 quando a descrição está vazia', async () => {
        const req = new NextRequest('http://localhost/api/bug-reports', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                description: '',
                wantsNotification: false,
            }),
        })

        const response = await POST(req)
        expect(response.status).toBe(400)
    })

    it('retorna 400 quando wantsNotification=true mas notificationEmail está ausente', async () => {
        const req = new NextRequest('http://localhost/api/bug-reports', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                description: 'Descrição válida do problema',
                wantsNotification: true,
                notificationEmail: null,
            }),
        })

        const response = await POST(req)
        expect(response.status).toBe(400)
    })

    it('aceita report sem informações adicionais (campo opcional)', async () => {
        const req = new NextRequest('http://localhost/api/bug-reports', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                description: 'Problema simples detectado',
                wantsNotification: false,
            }),
        })

        const response = await POST(req)
        expect(response.status).toBe(201)
    })

    it('salva o e-mail de notificação quando wantsNotification=true e e-mail válido', async () => {
        const req = new NextRequest('http://localhost/api/bug-reports', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                description: 'Bug com notificação por e-mail',
                wantsNotification: true,
                notificationEmail: 'user@example.com',
            }),
        })

        const response = await POST(req)
        expect(response.status).toBe(201)
        expect(mockBugReportCreate).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    notificationEmail: 'user@example.com',
                    wantsNotification: true,
                }),
            })
        )
    })

    it('retorna 400 quando o e-mail de notificação é inválido', async () => {
        const req = new NextRequest('http://localhost/api/bug-reports', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                description: 'Descrição válida do problema',
                wantsNotification: true,
                notificationEmail: 'nao-e-um-email',
            }),
        })

        const response = await POST(req)
        expect(response.status).toBe(400)
    })

    it('retorna 500 quando o banco de dados lança um erro', async () => {
        mockBugReportCreate.mockRejectedValue(new Error('DB connection failed'))

        const req = new NextRequest('http://localhost/api/bug-reports', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                description: 'Algum problema que será reportado',
                wantsNotification: false,
            }),
        })

        const response = await POST(req)
        expect(response.status).toBe(500)
    })
})
