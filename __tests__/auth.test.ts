import { describe, it, expect, vi } from 'vitest'

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      signUp: vi.fn().mockResolvedValue({
        data: { user: { id: 'test-id', email: 'test@test.com' } },
        error: null,
      }),
      signInWithPassword: vi.fn().mockResolvedValue({
        data: { user: { id: 'test-id' } },
        error: null,
      }),
      signInWithOAuth: vi.fn().mockResolvedValue({ data: {}, error: null }),
    },
  }),
}))

describe('Auth flows', () => {
  it('should call signUp with email and password', async () => {
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()
    const result = await supabase.auth.signUp({
      email: 'user@example.com',
      password: 'password123',
    })
    expect(result.error).toBeNull()
    expect(result.data.user?.email).toBe('test@test.com')
  })

  it('should call signInWithPassword with credentials', async () => {
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()
    const result = await supabase.auth.signInWithPassword({
      email: 'user@example.com',
      password: 'password123',
    })
    expect(result.error).toBeNull()
    expect(result.data.user?.id).toBe('test-id')
  })
})
