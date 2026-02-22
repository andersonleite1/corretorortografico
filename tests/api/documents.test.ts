import { describe, it, expect, vi } from 'vitest'
import { createMocks } from 'node-mocks-http'
import { GET } from '@/app/api/documents/route'

// Mock react cache
vi.mock('react', () => ({
    cache: (fn: any) => fn,
}))

// Mock the clerk auth
vi.mock('@clerk/nextjs/server', () => ({
    auth: () => ({ userId: 'test_user_id' }),
}))

// Mock the database
vi.mock('@/lib/db', () => ({
    db: {
        user: {
            findUnique: vi.fn().mockResolvedValue({ id: 'user_id', subscription: null }),
        },
        document: {
            findMany: vi.fn().mockResolvedValue([
                { id: '1', title: 'Doc 1', content: '...' },
            ]),
            count: vi.fn().mockResolvedValue(1),
        },
    },
}))

describe('GET /api/documents', () => {
    it('should return documents for authenticated user', async () => {
        // Create a mock request
        const mockRequest = new Request('http://localhost:3000/api/documents?page=1&limit=10')
        const response = await GET(mockRequest)
        const json = await response.json()

        expect(response.status).toBe(200)
        expect(json.documents).toHaveLength(1)
        expect(json.metadata.totalCount).toBe(1)
    })

    it('should cap the limit parameter to maximum 100', async () => {
        const mockRequest = new Request('http://localhost:3000/api/documents?page=1&limit=1000')
        const response = await GET(mockRequest)

        expect(response.status).toBe(200)
        const { db } = await import('@/lib/db')
        expect(db.document.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                take: 100 // This asserts the limit was capped at 100 instead of 1000
            })
        )
    })
})
