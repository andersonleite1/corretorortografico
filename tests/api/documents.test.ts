import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET, POST } from '@/app/api/documents/route'
import { DELETE } from '@/app/api/documents/[id]/route'

// ── Hoisted Mocks ─────────────────────────────────────────────────────────────
const {
    mockFindManyDocs,
    mockCountDocs,
    mockCreateDoc,
    mockUpdateDoc,
    mockDeleteDoc,
    mockGetCurrentUser,
    mockGetUserPlan
} = vi.hoisted(() => ({
    mockFindManyDocs: vi.fn(),
    mockCountDocs: vi.fn(),
    mockCreateDoc: vi.fn(),
    mockUpdateDoc: vi.fn(),
    mockDeleteDoc: vi.fn(),
    mockGetCurrentUser: vi.fn(),
    mockGetUserPlan: vi.fn(),
}))

vi.mock('react', () => ({
    cache: (fn: any) => fn,
}))

vi.mock('@clerk/nextjs/server', () => ({
    auth: vi.fn().mockResolvedValue({ userId: 'test_user_id' }),
}))

vi.mock('@/lib/auth', () => ({
    getCurrentUser: mockGetCurrentUser,
    getUserPlan: mockGetUserPlan,
}))

vi.mock('@/lib/db', () => ({
    db: {
        document: {
            findMany: (...args: any[]) => mockFindManyDocs(...args),
            count: (...args: any[]) => mockCountDocs(...args),
            create: (...args: any[]) => mockCreateDoc(...args),
            update: (...args: any[]) => mockUpdateDoc(...args),
            delete: (...args: any[]) => mockDeleteDoc(...args),
        },
    },
}))

// ── Tests ─────────────────────────────────────────────────────────────────────
describe('api/documents', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        // Default: Pro user
        mockGetCurrentUser.mockResolvedValue({ id: 'user_id' })
        mockGetUserPlan.mockResolvedValue('pro')

        mockFindManyDocs.mockResolvedValue([{ id: '1', title: 'Doc 1', content: '...' }])
        mockCountDocs.mockResolvedValue(1)
        mockCreateDoc.mockResolvedValue({ id: 'new-doc', title: 'New Doc', content: '{}' })
        mockUpdateDoc.mockResolvedValue({ id: '1', title: 'Updated Doc' })
        mockDeleteDoc.mockResolvedValue({ id: '1' })
    })

    describe('GET /api/documents', () => {
        it('should return documents for authenticated user', async () => {
            const mockRequest = new Request('http://localhost:3000/api/documents?page=1&limit=10')
            const response = await GET(mockRequest)
            const json = await response.json()

            expect(response.status).toBe(200)
            expect(json.documents).toHaveLength(1)
        })

        it('should cap the limit parameter to maximum 100', async () => {
            const mockRequest = new Request('http://localhost:3000/api/documents?page=1&limit=1000')
            const response = await GET(mockRequest)

            expect(response.status).toBe(200)
            expect(mockFindManyDocs).toHaveBeenCalledWith(
                expect.objectContaining({
                    take: 100
                })
            )
        })
    })

    describe('POST /api/documents', () => {
        it('should create a new document when no id is provided and user is Pro', async () => {
            const mockRequest = new Request('http://localhost:3000/api/documents', {
                method: 'POST',
                body: JSON.stringify({
                    title: 'New Doc',
                    content: '{"type":"doc","content":[]}'
                })
            })
            const response = await POST(mockRequest)
            expect(response.status).toBe(200)
            const json = await response.json()
            expect(json.id).toBe('new-doc')
        })

        it('should return 403 if user is Free', async () => {
            mockGetUserPlan.mockResolvedValueOnce('free')

            const mockRequest = new Request('http://localhost:3000/api/documents', {
                method: 'POST',
                body: JSON.stringify({
                    title: 'New Doc',
                    content: '{"type":"doc","content":[]}'
                })
            })
            const response = await POST(mockRequest)
            expect(response.status).toBe(403)
        })

        it('should update an existing document when id is provided', async () => {
            const mockRequest = new Request('http://localhost:3000/api/documents', {
                method: 'POST',
                body: JSON.stringify({
                    id: 'cjld2cyuq0000t3pz762779at',
                    title: 'Updated Doc',
                    content: '{"type":"doc","content":[]}'
                })
            })
            const response = await POST(mockRequest)
            expect(response.status).toBe(200)
        })

        it('should return 400 if content is missing or invalid', async () => {
            const mockRequest = new Request('http://localhost:3000/api/documents', {
                method: 'POST',
                body: JSON.stringify({ title: 'No content' })
            })
            const response = await POST(mockRequest)
            expect(response.status).toBe(400)
        })
    })

    describe('DELETE /api/documents/[id]', () => {
        it('should delete a document', async () => {
            const mockRequest = new Request('http://localhost:3000/api/documents/1')
            // @ts-ignore - mock params
            const response = await DELETE(mockRequest, { params: { id: '1' } })

            expect(response.status).toBe(200)
            expect(mockDeleteDoc).toHaveBeenCalledWith({
                where: { id: '1', userId: 'user_id' }
            })
        })
    })
})
