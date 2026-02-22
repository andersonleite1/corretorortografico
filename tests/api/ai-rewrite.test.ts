import { describe, it, expect, vi } from 'vitest'
import { POST } from '@/app/api/ai/rewrite/route'

// Mock the clerk auth
vi.mock('@clerk/nextjs/server', () => ({
    auth: () => ({ userId: 'test_user_id' }),
}))

// Mock the database
vi.mock('@/lib/db', () => ({
    db: {
        user: {
            findUnique: vi.fn().mockResolvedValue({ id: 'db_test_user_id', subscription: { plan: 'free' } }),
        },
    },
}))

// Mock the AI rate limit
vi.mock('@/lib/ai-rate-limit', () => ({
    checkAiRateLimit: vi.fn().mockResolvedValue({ allowed: false }), // we will mock allowed: false to test bounds
}))

describe('POST /api/ai/rewrite', () => {
    it('should reject request when rate limit exceeded', async () => {
        const mockRequest = new Request('http://localhost:3000/api/ai/rewrite', {
            method: 'POST',
            body: JSON.stringify({
                action: 'improve',
                content: 'hello',
            })
        })

        const response = await POST(mockRequest)
        expect(response.status).toBe(429) // 429 Too Many Requests

        const json = await response.json()
        expect(json.error).toBe('Limite de uso gratuito atingido.')
    })
})
